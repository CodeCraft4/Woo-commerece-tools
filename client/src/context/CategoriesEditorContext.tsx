// /src/context/CategoriesEditorContext.tsx
import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import { CATEGORY_CONFIG, type CategoryKey } from "../constant/data";
import { supabase } from "../supabase/supabase";
import toast from "react-hot-toast";

/* ---------- Types ---------- */
export type Slide = { id: number };

export type TextElement = {
  id: string;
  slideId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  zIndex?: number;
  editable?: boolean;
  // align exists in editor code via ts-expect-error; keep flexible
  align?: "left" | "center" | "right";
};

export type ImageElement = {
  id: string;
  slideId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  zIndex?: number;
  editable?: boolean;
  shapeId?: string;
};

export type StickerElement = {
  id: string;
  slideId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  sticker: string;
  zIndex?: number;
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

export type PublishMeta = {
  id?: string;     // ✅ add
  mode?: "edit" | "create" | string;
  cardname?: string;

  // IMPORTANT: this is the product category chosen in the form
  cardcategory?: string;

  subCategory?: string;
  subSubCategory?: string;

  actualprice?: any;
  a4price?: any;
  a5price?: any;
  usletter?: any;

  saleprice?: any;
  salea4price?: any;
  salea5price?: any;
  saleusletter?: any;

  description?: string;
  sku?: string;
  imgUrl?: string;
};

type CategoriesEditorContextType = {
  // editor "template type"
  category: CategoryKey;
  setCategory: (c: CategoryKey) => void;
  config: (typeof CATEGORY_CONFIG)[CategoryKey];

  selectedSlide: number;
  setSelectedSlide: React.Dispatch<React.SetStateAction<number>>;
  selectedTextId: string | null;
  setSelectedTextId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedImageId: string | null;
  setSelectedImageId: React.Dispatch<React.SetStateAction<string | null>>;
  textToolOn: boolean;
  setTextToolOn: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;

  textElements: TextElement[];
  setTextElements: React.Dispatch<React.SetStateAction<TextElement[]>>;
  imageElements: ImageElement[];
  setImageElements: React.Dispatch<React.SetStateAction<ImageElement[]>>;
  stickerElements: StickerElement[];
  setStickerElements: React.Dispatch<React.SetStateAction<StickerElement[]>>;

  slideBg?: any;
  setSlideBg?: any;

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
    slideBg: any;
  };

  serializeWithElements: () => {
    editorCategory: CategoryKey;
    size_mm: { w: number; h: number };
    slides: SnapshotSlide[];
  };

  saveDesign: (meta?: PublishMeta) => Promise<void>;
  captureFirstSlidePng: () => Promise<string | null>;

  mainScrollerRef: React.MutableRefObject<HTMLDivElement | null>;
  registerFirstSlideNode: (node: HTMLDivElement | null) => void;

  reset: () => void;
};

const CategoriesEditorContext = createContext<CategoriesEditorContextType | undefined>(undefined);

/* ---------- Helpers ---------- */
const mmToPx = (mm: number, dpi = 96) => (mm / 25.4) * dpi;

export const CategoriesEditorProvider = ({ children }: { children: React.ReactNode }) => {
  const DEFAULT_CATEGORY: CategoryKey = "Invites";
  const initialConfig = CATEGORY_CONFIG[DEFAULT_CATEGORY];
  const initialSlides: Slide[] = initialConfig.slideLabels?.length
    ? initialConfig.slideLabels.map((_, i) => ({ id: i + 1 }))
    : [{ id: 1 }];

  const [category, setCategory] = useState<CategoryKey>(DEFAULT_CATEGORY);
  const [config, setConfig] = useState<(typeof CATEGORY_CONFIG)[CategoryKey]>(initialConfig);
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [textToolOn, setTextToolOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);
  const [slideBg, setSlideBg] = useState<Record<number, { color?: string; image?: string; editable?: boolean }>>({});

  const mainScrollerRef = useRef<HTMLDivElement | null>(null);
  const firstSlideRef = useRef<HTMLDivElement | null>(null);

  const registerFirstSlideNode = useCallback((node: HTMLDivElement | null) => {
    firstSlideRef.current = node;
  }, []);

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
    setSlideBg({});
  }, []);

  const getTexts = (slideId: number) => textElements.filter((t) => t.slideId === slideId);
  const getImages = (slideId: number) => imageElements.filter((i) => i.slideId === slideId);
  const getStickers = (slideId: number) => stickerElements.filter((s) => s.slideId === slideId);

  const buildSlidesWithElements = useCallback((): SnapshotSlide[] => {
    return slides.map((s, idx) => {
      const label = config.slideLabels?.[idx] ?? `Slide ${idx + 1}`;
      const texts: SnapshotTextEl[] = getTexts(s.id).map((e) => ({
        ...e,
        type: "text",
        bold: !!e.bold,
        italic: !!e.italic,
        fontSize: e.fontSize ?? 20,
        fontFamily: e.fontFamily ?? "Arial",
        color: e.color ?? "#111111",
      }));
      const images: SnapshotImageEl[] = getImages(s.id).map((e) => ({ ...e, type: "image" }));
      const stickers: SnapshotStickerEl[] = getStickers(s.id).map((e) => ({ ...e, type: "sticker" }));
      return { id: s.id, label, elements: [...texts, ...images, ...stickers] };
    });
  }, [slides, config.slideLabels, textElements, imageElements, stickerElements]);

  const getSlidesWithElements = useCallback(() => buildSlidesWithElements(), [buildSlidesWithElements]);

  const reset = () => {
    const cfg = CATEGORY_CONFIG[category];
    const newSlides = cfg.slideLabels?.length ? cfg.slideLabels.map((_, i) => ({ id: i + 1 })) : [{ id: 1 }];
    setSlides(newSlides);
    setSelectedSlide(0);
    setSelectedTextId(null);
    setSelectedImageId(null);
    setTextElements([]);
    setImageElements([]);
    setStickerElements([]);
    setSlideBg({});
  };

  const serialize = () => ({
    category,
    config,
    slides,
    textElements,
    imageElements,
    stickerElements,
    slideBg,
  });

  // IMPORTANT: do not call it "category" here to avoid confusion with DB category
  const serializeWithElements = () => ({
    editorCategory: category,
    size_mm: { w: config.mmWidth, h: config.mmHeight },
    slides: buildSlidesWithElements(),
  });

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

    const convertImgsToDataUrl = async (root: HTMLElement) => {
      const imgs = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.getAttribute("src") || "";
          if (!src.startsWith("data:")) {
            try {
              const resp = await fetch(src);
              const blob = await resp.blob();
              const dataUrl = await readBlobAsDataUrl(blob);
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
      await convertImgsToDataUrl(clone);
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

  const saveDesign = async (meta?: PublishMeta) => {
    setLoading(true);
    try {
      const combined = serializeWithElements(); // { editorCategory, size_mm, slides }
      const rawStores = serialize(); // editor raw stores

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
            s.elements.map(async (el: any) => {
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

      const imgUrl = meta?.imgUrl ?? null;

      // ✅ Store product cardCategory into DB column "category"
      const dbCategory = meta?.cardcategory?.trim() || null;

      // ✅ store "canvas size" safely INSIDE raw_stores (json) to avoid DB schema changes
      const canvasMm = { w: rawStores.config.mmWidth, h: rawStores.config.mmHeight };
      const canvasPx = {
        w: Math.round(mmToPx(canvasMm.w, 96)),
        h: Math.round(mmToPx(canvasMm.h, 96)),
        dpi: 96,
      };

      const payload: any = {
        // DB COLUMN: category (must be the form cardcategory)
        category: dbCategory,

        // keep config & slides
        config: rawStores.config,
        slides: normSlides,

        img_url: imgUrl ?? null,

        // json storage (safe place for everything)
        raw_stores: {
          ...rawStores,
          // keep original arrays normalized
          imageElements: normImageElements,
          stickerElements: normStickerElements,
          slideBg: rawStores.slideBg,

          // ✅ do NOT lose editor template type
          editorCategory: rawStores.category, // CategoryKey: Invites/Stickers etc

          // ✅ size used by your renderers
          canvas: { mm: canvasMm, px: canvasPx },
        },

        title: meta?.cardname ?? rawStores?.config?.label ?? null,

        // extra columns
        subCategory: meta?.subCategory ?? null,
        subSubCategory: meta?.subSubCategory ?? null,

        actualprice: meta?.actualprice != null ? String(meta.actualprice) : null,
        a4price: meta?.a4price != null ? String(meta.a4price) : null,
        a5price: meta?.a5price != null ? String(meta.a5price) : null,
        usletter: meta?.usletter != null ? String(meta.usletter) : null,

        saleprice: meta?.saleprice != null ? String(meta.saleprice) : null,
        salea4price: meta?.salea4price != null ? String(meta.salea4price) : null,
        salea5price: meta?.salea5price != null ? String(meta.salea5price) : null,
        saleusletter: meta?.saleusletter != null ? String(meta.saleusletter) : null,

        description: meta?.description ?? null,
        sku: meta?.sku ?? null,
      };

      if (!payload.category) {
        toast.error("Card Category is required (DB column: category).");
        return;
      }

      const isEdit = !!meta?.id;

      const { error } = isEdit
        ? await supabase.from("templetDesign").update(payload).eq("id", meta!.id)
        : await supabase.from("templetDesign").insert([payload]);

      if (error) {
        console.error("DB save failed:", error);
        toast.error("Save failed");
      } else {
        toast.success(isEdit ? "✅ Updated template Design" : "✅ Saved template Design");
        reset();
      }
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Save error");
    } finally {
      setLoading(false);
      reset();
    }
  };

  const value = useMemo<CategoriesEditorContextType>(
    () => ({
      category,
      setCategory: applyCategory,
      config,

      selectedSlide,
      setSelectedSlide,
      selectedTextId,
      setSelectedTextId,
      selectedImageId,
      setSelectedImageId,
      textToolOn,
      setTextToolOn,
      loading,
      setLoading,

      slides,
      setSlides,

      textElements,
      setTextElements,
      imageElements,
      setImageElements,
      stickerElements,
      setStickerElements,

      slideBg,
      setSlideBg,

      getTexts,
      getImages,
      getStickers,

      getSlidesWithElements,

      serialize,
      serializeWithElements,
      saveDesign,
      captureFirstSlidePng,

      mainScrollerRef,
      registerFirstSlideNode,

      reset,
    }),
    [
      category,
      config,
      selectedSlide,
      selectedTextId,
      selectedImageId,
      textToolOn,
      loading,
      slides,
      textElements,
      imageElements,
      stickerElements,
      slideBg,
      applyCategory,
      getSlidesWithElements,
      registerFirstSlideNode,
    ]
  );

  return <CategoriesEditorContext.Provider value={value}>{children}</CategoriesEditorContext.Provider>;
};

export const useCategoriesEditorState = () => {
  const ctx = useContext(CategoriesEditorContext);
  if (!ctx) throw new Error("useCategoriesEditorState must be used within CategoriesEditorProvider");
  return ctx;
};
