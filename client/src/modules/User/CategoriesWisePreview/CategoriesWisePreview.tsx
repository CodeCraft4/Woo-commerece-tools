import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import { ArrowBackIos, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { USER_ROUTES } from "../../../constant/route";
import { safeSetLocalStorage, safeSetSessionStorage } from "../../../lib/storage";
import { saveSlidesToIdb } from "../../../lib/idbSlides";
import { toJpeg } from "html-to-image";

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


const CategoriesWisePreview: React.FC = () => {
  const { state } = useLocation() as { state?: NavState };
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:450px)");

  const config = state?.config;
  const category = state?.category ?? "";
  const start = state?.slideIndex ?? 0;
  const slides = useMemo<Slide[]>(() => {
    if (state?.slides?.length) return state.slides;
    try {
      const stored = sessionStorage.getItem("templ_preview_slides");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }, [state]);

  // Change to (sessionStorage se fallback bhi add kar sakte ho)
  const captured = useMemo(() => {
    // Priority 1: route state se
    if (state?.capturedSlides?.length) return state.capturedSlides;

    // Priority 2: sessionStorage se
    try {
      const stored = sessionStorage.getItem("capturedSlides");
      if (stored) return JSON.parse(stored);
    } catch { }

    // Fallback to single mug image
    if (state?.mugImage) return [state.mugImage];

    return [];
  }, [state]);

  const [active, setActive] = useState(start);

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

  // ✅ current/next imgs
  const currentImg = hasCaptured ? captured?.[active] || "" : "";
  const nextIndex = flipDir === "next" ? Math.min(active + 1, slideCount - 1) : Math.max(active - 1, 0);
  const nextImg = hasCaptured ? captured?.[nextIndex] || currentImg : "";
  const currentSlide = !hasCaptured ? slides?.[active] : null;
  const nextSlide = !hasCaptured ? slides?.[nextIndex] : null;

  const renderSlide = useCallback((slide?: Slide) => {
    if (!slide) return null;
    const ordered = [...(slide.elements || [])].sort(
      (a, b) => (Number(a?.zIndex ?? 1) - Number(b?.zIndex ?? 1))
    );
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
                  fontFamily: el.fontFamily,
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

  const captureSlidesFromDom = async () => {
    const out: string[] = [];
    for (let i = 0; i < slides.length; i++) {
      const node = slideNodeRefs.current[i];
      if (!node) continue;
      const jpg = await toJpeg(node, {
        quality: 0.78,
        pixelRatio: 1.5,
        backgroundColor: "#ffffff",
        cacheBust: false,
        skipFonts: false,
      });
      out.push(jpg);
      await new Promise((r) => setTimeout(r, 0));
    }
    return out;
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      let list = (captured?.length ? captured : currentImg ? [currentImg] : []).filter(Boolean);
      if (!list.length && slides.length) {
        list = await captureSlidesFromDom();
      }

      // ✅ Convert ALL to JPEG (sequential)
      const out: string[] = [];
      for (let i = 0; i < list.length; i++) {
        const jpg = await toJpegDataUrl(list[i], 0.78, 1600);
        out.push(jpg);
        await new Promise((r) => setTimeout(r, 0));
      }

      // ✅ store one-by-one (slide1, slide2, slide3...)
      const slidesObj = Object.fromEntries(out.map((u, idx) => [`slide${idx + 1}`, u]));

      const payload = JSON.stringify(slidesObj);

      safeSetSessionStorage("slides", payload);

      // ✅ Keep localStorage minimal to avoid quota issues
      const minimal = slidesObj?.slide1 ? JSON.stringify({ slide1: slidesObj.slide1 }) : "{}";
      safeSetLocalStorage("slides_backup", minimal, { clearOnFail: ["slides_backup"] });

      // ✅ Store full slides in IndexedDB
      try {
        await saveSlidesToIdb(slidesObj);
      } catch { }

      // ✅ pass slides to subscription via route-state
      navigate(USER_ROUTES.SUBSCRIPTION, { state: { slides: slidesObj } });
    } catch (e) {
      console.error("Download capture failed:", e);
    } finally {
      setDownloading(false);
    }
  };

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
            <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
              {config.mmWidth} × {config.mmHeight} mm
            </Typography>
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
              width: config.mmWidth ?? "auto",
              height: config.mmHeight ?? "auto",
              maxWidth: "92vw",
              maxHeight: "72vh",
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
                    component="img"
                    src={currentImg}
                    alt="preview"
                    sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block", bgcolor: "transparent" }}
                  />
                ) : (
                  renderSlide(currentSlide ?? undefined)
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
                    component="img"
                    src={nextImg}
                    alt="next"
                    sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block", bgcolor: "transparent" }}
                  />
                ) : (
                  renderSlide(nextSlide ?? undefined)
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
