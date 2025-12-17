// /src/context/CategoriesEditorContext.tsx
import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import { CATEGORY_CONFIG, type CategoryKey } from "../constant/data";
import { supabase } from "../supabase/supabase";
import toast from "react-hot-toast";

/* ---------- Types ---------- */
export type Slide = { id: number };

export type TextElement = {
  id: string; slideId: number; x: number; y: number; width: number; height: number;
  text: string; bold?: boolean; italic?: boolean; fontSize?: number; fontFamily?: string; color?: string;
};
export type ImageElement = {
  id: string; slideId: number; x: number; y: number; width: number; height: number; src: string;
};
export type StickerElement = {
  id: string; slideId: number; x: number; y: number; width: number; height: number; sticker: string; zIndex?: number;
};

export type SnapshotTextEl = TextElement & { type: "text" };
export type SnapshotImageEl = ImageElement & { type: "image" };
export type SnapshotStickerEl = StickerElement & { type: "sticker" };
export type SnapshotAnyEl = SnapshotTextEl | SnapshotImageEl | SnapshotStickerEl;

export type SnapshotSlide = {
  id: number;
  label: string;
  elements: SnapshotAnyEl[];
};

type CategoriesEditorContextType = {
  category: CategoryKey;
  setCategory: (c: CategoryKey) => void;
  config: (typeof CATEGORY_CONFIG)[CategoryKey];
  selectedSlide: number; setSelectedSlide: React.Dispatch<React.SetStateAction<number>>;
  selectedTextId: string | null; setSelectedTextId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedImageId: string | null; setSelectedImageId: React.Dispatch<React.SetStateAction<string | null>>;
  textToolOn: boolean; setTextToolOn: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  slides: Slide[]; setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;

  textElements: TextElement[]; setTextElements: React.Dispatch<React.SetStateAction<TextElement[]>>;
  imageElements: ImageElement[]; setImageElements: React.Dispatch<React.SetStateAction<ImageElement[]>>;
  stickerElements: StickerElement[]; setStickerElements: React.Dispatch<React.SetStateAction<StickerElement[]>>;

  getTexts: (slideId: number) => TextElement[];
  getImages: (slideId: number) => ImageElement[];
  getStickers: (slideId: number) => StickerElement[];

  getSlidesWithElements: () => SnapshotSlide[];

  serialize: () => {
    category: CategoryKey;
    config: (typeof CATEGORY_CONFIG)[CategoryKey];
    slides: Slide[];
    textElements: TextElement[];
    imageElements: ImageElement[];
    stickerElements: StickerElement[];
  };
  serializeWithElements: () => {
    category: CategoryKey;
    size_mm: { w: number; h: number };
    slides: SnapshotSlide[];
  };
  saveDesign: (meta?: PublishMeta) => Promise<void>;
  captureFirstSlidePng: () => Promise<string | null>;

  mainScrollerRef: React.MutableRefObject<HTMLDivElement | null>;
  registerFirstSlideNode: (node: HTMLDivElement | null) => void;

  reset: () => void;
};

export type PublishMeta = {
  cardname?: string;
  cardcategory?: string;
  subCategory?: string;
  subSubCategory?: string;
  actualprice?: number;
  saleprice?: number;
  description?: string;
  sku?: string;
  imgUrl?: string; // captured preview coming from the form
};

const CategoriesEditorContext = createContext<CategoriesEditorContextType | undefined>(undefined);

export const CategoriesEditorProvider = ({ children }: { children: React.ReactNode }) => {
  /* ===== DEFAULTS derived from config (fix 1) ===== */
  const DEFAULT_CATEGORY: CategoryKey = "Invites";
  const initialConfig = CATEGORY_CONFIG[DEFAULT_CATEGORY];
  const initialSlides: Slide[] = (initialConfig.slideLabels?.length
    ? initialConfig.slideLabels.map((_, i) => ({ id: i + 1 }))
    : [{ id: 1 }]);

  // ----- core editor state -----
  const [category, setCategory] = useState<CategoryKey>(DEFAULT_CATEGORY);
  const [config, setConfig] = useState<(typeof CATEGORY_CONFIG)[CategoryKey]>(initialConfig);
  const [slides, setSlides] = useState<Slide[]>(initialSlides); // <-- starts with 2 slides for Invites
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [textToolOn, setTextToolOn] = useState(false);
  const [loading, setLoading] = useState(false);

  // element stores
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);

  // 🔹 refs
  const mainScrollerRef = useRef<HTMLDivElement | null>(null);
  const firstSlideRef = useRef<HTMLDivElement | null>(null);
  const registerFirstSlideNode = useCallback((node: HTMLDivElement | null) => {
    firstSlideRef.current = node;
  }, []);

  // when category changes -> default config and slides
  const applyCategory = useCallback((c: CategoryKey) => {
    setCategory(c);
    const cfg = CATEGORY_CONFIG[c];
    setConfig(cfg);
    const newSlides = cfg.slideLabels?.length ? cfg.slideLabels.map((_, i) => ({ id: i + 1 })) : [{ id: 1 }];
    setSlides(newSlides);
    setSelectedSlide(0);
    setSelectedTextId(null);
    setSelectedImageId(null);
    setTextElements([]);
    setImageElements([]);
    setStickerElements([]);
  }, []);

  // ----- selectors -----
  const getTexts = (slideId: number) => textElements.filter(t => t.slideId === slideId);
  const getImages = (slideId: number) => imageElements.filter(i => i.slideId === slideId);
  const getStickers = (slideId: number) => stickerElements.filter(s => s.slideId === slideId);

  /* ✅ Build slides with embedded elements */
  const buildSlidesWithElements = useCallback((): SnapshotSlide[] => {
    return slides.map((s, idx) => {
      const label = config.slideLabels?.[idx] ?? `Slide ${idx + 1}`;
      const texts: SnapshotTextEl[] = getTexts(s.id).map(e => ({
        ...e,
        type: "text",
        bold: !!e.bold,
        italic: !!e.italic,
        fontSize: e.fontSize ?? 20,
        fontFamily: e.fontFamily ?? "Arial",
        color: e.color ?? "#111111",
      }));
      const images: SnapshotImageEl[] = getImages(s.id).map(e => ({ ...e, type: "image" }));
      const stickers: SnapshotStickerEl[] = getStickers(s.id).map(e => ({ ...e, type: "sticker" }));
      return { id: s.id, label, elements: [...texts, ...images, ...stickers] };
    });
  }, [slides, config.slideLabels, textElements, imageElements, stickerElements]);

  const getSlidesWithElements = useCallback(() => buildSlidesWithElements(), [buildSlidesWithElements]);

  // ----- utils -----
  const reset = () => {
    // FIX 2: reset to current category’s slide count/labels
    const cfg = CATEGORY_CONFIG[category];
    const newSlides = cfg.slideLabels?.length ? cfg.slideLabels.map((_, i) => ({ id: i + 1 })) : [{ id: 1 }];
    setSlides(newSlides);
    setSelectedSlide(0);
    setSelectedTextId(null);
    setSelectedImageId(null);
    setTextElements([]);
    setImageElements([]);
    setStickerElements([]);
  };

  // ----- payload builders -----
  const serialize = () => ({
    category,
    config,
    slides,
    textElements,
    imageElements,
    stickerElements,
  });

  const serializeWithElements = () => ({
    category,
    size_mm: { w: config.mmWidth, h: config.mmHeight },
    slides: buildSlidesWithElements(),
  });

  // ---------- Base64 helpers ----------
  const readBlobAsDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ""));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });

  const urlToDataUrl = async (src: string): Promise<string> => {
    if (!src || src.startsWith("data:")) return src;
    try {
      const absolute = src.startsWith("/") ? `${window.location.origin}${src}` : src;
      const resp = await fetch(absolute, { mode: "cors" });
      const blob = await resp.blob();
      return await readBlobAsDataUrl(blob);
    } catch {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
    }
  };

  // 🔹 capture first slide PNG
  const captureFirstSlidePng = useCallback(async (): Promise<string | null> => {
    const node = firstSlideRef.current;
    if (!node) return null;

    const transparentPx =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

    const clone = node.cloneNode(true) as HTMLElement;

    const w = node.offsetWidth || node.getBoundingClientRect().width || 1;
    const h = node.offsetHeight || node.getBoundingClientRect().height || 1;
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`;

    const sandbox = document.createElement("div");
    sandbox.style.position = "fixed";
    sandbox.style.left = "-10000px";
    sandbox.style.top = "-10000px";
    sandbox.style.zIndex = "-1";
    sandbox.style.pointerEvents = "none";
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    const convertBlobImgsToDataURL = async (root: HTMLElement) => {
      const imgs = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.getAttribute("src") || "";
          if (!src.startsWith("data:")) {
            try {
              const resp = await fetch(src);
              const blob = await resp.blob();
              const dataUrl: string = await new Promise((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = () => resolve(String(fr.result));
                fr.onerror = reject;
                fr.readAsDataURL(blob);
              });
              img.setAttribute("src", dataUrl);
            } catch {
              img.setAttribute("src", transparentPx);
            }
          }
          img.setAttribute("crossorigin", "anonymous");
        })
      );
    };

    try {
      await convertBlobImgsToDataURL(clone);
      await (document as any).fonts?.ready?.catch(() => { });

      const dataUrl = await htmlToImage.toPng(clone, {
        cacheBust: false,
        pixelRatio: 2,
        backgroundColor: "transparent",
        skipFonts: false,
        filter: (n: Node) => !(n instanceof HTMLLinkElement && /fonts\.googleapis\.com/i.test(n.href)),
        imagePlaceholder: transparentPx,
        width: Math.round(w),
        height: Math.round(h),
        style: { transform: "none" },
      });
      return dataUrl;
    } catch (e) {
      console.error("captureFirstSlidePng failed:", e);
      return null;
    } finally {
      sandbox.remove();
    }
  }, []);

  // ----- saveDesign -----
  const saveDesign = async (meta?: PublishMeta) => {
    setLoading(true);
    try {
      const combined = serializeWithElements();
      const rawStores = serialize();

      const normImageElements = await Promise.all(
        rawStores.imageElements.map(async (el) => ({ ...el, src: await urlToDataUrl(el.src) }))
      );
      const normStickerElements = await Promise.all(
        rawStores.stickerElements.map(async (el) => ({ ...el, sticker: await urlToDataUrl(el.sticker) }))
      );

      const idToImgBase64 = new Map(normImageElements.map((e) => [e.id, e.src]));
      const idToStickerBase64 = new Map(normStickerElements.map((e) => [e.id, e.sticker]));

      const normSlides = await Promise.all(
        combined.slides.map(async (s) => {
          const elements = await Promise.all(
            s.elements.map(async (el) => {
              if (el.type === "image") {
                const src = idToImgBase64.get(el.id) || (await urlToDataUrl(el.src));
                return { ...el, src };
              }
              if (el.type === "sticker") {
                const sticker = idToStickerBase64.get(el.id) || (await urlToDataUrl(el.sticker));
                return { ...el, sticker };
              }
              return el;
            })
          );
          return { ...s, elements };
        })
      );

      // 👉 if the form provided a captured image, use it; otherwise fall back to editor capture
      const imgUrl = meta?.imgUrl ?? (await captureFirstSlidePng());

      const payload = {
        category: combined.category,
        config: rawStores.config,
        slides: normSlides,
        img_url: imgUrl ?? null,
        raw_stores: {
          ...rawStores,
          imageElements: normImageElements,
          stickerElements: normStickerElements,
        },
        title: meta?.cardname ?? rawStores?.config?.label ?? null,

        // DB-side extra columns
        subCategory: meta?.subCategory ?? null,
        subSubCategory: meta?.subSubCategory ?? null,
        actualprice: meta?.actualprice != null ? Number(meta.actualprice) : null,
        saleprice: meta?.saleprice != null ? Number(meta.saleprice) : null,
        description: meta?.description ?? null,
        sku: meta?.sku ?? null,
      };

      const { error } = await supabase.from("templetDesign").insert([payload]).select("id").single();
      if (error) {
        console.error("DB save failed:", error);
        toast.error("Save failed");
      } else {
        toast.success("✅ Saved template");
      }
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Save error");
    } finally {
      setLoading(false);
      reset();
    }
  };


  const value = useMemo<CategoriesEditorContextType>(() => ({
    category,
    setCategory: applyCategory,
    config,
    selectedSlide, setSelectedSlide,
    selectedTextId, setSelectedTextId,
    selectedImageId, setSelectedImageId,
    textToolOn, setTextToolOn,
    loading, setLoading,

    slides, setSlides,

    textElements, setTextElements,
    imageElements, setImageElements,
    stickerElements, setStickerElements,

    getTexts, getImages, getStickers,
    getSlidesWithElements,

    serialize,
    serializeWithElements,
    saveDesign,
    captureFirstSlidePng,

    mainScrollerRef,
    registerFirstSlideNode,

    reset,
  }), [
    category, config, slides, selectedSlide, selectedTextId, selectedImageId, textToolOn, loading,
    textElements, imageElements, stickerElements,
    applyCategory, getTexts, getImages, getStickers, getSlidesWithElements,
    serialize, serializeWithElements, saveDesign, captureFirstSlidePng,
    registerFirstSlideNode, mainScrollerRef,
  ]);

  return <CategoriesEditorContext.Provider value={value}>{children}</CategoriesEditorContext.Provider>;
};

export const useCategoriesEditorState = () => {
  const ctx = useContext(CategoriesEditorContext);
  if (!ctx) throw new Error("useCategoriesEditorState must be used within CategoriesEditorProvider");
  return ctx;
};
