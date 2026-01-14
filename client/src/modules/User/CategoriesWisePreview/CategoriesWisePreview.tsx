import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import { ArrowBackIos, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { USER_ROUTES } from "../../../constant/route";

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

  // ✅ captured images list (mug fallback)
  const captured = useMemo(() => {
    const list = state?.capturedSlides ?? [];
    if (state?.mugImage && !list.length) return [state.mugImage];
    return list;
  }, [state?.capturedSlides, state?.mugImage]);

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

  // ✅ slides count
  const slideCount = Math.max(1, captured?.length || 0);

  // ✅ current/next imgs
  const currentImg = captured?.[active] || "";
  const nextIndex = flipDir === "next" ? Math.min(active + 1, slideCount - 1) : Math.max(active - 1, 0);
  const nextImg = captured?.[nextIndex] || currentImg;

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

 const handleDownload = async () => {
  try {
    setDownloading(true);

    const list = (captured?.length ? captured : currentImg ? [currentImg] : []).filter(Boolean);

    // ✅ Convert ALL to JPEG (sequential)
    const out: string[] = [];
    for (let i = 0; i < list.length; i++) {
      const jpg = await toJpegDataUrl(list[i], 0.78, 1600);
      out.push(jpg);
      await new Promise((r) => setTimeout(r, 0));
    }

    // ✅ store one-by-one (slide1, slide2, slide3...)
    const slidesObj = Object.fromEntries(out.map((u, idx) => [`slide${idx + 1}`, u]));

    // ✅ Full slides for PDF after payment
    localStorage.setItem("slides_backup", JSON.stringify(slidesObj));
    sessionStorage.removeItem("slides");

    // ✅ pass slides to subscription via route-state
    navigate(USER_ROUTES.SUBSCRIPTION, { state: { slides: slidesObj } });

    console.log(slidesObj, "stored slides obj");
  } catch (e) {
    console.error("Download capture failed:", e);
  } finally {
    setDownloading(false);
  }
};

  /**
   * ✅ Dynamic box sizing (same as before)
   */
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  const computeBoxForImage = useCallback(
    (src: string) => {
      if (!src) {
        setBox(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = src;

      img.onload = () => {
        const nw = img.naturalWidth || 1;
        const nh = img.naturalHeight || 1;

        const maxW = Math.floor(window.innerWidth * (isMobile ? 0.92 : 0.70));
        const maxH = Math.floor(window.innerHeight * 0.72);

        const scale = Math.min(1, maxW / nw, maxH / nh);

        setBox({
          w: Math.max(1, Math.floor(nw * scale)),
          h: Math.max(1, Math.floor(nh * scale)),
        });
      };

      img.onerror = () => setBox(null);
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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
        {/* Preview box */}
        <Box
          sx={{
            width: box?.w ?? "auto",
            height: box?.h ?? "auto",
            maxWidth: "92vw",
            maxHeight: "72vh",
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: 3,
            perspective: "1400px",
            position: "relative",
            bgcolor: "transparent",
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
              <Box
                component="img"
                src={currentImg}
                alt="preview"
                sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block", bgcolor: "transparent" }}
              />
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
              <Box
                component="img"
                src={nextImg}
                alt="next"
                sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block", bgcolor: "transparent" }}
              />
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
    </>
  );
};

export default CategoriesWisePreview;
