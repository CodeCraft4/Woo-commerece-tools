import {
  Box,
  IconButton,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { Collections, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as htmlToImage from "html-to-image";

import LandingButton from "../../../components/LandingButton/LandingButton";
import { USER_ROUTES } from "../../../constant/route";
import { fetchTempletDesignById } from "../../../source/source";
import { COLORS } from "../../../constant/color";
import { fitCanvas } from "../../../lib/lib";
import { CATEGORY_CONFIG, type CategoryKey } from "../../../constant/data";

/* --------- Types --------- */
type BaseEl = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  slideId?: number;
  zIndex?: number;
  editable?: boolean;
};

type TextEl = BaseEl & {
  type: "text";
  text: string;
  bold: boolean;
  italic: boolean;
  color: string;
  fontSize: number;
  fontFamily: string;
  align?: "left" | "center" | "right";
};

type ImageEl = BaseEl & { type: "image"; src: string };
type StickerEl = BaseEl & { type: "sticker"; src: string };
type AnyEl = TextEl | ImageEl | StickerEl;

type Slide = { id: number; label: string; elements: AnyEl[] };

type CanvasPx = { w: number; h: number; dpi?: number };
type AdminPreview = {
  category: string;
  config: { mmWidth: number; mmHeight: number; slideLabels: string[] };
  canvasPx: CanvasPx;
  slides: Slide[];
};

/* --------- Utils --------- */
// const TRANSPARENT_PX =
  // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

const cloneSlides = (slides: Slide[]): Slide[] => JSON.parse(JSON.stringify(slides));
const asNum = (v: any, d = 0) => (typeof v === "number" && !Number.isNaN(v) ? v : d);
const asStr = (v: any, d = "") => (typeof v === "string" ? v : d);
const asBool = (v: any, d = false) => (typeof v === "boolean" ? v : d);
const A = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);
const uuid = () => globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`;

const resolveCategoryKey = (category?: string): CategoryKey | null => {
  const c = String(category ?? "").trim().toLowerCase();
  const keys = Object.keys(CATEGORY_CONFIG) as CategoryKey[];
  return keys.find((k) => k.trim().toLowerCase() === c) ?? null;
};

const sanitizeSrc = (src?: string) => {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  if (!src.startsWith("blob:")) return src;
  try {
    const u = new URL(src);
    if (u.origin === window.location.origin) return src;
  } catch { }
  return "";
};

const normalize01 = (o: any, pxW: number, pxH: number) => {
  let x = asNum(o?.x, 0),
    y = asNum(o?.y, 0),
    w = asNum(o?.width ?? o?.w, 0),
    h = asNum(o?.height ?? o?.h, 0);

  const r = (n: number) => n > 0 && n <= 1;
  if (r(x) || r(y) || r(w) || r(h)) {
    x *= pxW;
    y *= pxH;
    w *= pxW;
    h *= pxH;
  }
  return { x, y, width: w, height: h };
};

async function waitForAssets(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      const i = img as HTMLImageElement;
      if (i.complete && i.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((res) => {
        i.onload = () => res();
        i.onerror = () => res();
      });
    })
  );
  if ((document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch { }
  }
}

const captureFilter = (node: unknown) => {
  if (!(node instanceof Element)) return true;
  if (node.classList?.contains("capture-exclude")) return false;
  if (node.tagName?.toUpperCase() === "INPUT") {
    const t = (node as HTMLInputElement).type?.toLowerCase?.();
    if (t === "file" || t === "hidden") return false;
  }
  return true;
};

function hasBlobImages(root: HTMLElement) {
  return !!root.querySelector('img[src^="blob:"]');
}

/* --------- Persist helpers --------- */
const storageKey = (productId?: string) => `templet_editor_state:${productId ?? "state"}`;

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

/* ------------ MAIN ------------ */
export default function TempletEditor() {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [adminDesign, setAdminDesign] = useState<AdminPreview | null>(null);
  const [userSlides, setUserSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedElId, setSelectedElId] = useState<string | null>(null);

  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const slideRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const setSlideRef = (i: number) => (el: HTMLDivElement | null) => {
    slideRefs.current[i] = el;
  };

  const { productId } = useParams<{ productId: string }>();
  const { state } = useLocation() as { state?: { templetDesign?: any } };

  const didRestoreRef = useRef(false);

  // ====== Viewport-aware sizing (admin-like) ======
  const [viewport, setViewport] = useState({ w: 500, h: 600 });
  useEffect(() => {
    const onResize = () => {
      const headerFooterReserve = 240;
      setViewport({
        w: window.innerWidth,
        h: Math.max(320, window.innerHeight - headerFooterReserve),
      });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function buildSlidesFromRawStores(raw: any): { design: AdminPreview; slides: Slide[] } {
    const src = raw?.raw_stores ?? raw;

    const category = asStr(src?.category ?? src?.editorCategory ?? src?.cardCategory ?? "Invites");
    const labels: string[] = Array.isArray(src?.config?.slideLabels) ? src.config.slideLabels : [];

    const dbMmWidth = asNum(src?.config?.mmWidth, asNum(src?.canvas?.mm?.w, 210));
    const dbMmHeight = asNum(src?.config?.mmHeight, asNum(src?.canvas?.mm?.h, 297));

    const storedW =
      asNum(src?.config?.fitCanvas?.width, 0) ||
      asNum(src?.canvas?.px?.w, 0) ||
      1200;

    const storedH =
      asNum(src?.config?.fitCanvas?.height, 0) ||
      asNum(src?.canvas?.px?.h, 0) ||
      800;

    const k = resolveCategoryKey(category);
    const mmWidth = k ? CATEGORY_CONFIG[k].mmWidth : dbMmWidth;
    const mmHeight = k ? CATEGORY_CONFIG[k].mmHeight : dbMmHeight;

    const slidesDef: any[] = A(src?.slides);
    const imgEls = A<any>(src?.imageElements);
    const txtEls = A<any>(src?.textElements);
    const stkEls = A<any>(src?.stickerElements);

    const coerceText = (e: any): TextEl => {
      const r = normalize01(e, storedW, storedH);
      return {
        type: "text",
        id: asStr(e?.id) || uuid(),
        slideId: asNum(e?.slideId ?? e?.slide_id, 0),
        ...r,
        text: asStr(e?.text ?? e?.value),
        bold: asBool(e?.bold, false),
        italic: asBool(e?.italic, false),
        color: asStr(e?.color ?? "#000"),
        fontSize: asNum(e?.fontSize ?? e?.font_size, 16),
        fontFamily: asStr(e?.fontFamily ?? e?.font_family ?? "inherit"),
        align: (asStr(e?.align, "center") as any) ?? "center",
        zIndex: asNum(e?.zIndex ?? e?.z_index, 1),
        editable: e?.editable !== false,
      };
    };

    const coerceImage = (e: any): ImageEl => {
      const r = normalize01(e, storedW, storedH);
      return {
        type: "image",
        id: asStr(e?.id) || uuid(),
        slideId: asNum(e?.slideId ?? e?.slide_id, 0),
        ...r,
        src: sanitizeSrc(asStr(e?.src ?? e?.url ?? e?.imageUrl ?? e?.image)),
        zIndex: asNum(e?.zIndex ?? e?.z_index, 1),
        editable: e?.editable !== false,
      };
    };

    const coerceSticker = (e: any): StickerEl => {
      const r = normalize01(e, storedW, storedH);
      return {
        type: "sticker",
        id: asStr(e?.id) || uuid(),
        slideId: asNum(e?.slideId ?? e?.slide_id, 0),
        ...r,
        src: sanitizeSrc(asStr(e?.src ?? e?.url)),
        zIndex: asNum(e?.zIndex ?? e?.z_index, 1),
        editable: e?.editable !== false,
      };
    };

    const slides: Slide[] = slidesDef.map((sl, i) => {
      const sid = asNum(sl?.id ?? i, i);
      const label = labels[i] ?? asStr(sl?.label, `Slide ${i + 1}`);

      const images = imgEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceImage);
      const texts = txtEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceText);
      const stickers = stkEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceSticker);

      const elements: AnyEl[] = [...images, ...texts, ...stickers].sort(
        (a, b) => asNum(a.zIndex, 1) - asNum(b.zIndex, 1)
      );

      return { id: sid, label, elements };
    });

    return {
      design: {
        category,
        config: { mmWidth, mmHeight, slideLabels: labels },
        canvasPx: { w: storedW, h: storedH, dpi: 96 },
        slides,
      },
      slides,
    };
  }

  const clearEditorState = () => {
    sessionStorage.removeItem(storageKey(productId))
    navigate(-1)
  };


  // ✅ Restore
  useEffect(() => {
    const restored = safeJsonParse<{
      adminDesign: AdminPreview;
      userSlides: Slide[];
      activeSlide: number;
      selectedElId: string | null;
    }>(sessionStorage.getItem(storageKey(productId)));

    if (restored?.adminDesign && restored?.userSlides?.length) {
      didRestoreRef.current = true;
      setAdminDesign(restored.adminDesign);
      setUserSlides(restored.userSlides);
      setActiveSlide(restored.activeSlide ?? 0);
      setSelectedElId(restored.selectedElId ?? null);
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!adminDesign) return;

    const payload = {
      adminDesign,
      userSlides,
      activeSlide,
      selectedElId,
      savedAt: Date.now(),
    };

    try {
      sessionStorage.setItem(storageKey(productId), JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to persist editor state:", e);
    }
  }, [adminDesign, userSlides, activeSlide, selectedElId, productId]);


  // ✅ Load if not restored
  useEffect(() => {
    if (didRestoreRef.current) return;

    const load = async () => {
      setLoading(true);
      try {
        if (state?.templetDesign) {
          const { design, slides } = buildSlidesFromRawStores(state.templetDesign);
          setAdminDesign(design);
          setUserSlides(slides);
          setActiveSlide(0);
          setSelectedElId(null);
          return;
        }

        if (productId) {
          const row: any = await fetchTempletDesignById(productId);
          const raw = row?.raw_stores ?? row;
          const { design, slides } = buildSlidesFromRawStores(raw);
          setAdminDesign(design);
          setUserSlides(slides);
          setActiveSlide(0);
          setSelectedElId(null);
          return;
        }

        setAdminDesign(null);
        setUserSlides([]);
      } catch (e) {
        console.error("Failed to load template:", e);
        setAdminDesign(null);
        setUserSlides([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, state?.templetDesign]);

  // ====== Render sizing ======
  const catKey = useMemo(() => resolveCategoryKey(adminDesign?.category), [adminDesign?.category]);
  const cfg = useMemo(() => (catKey ? CATEGORY_CONFIG[catKey] : null), [catKey]);

  const mmW = cfg?.mmWidth ?? adminDesign?.config.mmWidth ?? 210;
  const mmH = cfg?.mmHeight ?? adminDesign?.config.mmHeight ?? 297;

  const canvasSize = useMemo(() => {
    return fitCanvas(mmW, mmH, viewport.w, viewport.h);
  }, [mmW, mmH, viewport.w, viewport.h, isTablet]);

  const artboardWidth = canvasSize?.width ?? 520;
  const artboardHeight = canvasSize?.height ?? 520;

  // Auto-center active slide in scroller
  useEffect(() => {
    const container = scrollRef.current;
    const node = slideRefs.current[activeSlide];
    if (!container || !node) return;

    const containerRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    const currentScrollLeft = container.scrollLeft;
    const nodeCenter = nodeRect.left - containerRect.left + nodeRect.width / 2;
    const containerCenter = containerRect.width / 2;

    const delta = nodeCenter - containerCenter;
    container.scrollTo({ left: currentScrollLeft + delta, behavior: "smooth" });
  }, [activeSlide]);

  const scrollToSlide = (index: number) => {
    setActiveSlide(index);
    setSelectedElId(null);
  };

  const onTextChange = (slideIndex: number, elId: string, text: string) => {
    setUserSlides((prev) => {
      const copy = cloneSlides(prev);
      const el = copy[slideIndex]?.elements.find((e) => e.id === elId);
      if (el && el.type === "text" && (el as TextEl).editable !== false) (el as TextEl).text = text;
      return copy;
    });
  };

  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const setImageInputRef = (id: string) => (el: HTMLInputElement | null) => {
    fileInputsRef.current[id] = el;
  };

  const onImagePicked = async (slideIndex: number, elId: string, file: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);

    setUserSlides((prev) => {
      const copy = cloneSlides(prev);
      const el = copy[slideIndex]?.elements.find((e) => e.id === elId);
      if (el && el.type === "image" && (el as ImageEl).editable !== false) {
        (el as ImageEl).src = dataUrl;
      }
      return copy;
    });
  };

  const is3DCategory = (cat?: string) => cat === "Mugs" || cat === "Tote Bags B" || cat === "Apparel T";
  const isMugCategory = (cat?: string) => cat === "Mugs";

  // ✅ NEW: JPEG capture helper (small size, less heavy)
  const captureJpegFromNode = async (node: HTMLElement): Promise<string | null> => {
    try {
      await waitForAssets(node);

      const rect = node.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));

      return await htmlToImage.toJpeg(node, {
        quality: 0.72,
        pixelRatio: 1,
        backgroundColor:'transparent',
        filter: captureFilter,
        cacheBust: hasBlobImages(node) ? false : true,
        skipFonts: false,
        // imagePlaceholder: TRANSPARENT_PX,
        width: w,
        height: h,
        style: { transform: "none" },
      });
    } catch (e) {
      console.error("captureJpegFromNode failed:", e);
      return null;
    }
  };

 const handleNavigatePrview = async () => {
  if (!adminDesign?.category) return;

  setPreviewLoading(true);

  const category = encodeURIComponent(adminDesign.category);

  const navStateBase: any = {
    slides: userSlides,
    config: { mmWidth: mmW, mmHeight: mmH, slideLabels: adminDesign.config.slideLabels },
    canvasPx: adminDesign.canvasPx,
    slideIndex: activeSlide,
    category: adminDesign.category,
  };

  try {
    // ✅ ONLY capture active slide
    const activeNode = slideRefs.current[activeSlide];
    const activeJpeg = activeNode ? await captureJpegFromNode(activeNode) : null;

    // ✅ store ONLY 1 (super fast)
    if (activeJpeg) {
      sessionStorage.setItem("slides", JSON.stringify({ slide1: activeJpeg }));
    }

    navStateBase.capturedSlides = activeJpeg ? [activeJpeg] : [];

    if (isMugCategory(adminDesign.category)) {
      navigate(`${USER_ROUTES.TEMPLET_EDITORS_PREVIEW}/${category}/${productId ?? "state"}`, {
        state: { ...navStateBase, mugImage: activeJpeg },
      });
      return;
    }

    if (is3DCategory(adminDesign.category)) {
      navigate(`${USER_ROUTES.TEMPLET_EDITORS_PREVIEW}/${category}/${productId ?? "state"}`, {
        state: navStateBase,
      });
    } else {
      navigate(`${USER_ROUTES.CATEGORIES_EDITORS_PREVIEW}/${productId ?? "state"}`, {
        state: navStateBase,
      });
    }
  } finally {
    setPreviewLoading(false);
  }
};


  // --------- Render ---------
  if (loading) {
    return (
      <Box sx={{ height: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!adminDesign) return <Typography>No template found.</Typography>;

  const sidePad = `max(0px, calc((90% - ${artboardWidth}px) / 2))`;

  return (
    <>
      {/* HEADER */}
      <Box px={isTablet ? 2 : 8} pt={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <IconButton onClick={clearEditorState} sx={{ fontSize: 16, color: 'blue' }}>
            <ArrowBackIos fontSize="small" /> exit
          </IconButton>{" "}
          <Chip label={`Slides: ${userSlides.length}`} size="small" />
          {/* <Chip label={`${mmW} × ${mmH} mm`} size="small" /> */}
          <Box flexGrow={1} />
          {/* ✅ loading pass */}
          <LandingButton title="Preview" onClick={handleNavigatePrview} loading={previewLoading} />
        </Stack>
      </Box>

      {/* MAIN */}
      <Box
        sx={{
          height: "95vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Scroller */}
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            overflowX: "auto",
            overflowY: "hidden",
            width: "100%",
            p: 2,
            gap: isTablet ? 4 : 7,
            justifyContent: "flex-start",
            minWidth: "100%",
            scrollSnapType: "x mandatory",
            "&::-webkit-scrollbar": { height: 6, width: 6 },
            "&::-webkit-scrollbar-thumb": { backgroundColor: COLORS.primary, borderRadius: "20px" },
          }}
        >
          <Box sx={{ flex: "0 0 auto", width: sidePad }} />

          {userSlides.map((slide, i) => {
            const ordered = [...slide.elements].sort((a, b) => asNum(a.zIndex, 1) - asNum(b.zIndex, 1));
            const isActive = i === activeSlide;

            return (
              <Box
                key={slide.id}
                sx={{
                  position: "relative",
                  display: "flex",
                  gap: 2,
                  flex: "0 0 auto",
                  scrollSnapAlign: "center",
                  opacity: isActive ? 1 : 0.5,
                  filter: isActive ? "none" : "grayscale(0.35)",
                  transition: "opacity .2s ease, filter .2s ease",
                  ml: i === 0 ? (isTablet ? 1 : 3) : 0,
                }}
              >
                {/* ARTBOARD */}
                <Box
                  ref={(el: any) => {
                    setSlideRef(i)(el);
                  }}
                  sx={{
                    width: artboardWidth,
                    height: artboardHeight,
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    bgcolor: "transparent",
                    boxShadow: isActive ? 10 : 4,
                    outline: "none",
                  }}
                  onClick={() => isActive && setSelectedElId(null)}
                >
                  {ordered.map((el) => {
                    const isLocked = el.editable === false;
                    const isSelected = selectedElId === el.id && isActive;
                    const cursor = isSelected ? "text" : isLocked ? "not-allowed" : "text";

                    // ✅ REMOVE 1.23 SCALE
                    const baseStyle = {
                      position: "absolute" as const,
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      zIndex: asNum(el.zIndex, 1),
                      cursor,
                      borderRadius: 1,
                    };

                    if (el.type === "image") {
                      const img = el as ImageEl;
                      return (
                        <Box
                          key={el.id}
                          sx={{ ...baseStyle, overflow: "hidden" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isActive) return;
                            setSelectedElId(el.id);
                          }}
                        >
                          <img
                            crossOrigin="anonymous"
                            src={img.src}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />

                          {el.editable !== false && isActive && (
                            <Box
                              className="capture-exclude"
                              sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0,
                                transition: "opacity .15s ease",
                                "&:hover": { opacity: 1, background: "rgba(0,0,0,0.18)" },
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElId(el.id);
                                fileInputsRef.current[el.id]?.click();
                              }}
                            >
                              <Collections sx={{ color: "#fff" }} />
                            </Box>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            ref={setImageInputRef(el.id)}
                            onChange={(e) => onImagePicked(i, el.id, e.target.files?.[0] || null)}
                            style={{ display: "none" }}
                            disabled={el.editable === false}
                          />
                        </Box>
                      );
                    }

                    if (el.type === "text") {
                      const t = el as TextEl;
                      const align = t.align ?? "center";

                      return (
                        <Box
                          key={el.id}
                          sx={{ ...baseStyle, p: 0.5 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isActive) return;
                            setSelectedElId(el.id);
                          }}
                        >
                          {t.editable !== false && isActive ? (
                            <TextField
                              multiline
                              value={t.text}
                              onChange={(e) => onTextChange(i, el.id, e.target.value)}
                              variant="standard"
                              InputProps={{
                                disableUnderline: true,
                                sx: {
                                  height: "100%",
                                  width: "100%",
                                  p: 0.5,
                                  "& .MuiInputBase-root": {
                                    height: "100%",
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent:
                                      align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
                                  },

                                  "& textarea.MuiInputBase-inputMultiline": {
                                    height: "auto",
                                    minHeight: 0,
                                    width: "100%",
                                    padding: 0,
                                    margin: "auto 0",
                                    textAlign: align,
                                    resize: "none",
                                    overflow: "hidden",
                                  },
                                },
                              }}
                              inputProps={{
                                style: {
                                  fontWeight: t.bold ? 700 : 400,
                                  fontStyle: t.italic ? "italic" : "normal",
                                  fontSize: t.fontSize,
                                  fontFamily: t.fontFamily,
                                  color: t.color,
                                  lineHeight: 1.2,
                                },
                              }}
                              sx={{ height: "100%", width: "100%" }}
                            />

                          ) : (
                            <Typography
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                  align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
                                fontWeight: t.bold ? 700 : 400,
                                fontStyle: t.italic ? "italic" : "normal",
                                fontSize: t.fontSize,
                                fontFamily: t.fontFamily,
                                color: t.color,
                                textAlign: align as any,
                                whiteSpace: "pre-wrap",
                                overflow: "hidden",
                                userSelect: "none",
                              }}
                            >
                              {t.text}
                            </Typography>
                          )}

                        </Box>
                      );
                    }

                    if (el.type === "sticker") {
                      const st = el as StickerEl;
                      return (
                        <Box
                          key={el.id}
                          component="img"
                          src={st.src}
                          alt=""
                          sx={{ ...baseStyle, objectFit: "contain", display: "block" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isActive) return;
                            setSelectedElId(el.id);
                          }}
                        />
                      );
                    }

                    return null;
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Thumbnails */}
        <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center" }}>
          <IconButton onClick={() => scrollToSlide(Math.max(0, activeSlide - 1))}>
            <ArrowBackIos />
          </IconButton>

          {userSlides.map((slide, i) => (
            <Box
              key={slide.id}
              onClick={() => scrollToSlide(i)}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: activeSlide === i ? "#1976d2" : "#eceff1",
                color: activeSlide === i ? "white" : "#000",
              }}
            >
              {slide.label}
            </Box>
          ))}

          <IconButton onClick={() => scrollToSlide(Math.min(activeSlide + 1, userSlides.length - 1))}>
            <ArrowForwardIos />
          </IconButton>
        </Box>
      </Box>
    </>
  );
}
