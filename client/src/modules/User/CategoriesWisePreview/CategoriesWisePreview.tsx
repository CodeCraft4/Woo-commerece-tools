import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import { ArrowBackIos, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { USER_ROUTES } from "../../../constant/route";
import { safeSetLocalStorage, safeSetSessionStorage } from "../../../lib/storage";
import { saveSlidesToIdb } from "../../../lib/idbSlides";
import { toJpeg, toPng } from "html-to-image";
import { buildGoogleFontsUrls, loadGoogleFontsOnce } from "../../../constant/googleFonts";

/* ---------- Types ---------- */
type Slide = { id: number; label: string; elements: any[] };

type ArtboardConfig = {
  mmWidth: number;
  mmHeight: number;
  slideLabels?: string[];
};

type NavState = {
  slides?: Slide[];
  config?: ArtboardConfig;
  canvasPx?: { w: number; h: number };
  slideIndex?: number;
  category?: string;
  previewKey?: string;

  // ✅ from TempletEditor (new)
  capturedSlides?: string[];
  mugImage?: string;
};

/* ---------- Helpers ---------- */
async function toJpegDataUrl(
  inputDataUrl: string,
  quality = 0.78,
  maxDim = 1600
): Promise<string> {
  if (!inputDataUrl) return "";
  if (inputDataUrl.startsWith("data:image/jpeg")) return inputDataUrl;

  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = inputDataUrl;

    img.onload = () => {
      const nw = img.naturalWidth || 1;
      const nh = img.naturalHeight || 1;

      // ✅ downscale to avoid huge localStorage payload
      const scale = Math.min(1, maxDim / Math.max(nw, nh));
      const w = Math.max(1, Math.round(nw * scale));
      const h = Math.max(1, Math.round(nh * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      if (!ctx) return resolve(inputDataUrl);

      // white background for jpeg
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(inputDataUrl);
      }
    };

    img.onerror = () => resolve(inputDataUrl);
  });
}

const normalizeFontFamily = (value?: string | null) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const quoted = raw.match(/['"]([^'"]+)['"]/);
  if (quoted?.[1]) return quoted[1].trim();
  const first = raw.split(",")[0]?.trim() ?? "";
  return first.replace(/^['"]|['"]$/g, "").trim();
};

const resolveTextFontFamily = (entry: any) =>
  normalizeFontFamily(
    entry?.fontFamily ??
      entry?.font_family ??
      entry?.fontFamily1 ??
      entry?.fontFamily2 ??
      entry?.fontFamily3 ??
      entry?.fontFamily4 ??
      entry?.style?.fontFamily ??
      entry?.style?.font_family ??
      "",
  );

const collectFontsFromSlides = (slides: Slide[]) => {
  const fonts = new Set<string>();
  slides.forEach((sl) => {
    (sl.elements ?? []).forEach((el: any) => {
      if (String(el?.type ?? "").toLowerCase() !== "text") return;
      const fam = resolveTextFontFamily(el);
      if (!fam) return;
      const lower = fam.toLowerCase();
      if (["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"].includes(lower)) return;
      fonts.add(fam);
    });
  });
  return Array.from(fonts);
};


const CategoriesWisePreview: React.FC = () => {
  const { state } = useLocation() as { state?: NavState };
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:450px)");

  const config = state?.config;
  const category = state?.category ?? "";
  const isTransparentCaptureCategory =
    /sticker|bag|tote|clothing|clothes|apparel|notebook/i.test(String(category ?? ""));
  const start = state?.slideIndex ?? 0;
  const slides = useMemo<Slide[]>(() => {
    if (state?.slides?.length) return state.slides;
    try {
      const storedKey = sessionStorage.getItem("templ_preview_key") || "";
      const expectedPrefix = productId ? `${productId}::` : "";
      const stateKey = state?.previewKey || "";
      const keyMatches = stateKey
        ? storedKey === stateKey
        : expectedPrefix
        ? storedKey.startsWith(expectedPrefix)
        : Boolean(storedKey);
      if (!keyMatches) {
        try {
          sessionStorage.removeItem("templ_preview_slides");
          sessionStorage.removeItem("capturedSlides");
          sessionStorage.removeItem("capturedSlidesKey");
          sessionStorage.removeItem("templ_preview_key");
        } catch {}
        return [];
      }
      const stored = sessionStorage.getItem("templ_preview_slides");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }, [state, productId]);

  const captureKey = useMemo(() => {
    const ids = slides.map((s) => String(s?.id ?? "")).join(",");
    const pid = productId ?? "state";
    return `${pid}::${String(category ?? "")}::${slides.length}::${ids}`;
  }, [category, slides, productId]);

  // Change to (sessionStorage se fallback bhi add kar sakte ho)
  const captured = useMemo(() => {
    // Priority 1: route state se
    if (state?.capturedSlides?.length) return state.capturedSlides;

    // Priority 2: sessionStorage se
    try {
      const storedKey = sessionStorage.getItem("templ_preview_key") || "";
      const expectedPrefix = productId ? `${productId}::` : "";
      const stateKey = state?.previewKey || "";
      const keyMatches = stateKey
        ? storedKey === stateKey
        : expectedPrefix
        ? storedKey.startsWith(expectedPrefix)
        : Boolean(storedKey);
      if (!keyMatches) return [];
      const storedCaptureKey = sessionStorage.getItem("capturedSlidesKey") || "";
      if (storedCaptureKey && storedCaptureKey !== captureKey) return [];
      const stored = sessionStorage.getItem("capturedSlides");
      if (stored) return JSON.parse(stored);
    } catch { }

    // Fallback to single mug image
    if (state?.mugImage) return [state.mugImage];

    return [];
  }, [state]);

  const [active, setActive] = useState(start);

  // Ensure template fonts are loaded so text positioning matches admin editor
  useEffect(() => {
    if (!slides?.length) return;
    const fonts = collectFontsFromSlides(slides);
    if (!fonts.length) return;
    loadGoogleFontsOnce(buildGoogleFontsUrls(fonts));
  }, [slides]);

  // book animation
  const [flipDir, setFlipDir] = useState<"next" | "prev">("next");
  const [flipping, setFlipping] = useState(false);

  if (!config) {
    return (
      <Box sx={{ height: "92vh", display: "grid", placeItems: "center" }}>
        <Typography>No preview data.</Typography>
      </Box>
    );
  }

  const hasCaptured = (captured?.length || 0) > 0;
  const slideCount = Math.max(1, hasCaptured ? captured.length : slides.length);
  const [previewScale, setPreviewScale] = useState(1);
  const baseW = Number((config as any)?.fitCanvas?.width ?? config?.mmWidth ?? 1);
  const baseH = Number((config as any)?.fitCanvas?.height ?? config?.mmHeight ?? 1);
  const scaledW = Math.max(1, Math.round(baseW * previewScale));
  const scaledH = Math.max(1, Math.round(baseH * previewScale));

  useEffect(() => {
    const update = () => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
      const vh = typeof window !== "undefined" ? window.innerHeight : 800;
      const maxW = vw * (isMobile ? 0.92 : 0.8);
      const maxH = vh * 0.72;
      const scale = Math.min(1, maxW / baseW, maxH / baseH);
      setPreviewScale(Number.isFinite(scale) && scale > 0 ? scale : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  }, [baseW, baseH, isMobile]);

  // ✅ current/next imgs
  const currentImg = hasCaptured ? captured?.[active] || "" : "";
  const nextIndex = flipDir === "next" ? Math.min(active + 1, slideCount - 1) : Math.max(active - 1, 0);
  const nextImg = hasCaptured ? captured?.[nextIndex] || currentImg : "";
  const currentSlide = !hasCaptured ? slides?.[active] : null;
  const nextSlide = !hasCaptured ? slides?.[nextIndex] : null;

  const renderSlide = useCallback((slide?: Slide) => {
    if (!slide) return null;
    const ordered = [...(slide.elements || [])].sort((a, b) => {
      const zA = Number(a?.zIndex ?? 1) + (a?.type === "text" ? 100000 : 0);
      const zB = Number(b?.zIndex ?? 1) + (b?.type === "text" ? 100000 : 0);
      return zA - zB;
    });
    return (
      <Box sx={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        {ordered.map((el: any) => {
          const baseStyle: any = {
            position: "absolute",
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
            zIndex: el.zIndex ?? 1,
          };

          if (el.type === "image") {
            return (
              <Box
                key={el.id}
                component="img"
                src={el.src}
                alt=""
                sx={{ ...baseStyle, objectFit: "cover", display: "block" }}
              />
            );
          }

          if (el.type === "sticker") {
            return (
              <Box
                key={el.id}
                component="img"
                src={el.src}
                alt=""
                sx={{ ...baseStyle, objectFit: "contain", display: "block" }}
              />
            );
          }

          if (el.type === "text") {
            const align = el.align ?? "center";
            const justify =
              align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
            return (
              <Box
                key={el.id}
                sx={{
                  ...baseStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: justify,
                  textAlign: align,
                  fontWeight: el.bold ? 700 : 400,
                  fontStyle: el.italic ? "italic" : "normal",
                  fontSize: el.fontSize,
                  fontFamily: resolveTextFontFamily(el) || "Arial",
                  color: el.color,
                  whiteSpace: "pre-wrap",
                }}
              >
                {el.text}
              </Box>
            );
          }

          return null;
        })}
      </Box>
    );
  }, []);

  const slideNodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const setSlideNodeRef = (i: number) => (el: HTMLDivElement | null) => {
    slideNodeRefs.current[i] = el;
  };
  const prefetchedSlidesRef = useRef<string[] | null>(null);
  const prefetchPromiseRef = useRef<Promise<string[]> | null>(null);
  const prefetchOnce = useRef(false);

  const goNext = () => {
    if (active >= slideCount - 1 || flipping) return;
    setFlipDir("next");
    setFlipping(true);
    setTimeout(() => {
      setActive((p) => Math.min(p + 1, slideCount - 1));
      setFlipping(false);
    }, 360);
  };

  const goPrev = () => {
    if (active <= 0 || flipping) return;
    setFlipDir("prev");
    setFlipping(true);
    setTimeout(() => {
      setActive((p) => Math.max(p - 1, 0));
      setFlipping(false);
    }, 360);
  };

  // ✅ Download loading
  const [downloading, setDownloading] = useState(false);

  const captureSlidesFromDom = async (format: "jpeg" | "png", maxDim = 1600) => {
    const out: string[] = [];
    for (let i = 0; i < slides.length; i++) {
      const node = slideNodeRefs.current[i];
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      const maxSide = Math.max(rect.width || 0, rect.height || 0);
      const ratio = maxSide ? maxDim / maxSide : 1.5;
      const pixelRatio = Math.min(2, Math.max(0.5, ratio));
      if (format === "png") {
        const png = await toPng(node, {
          pixelRatio,
          backgroundColor: "transparent",
          cacheBust: false,
          skipFonts: false,
        });
        out.push(png);
      } else {
        const jpg = await toJpeg(node, {
          quality: 0.78,
          pixelRatio,
          backgroundColor: "#ffffff",
          cacheBust: false,
          skipFonts: false,
        });
        out.push(jpg);
      }
    }
    return out;
  };

  const captureSingleSlideFromDom = async (
    index: number,
    format: "jpeg" | "png",
    maxDim = 1200
  ) => {
    const node = slideNodeRefs.current[index];
    if (!node) return "";
    const rect = node.getBoundingClientRect();
    const maxSide = Math.max(rect.width || 0, rect.height || 0);
    const ratio = maxSide ? maxDim / maxSide : 1.5;
    const pixelRatio = Math.min(2, Math.max(0.5, ratio));
    if (format === "png") {
      return await toPng(node, {
        pixelRatio,
        backgroundColor: "transparent",
        cacheBust: false,
        skipFonts: false,
      });
    }
    return await toJpeg(node, {
      quality: 0.78,
      pixelRatio,
      backgroundColor: "#ffffff",
      cacheBust: false,
      skipFonts: false,
    });
  };

  const readCapturedFromStorage = () => {
    try {
      const storedKey = sessionStorage.getItem("capturedSlidesKey");
      if (!storedKey || storedKey !== captureKey) return [];
      const stored = sessionStorage.getItem("capturedSlides");
      if (stored) return JSON.parse(stored) as string[];
    } catch {}
    return [];
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      let previewOnly = false;
      let list: string[] = [];
      if (isTransparentCaptureCategory) {
        const stored = readCapturedFromStorage();
        if (stored.length) {
          list = stored;
        } else if (prefetchedSlidesRef.current?.length) {
          list = prefetchedSlidesRef.current;
        } else if (prefetchPromiseRef.current) {
          list = await prefetchPromiseRef.current;
        } else {
          list = await captureSlidesFromDom("png", 2400);
        }
        if (!list.length && slides.length) {
          list = await captureSlidesFromDom("png", 2400);
        }
        const fullReady = slides.length ? list.length >= slides.length : list.length > 0;
        if (!fullReady) {
          previewOnly = true;
          const preview = await captureSingleSlideFromDom(0, "png", 1200);
          if (preview) list = [preview];
        }
      } else {
        const stored = readCapturedFromStorage();
        const quickList = (captured?.length ? captured : currentImg ? [currentImg] : []).filter(Boolean);
        if (stored.length) {
          list = stored;
        } else if (quickList.length) {
          list = quickList;
        } else if (prefetchedSlidesRef.current?.length) {
          list = prefetchedSlidesRef.current;
        } else if (prefetchPromiseRef.current) {
          list = await prefetchPromiseRef.current;
        } else {
          list = [];
        }
        if (!list.length && slides.length) {
          list = await captureSlidesFromDom("jpeg", 1600);
        }
        const fullReady = slides.length ? list.length >= slides.length : list.length > 0;
        if (!fullReady) {
          previewOnly = true;
          const preview = await captureSingleSlideFromDom(0, "jpeg", 1200);
          if (preview) list = [preview];
        }
      }

      // ✅ Convert to JPEG only if needed (avoid double work)
      const out: string[] = [];
      if (isTransparentCaptureCategory) {
        out.push(...list);
      } else {
        const needsConvert = list.some(
          (u) => !String(u || "").startsWith("data:image/jpeg")
        );
        if (!needsConvert) {
          out.push(...list);
        } else {
          const converted = await Promise.all(
            list.map((u) =>
              String(u || "").startsWith("data:image/jpeg")
                ? Promise.resolve(u)
                : toJpegDataUrl(u, 0.78, 1600)
            )
          );
          out.push(...converted);
        }
      }

      // ✅ store one-by-one (slide1, slide2, slide3...)
      const slidesObj = Object.fromEntries(out.map((u, idx) => [`slide${idx + 1}`, u]));

      (globalThis as any).__slidesCache = slidesObj;
      (globalThis as any).__rawSlidesCache = slides;
      (globalThis as any).__previewConfigCache = config ?? null;
      try {
        sessionStorage.setItem("slides_preview_only", previewOnly ? "1" : "0");
        sessionStorage.setItem("rawSlidesCount", String(slides.length || out.length || 1));
        if (config) {
          safeSetSessionStorage("templ_preview_config", JSON.stringify(config));
        }
      } catch {}

      // ✅ pass slides to subscription via route-state
      navigate(USER_ROUTES.SUBSCRIPTION, { state: { slides: slidesObj, previewOnly } });

      // ✅ persist storage after navigation to avoid blocking UI
      const persist = () => {
        try {
          const payload = JSON.stringify(slidesObj);
          safeSetSessionStorage("slides", payload);
        } catch {}

        try {
          const minimal = slidesObj?.slide1 ? JSON.stringify({ slide1: slidesObj.slide1 }) : "{}";
          safeSetLocalStorage("slides_backup", minimal, { clearOnFail: ["slides_backup"] });
        } catch {}

        try {
          void saveSlidesToIdb(slidesObj);
        } catch {}
      };

      const idle = globalThis as any;
      if (typeof idle.requestIdleCallback === "function") {
        idle.requestIdleCallback(persist, { timeout: 1200 });
      } else {
        setTimeout(persist, 0);
      }
    } catch (e) {
      console.error("Download capture failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  // Prefetch captured slides in idle time to speed up download
  useEffect(() => {
    prefetchedSlidesRef.current = null;
    prefetchPromiseRef.current = null;
    prefetchOnce.current = false;
  }, [captureKey]);

  useEffect(() => {
    if (prefetchOnce.current) return;
    if (hasCaptured || !slides.length) return;
    prefetchOnce.current = true;

    let cancelled = false;
    const run = async (): Promise<string[]> => {
      try {
        const existing = readCapturedFromStorage();
        if (existing.length) {
          prefetchedSlidesRef.current = existing;
          return existing;
        }
        if ((document as any)?.fonts?.ready) {
          try {
            await (document as any).fonts.ready;
          } catch {}
        }
        const format = isTransparentCaptureCategory ? "png" : "jpeg";
        const maxDim = isTransparentCaptureCategory ? 2400 : 1600;
        const list = await captureSlidesFromDom(format, maxDim);
        if (cancelled || !list.length) return [];
        prefetchedSlidesRef.current = list;
        sessionStorage.setItem("capturedSlides", JSON.stringify(list));
        sessionStorage.setItem("capturedSlidesKey", captureKey);
        return list;
      } catch {}
      return [];
    };

    let idleId: any = null;
    const idle = globalThis as any;
    const startPrefetch = () => {
      if (prefetchPromiseRef.current) return;
      const p = run();
      prefetchPromiseRef.current = p;
      p.catch(() => {});
    };
    if (typeof idle.requestIdleCallback === "function") {
      idleId = idle.requestIdleCallback(startPrefetch, { timeout: 600 });
    } else {
      idleId = setTimeout(startPrefetch, 80);
    }

    return () => {
      cancelled = true;
      if (typeof idle.cancelIdleCallback === "function" && idleId != null) {
        idle.cancelIdleCallback(idleId);
      } else if (idleId != null) {
        clearTimeout(idleId);
      }
    };
  }, [captureKey, hasCaptured, slides.length, isTransparentCaptureCategory]);

  /**
   * ✅ Dynamic box sizing (same as before)
   */
  // const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  const computeBoxForImage = useCallback(
    (src: string) => {
      // if (!src) {
      //   setBox(null);
      //   return;
      // }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = src;

      img.onload = () => {
        // const nw = img.naturalWidth || 1;
        // const nh = img.naturalHeight || 1;

        // const maxW = Math.floor(window.innerWidth * (isMobile ? 0.5 : 0.5));
        // const maxH = Math.floor(window.innerHeight * 0.5);

        // const scale = Math.min(1, maxW / nw, maxH / nh);

        // setBox({
        //   w: Math.max(1, Math.floor(nw * scale)),
        //   h: Math.max(1, Math.floor(nh * scale)),
        // });
      };

      // img.onerror = () => setBox(null);
    },
    [isMobile]
  );

  useEffect(() => {
    computeBoxForImage(currentImg);
  }, [currentImg, computeBoxForImage]);

  useEffect(() => {
    const onResize = () => computeBoxForImage(currentImg);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [currentImg, computeBoxForImage]);

  return (
    <>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3 }}>
        <Typography
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            color: "blue",
            "&:hover": { textDecoration: "underline", cursor: "pointer" },
          }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIos fontSize="small" /> exit
        </Typography>

        {/* category size + download */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{category || "Preview"}</Typography>
          </Box>

          {/* ✅ loading passed here */}
          <LandingButton title="Download" loading={downloading} onClick={handleDownload} />
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          width: "100%",
          height: "91vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "transparent",
          p: 2,
        }}>

        <Box
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
          {/* Preview box */}
          <Box
            sx={{
              width: scaledW,
              height: scaledH,
              overflow: "hidden",
              borderRadius: 3,
              boxShadow: 3,
              perspective: "1400px",
              position: "relative",
            }}
          >
            {/* BOOK */}
            <Box sx={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
              {/* CURRENT */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transformOrigin: flipDir === "next" ? "left center" : "right center",
                  transform:
                    flipping && flipDir === "next"
                      ? "rotateY(-180deg)"
                      : flipping && flipDir === "prev"
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                  transition: "transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {hasCaptured ? (
                  <Box
                    sx={{
                      width: baseW,
                      height: baseH,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <Box
                      component="img"
                      src={currentImg}
                      alt="preview"
                      sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block", bgcolor: "transparent" }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: baseW,
                      height: baseH,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {renderSlide(currentSlide ?? undefined)}
                  </Box>
                )}
              </Box>

              {/* NEXT (behind) */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transformOrigin: flipDir === "next" ? "left center" : "right center",
                  transform: flipDir === "next" ? "rotateY(180deg)" : "rotateY(-180deg)",
                }}
              >
                {hasCaptured ? (
                  <Box
                    sx={{
                      width: baseW,
                      height: baseH,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <Box
                      component="img"
                      src={nextImg}
                      alt="next"
                      sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block", bgcolor: "transparent" }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: baseW,
                      height: baseH,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {renderSlide(nextSlide ?? undefined)}
                  </Box>
                )}
              </Box>

              {/* shadow */}
              {flipping && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      flipDir === "next"
                        ? "linear-gradient(90deg, rgba(0,0,0,0.15), transparent 60%)"
                        : "linear-gradient(270deg, rgba(0,0,0,0.15), transparent 60%)",
                    opacity: 0.9,
                    transition: "opacity 360ms ease",
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Pager */}
          {slideCount >= 2 && (
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <IconButton
                onClick={goPrev}
                disabled={active === 0 || flipping}
                sx={{ border: `1px solid ${active === 0 ? "gray" : "#8D6DA1"}`, p: 1 }}
                aria-label="Previous"
              >
                <KeyboardArrowLeft fontSize="large" />
              </IconButton>

              <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                {active + 1} / {slideCount}
              </Typography>

              <IconButton
                onClick={goNext}
                disabled={active === slideCount - 1 || flipping}
                sx={{ border: `1px solid ${active === slideCount - 1 ? "gray" : "#8D6DA1"}`, p: 1 }}
                aria-label="Next"
              >
                <KeyboardArrowRight fontSize="large" />
              </IconButton>
            </Box>
          )}

        </Box>
      </Box>

      {/* Offscreen slides for download capture (when no pre-captured images) */}
      {!hasCaptured && slides.length > 0 && (
        <Box sx={{ position: "fixed", left: -10000, top: 0, opacity: 0, pointerEvents: "none" }}>
          {slides.map((sl, i) => (
            <Box
              key={sl.id ?? i}
              ref={setSlideNodeRef(i)}
              sx={{ width: config?.mmWidth ?? "auto", height: config?.mmHeight ?? "auto", position: "relative" }}
            >
              {renderSlide(sl)}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default CategoriesWisePreview;
