import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "./card.css";
import GlobalWatermark from "../../../../../components/GlobalWatermark/GlobalWatermark";
import Slide1 from "../Slide1/Slide1";
import Slide2 from "../Slide2/Slide2";
import Slide3 from "../Slide3/Slide3";
import Slide4 from "../Slide4/Slide4";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../../../constant/route";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { clearSlidesFromIdb, saveSlidesToIdb } from "../../../../../lib/idbSlides";
import { resolveSlidesScopeCandidates, saveSlidesToScopes } from "../../../../../lib/slidesScope";
import { toJpeg } from "html-to-image";
import toast from "react-hot-toast";
import { isIosTouchDevice } from "../../../../../lib/platform";
import { useSlide1 } from "../../../../../context/Slide1Context";
import { useSlide2 } from "../../../../../context/Slide2Context";
import { useSlide3 } from "../../../../../context/Slide3Context";
import { useSlide4 } from "../../../../../context/Slide4Context";
import { renderTemplateSlideToCanvasWithStats, type TemplateSlide } from "../../../../../lib/templateSlideCanvas";
import { buildGoogleFontsUrls, ensureGoogleFontsLoaded, loadGoogleFontsOnce } from "../../../../../constant/googleFonts";

type CaptureSlideKey = "slide1" | "slide2" | "slide3" | "slide4";

const CAPTURE_ORDER: CaptureSlideKey[] = ["slide1", "slide2", "slide3", "slide4"];
const CAPTURE_SIZE = { w: 500, h: 700 };
const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

const buildCardSlidesScopeKeys = () => {
  try {
    const storedProduct = JSON.parse(localStorage.getItem("selectedProduct") || "{}");
    const productKey =
      storedProduct?.id && storedProduct?.type ? `${storedProduct.type}:${storedProduct.id}` : "";
    const selectedVariant = JSON.parse(localStorage.getItem("selectedVariant") || "{}");
    return resolveSlidesScopeCandidates({
      includeStoredDraft: true,
      productKey,
      category:
        localStorage.getItem("selectedCategory") ||
        storedProduct?.category ||
        "",
      cardSize: localStorage.getItem("selectedSize") || selectedVariant?.key || "",
    });
  } catch {
    return resolveSlidesScopeCandidates({ includeStoredDraft: true });
  }
};

const normalizeFontFamily = (value?: string | null) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const quoted = raw.match(/['"]([^'"]+)['"]/);
  if (quoted?.[1]) return quoted[1].trim();
  const first = raw.split(",")[0]?.trim() ?? "";
  return first.replace(/^['"]|['"]$/g, "").trim();
};

const layoutToTemplateSlide = (id: number, layout: any, bgColor?: string | null): TemplateSlide => {
  const imageElements = Array.isArray(layout?.elements)
    ? layout.elements
        .filter((el: any) => String(el?.src ?? "").trim())
        .map((el: any) => ({
          id: String(el?.id ?? `img-${id}-${Math.random()}`),
          type: "image" as const,
          src: String(el?.src ?? ""),
          x: Number(el?.x ?? 0),
          y: Number(el?.y ?? 0),
          width: Number(el?.width ?? 0),
          height: Number(el?.height ?? 0),
          zIndex: Number(el?.zIndex ?? 1),
        }))
    : [];

  const stickerElements = Array.isArray(layout?.stickers)
    ? layout.stickers
        .filter((st: any) => String(st?.sticker ?? "").trim())
        .map((st: any) => ({
          id: String(st?.id ?? `st-${id}-${Math.random()}`),
          type: "sticker" as const,
          src: String(st?.sticker ?? ""),
          x: Number(st?.x ?? 0),
          y: Number(st?.y ?? 0),
          width: Number(st?.width ?? 0),
          height: Number(st?.height ?? 0),
          zIndex: Number(st?.zIndex ?? 50),
        }))
    : [];

  const textElements = Array.isArray(layout?.textElements)
    ? layout.textElements
        .filter((te: any) => String(te?.text ?? "").trim().length > 0)
        .map((te: any) => ({
          id: String(te?.id ?? `txt-${id}-${Math.random()}`),
          type: "text" as const,
          text: String(te?.text ?? ""),
          x: Number(te?.x ?? 0),
          y: Number(te?.y ?? 0),
          width: Number(te?.width ?? 0),
          height: Number(te?.height ?? 0),
          zIndex: Number(te?.zIndex ?? 100),
          color: String(te?.color ?? "#111111"),
          fontSize: Number(te?.fontSize ?? 20),
          fontFamily: String(te?.fontFamily ?? "Arial"),
          fontWeight: te?.bold ? 700 : te?.fontWeight ?? 400,
          fontStyle: te?.italic ? "italic" : "normal",
          textDecoration: te?.underline ? "underline" : "none",
          lineHeight: Number(te?.lineHeight ?? 1.16),
          align:
            te?.textAlign === "left" || te?.textAlign === "right" || te?.textAlign === "center"
              ? te.textAlign
              : "center",
          rotation: Number(te?.rotation ?? 0),
        }))
    : [];

  return {
    id,
    label: `slide${id}`,
    bgColor: String(bgColor ?? "transparent"),
    elements: [...imageElements, ...stickerElements, ...textElements],
  };
};

const PreviewBookCard = () => {
  // currentLocation is 1..(numOfPapers+1) for the flip-book
  const [currentLocation, setCurrentLocation] = useState(1);
  // single index for mobile 1..4
  const [mobileIndex, setMobileIndex] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const isIosWebKit = useMemo(() => isIosTouchDevice(), []);
  const { layout1, bgColor1 } = useSlide1();
  const { layout2, bgColor2 } = useSlide2();
  const { layout3, bgColor3 } = useSlide3();
  const { layout4, bgColor4 } = useSlide4();


  const isMobile = useMediaQuery("(max-width:500px)");
  const previewAreaRef = useRef<HTMLDivElement | null>(null);
  const [previewArea, setPreviewArea] = useState({ w: 0, h: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined") return;
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!previewAreaRef.current || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      setPreviewArea({ w: cr.width, h: cr.height });
    });
    obs.observe(previewAreaRef.current);
    return () => obs.disconnect();
  }, []);

  const numOfPapers = 2;
  const maxLocation = numOfPapers + 1;

  const slides = useMemo(() => [<Slide1 key="s1" />, <Slide2 key="s2" />, <Slide3 key="s3" />, <Slide4 key="s4" />], []);

  const goNextPage = () => {
    if (isMobile) {
      setMobileIndex((i) => Math.min(i + 1, slides.length));
      return;
    }
    if (currentLocation < maxLocation) setCurrentLocation((prev) => prev + 1);
  };

  const goPrevPage = () => {
    if (isMobile) {
      setMobileIndex((i) => Math.max(i - 1, 1));
      return;
    }
    if (currentLocation > 1) setCurrentLocation((prev) => prev - 1);
  };

  const getBookTransform = () => {
    if (currentLocation === 1) return "translateX(0%)";
    if (currentLocation === maxLocation) return "translateX(100%)";
    return "translateX(50%)";
  };

  const isPrevDisabled = isMobile ? mobileIndex === 1 : currentLocation === 1;
  const isNextDisabled = isMobile ? mobileIndex === slides.length : currentLocation === maxLocation;

  useEffect(() => {
    try {
      sessionStorage.setItem("card_preview_downloaded", "0");
    } catch {}
  }, []);

  const BASE_PAGE = { w: 500, h: 700 };
  const BASE_BOOK = { w: 1000, h: 700 };
  const areaW = Math.max(260, (previewArea.w || viewport.w || 0) - 8);
  const areaH = Math.max(320, (previewArea.h || viewport.h || 0) - 8);
  const mobileScale = Math.min(1, areaW / BASE_PAGE.w, areaH / BASE_PAGE.h);
  const bookScale = Math.min(1, areaW / BASE_BOOK.w, areaH / BASE_BOOK.h);
  const captureRefs = useRef<Record<CaptureSlideKey, HTMLDivElement | null>>({
    slide1: null,
    slide2: null,
    slide3: null,
    slide4: null,
  });

  const setCaptureRef = (key: CaptureSlideKey) => (node: HTMLDivElement | null) => {
    captureRefs.current[key] = node;
  };

  const waitForNodeAssets = useCallback(async (node: HTMLElement) => {
    const images = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const el = img as HTMLImageElement;
            if (el.complete) {
              resolve();
              return;
            }
            const done = () => resolve();
            el.addEventListener("load", done, { once: true });
            el.addEventListener("error", done, { once: true });
          }),
      ),
    );
    if ((document as any)?.fonts?.ready) {
      try {
        await (document as any).fonts.ready;
      } catch {}
    }
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }, []);

  const captureCardSlides = useCallback(async () => {
    const captured: string[] = [];

    for (let i = 0; i < CAPTURE_ORDER.length; i += 1) {
      const key = CAPTURE_ORDER[i];
      const node = captureRefs.current[key];
      if (!node) {
        captured.push("");
        continue;
      }
      await waitForNodeAssets(node);
      let capturedUrl = "";
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const rect = node.getBoundingClientRect();
          const maxSide = Math.max(rect.width || CAPTURE_SIZE.w, rect.height || CAPTURE_SIZE.h);
          const ratio = maxSide ? 1800 / maxSide : 1.5;
          const pixelRatio = Math.min(2.25, Math.max(1, ratio));
          capturedUrl = await toJpeg(node, {
            quality: 0.9,
            pixelRatio,
            backgroundColor: "#ffffff",
            cacheBust: true,
            imagePlaceholder: TRANSPARENT_PIXEL,
            width: CAPTURE_SIZE.w,
            height: CAPTURE_SIZE.h,
            style: { transform: "none" },
          });
          if (capturedUrl.startsWith("data:image/")) break;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      captured.push(capturedUrl);
      if (i < CAPTURE_ORDER.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const slidesObj = Object.fromEntries(
      CAPTURE_ORDER.map((_, idx) => {
        const dataUrl = captured[idx];
        return [`slide${idx + 1}`, dataUrl];
      }).filter(([, dataUrl]) => typeof dataUrl === "string" && dataUrl.startsWith("data:image/")),
    ) as Record<string, string>;

    return {
      captured,
      slidesObj,
      validCount: Object.keys(slidesObj).length,
    };
  }, [waitForNodeAssets]);

  const captureCardSlidesFromCanvasRenderer = useCallback(async () => {
    const slides = [
      layoutToTemplateSlide(1, layout1, bgColor1),
      layoutToTemplateSlide(2, layout2, bgColor2),
      layoutToTemplateSlide(3, layout3, bgColor3),
      layoutToTemplateSlide(4, layout4, bgColor4),
    ];

    const fonts = new Set<string>();
    slides.forEach((slide) => {
      slide.elements.forEach((el: any) => {
        if (el?.type !== "text") return;
        const fam = normalizeFontFamily(el?.fontFamily);
        if (!fam) return;
        const low = fam.toLowerCase();
        if (["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"].includes(low)) return;
        fonts.add(fam);
      });
    });
    if (fonts.size) {
      const urls = buildGoogleFontsUrls(Array.from(fonts));
      loadGoogleFontsOnce(urls);
      await ensureGoogleFontsLoaded(urls);
    }
    if ((document as any)?.fonts?.ready) {
      try {
        await (document as any).fonts.ready;
      } catch {}
    }

    const captured: string[] = [];
    for (let i = 0; i < slides.length; i += 1) {
      const slide = slides[i];
      try {
        const rendered = await renderTemplateSlideToCanvasWithStats(slide, {
          width: CAPTURE_SIZE.w,
          height: CAPTURE_SIZE.h,
          pixelRatio: 2.5,
          backgroundColor: "#ffffff",
        });
        if (rendered.expectedAssets > 0 && rendered.drawnAssets < rendered.expectedAssets) {
          captured.push("");
          continue;
        }
        captured.push(rendered.canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        captured.push("");
      }
      if (i < slides.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const slidesObj = Object.fromEntries(
      CAPTURE_ORDER.map((_, idx) => {
        const dataUrl = captured[idx];
        return [`slide${idx + 1}`, dataUrl];
      }).filter(([, dataUrl]) => typeof dataUrl === "string" && dataUrl.startsWith("data:image/")),
    ) as Record<string, string>;

    return {
      captured,
      slidesObj,
      validCount: Object.keys(slidesObj).length,
    };
  }, [bgColor1, bgColor2, bgColor3, bgColor4, layout1, layout2, layout3, layout4]);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const domResult = isIosWebKit ? null : await captureCardSlides();
      const iosCanvasResult = isIosWebKit ? await captureCardSlidesFromCanvasRenderer() : null;
      const activeResult = iosCanvasResult ?? domResult ?? { captured: [], slidesObj: {}, validCount: 0 };
      const { captured, slidesObj, validCount } = activeResult;
      const expectedCount = CAPTURE_ORDER.length;
      const previewOnly = validCount < expectedCount;

      try {
        sessionStorage.removeItem("slides");
        sessionStorage.removeItem("templ_preview_slides");
        sessionStorage.removeItem("templ_preview_key");
        sessionStorage.removeItem("templ_preview_config");
        sessionStorage.setItem("slides_preview_only", previewOnly ? "1" : "0");
        sessionStorage.setItem("rawSlidesCount", String(expectedCount));
        sessionStorage.setItem("card_preview_downloaded", "1");
        sessionStorage.removeItem("capturedSlidesKey");
        if (!previewOnly && validCount) {
          const validList = captured.filter((url) => String(url).startsWith("data:image/"));
          sessionStorage.setItem("capturedSlides", JSON.stringify(validList));
        } else {
          sessionStorage.removeItem("capturedSlides");
        }
      } catch {}

      try {
        if (!previewOnly && validCount) {
          (globalThis as any).__slidesCache = slidesObj;
        } else {
          delete (globalThis as any).__slidesCache;
        }
      } catch {}

      if (!previewOnly && validCount) {
        const scopeKeys = buildCardSlidesScopeKeys();
        void saveSlidesToScopes(scopeKeys, slidesObj);
        void saveSlidesToIdb(slidesObj);
        try {
          const minimal = slidesObj?.slide1 ? JSON.stringify({ slide1: slidesObj.slide1 }) : "{}";
          localStorage.setItem("slides_backup", minimal);
        } catch {}
      } else {
        try {
          localStorage.removeItem("slides_backup");
        } catch {}
        try {
          void clearSlidesFromIdb();
        } catch {}
      }

      if (previewOnly) {
        toast.error("Could not capture the full card preview. Please try again.");
        return;
      }

      navigate(USER_ROUTES.SUBSCRIPTION, {
        state: {
          slides: slidesObj,
          previewOnly: false,
        },
      });
    } catch {
      toast.error("Could not prepare preview. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [captureCardSlides, captureCardSlidesFromCanvasRenderer, downloading, isIosWebKit, navigate]);


  return (
    <>
      <Box sx={{ display: "flex", gap: 3, justifyContent: 'flex-end', alignItems: 'flex-end', m: 'auto', p: 2, mt: -9 }}>
        <LandingButton
          title="Download"
          loading={downloading}
          onClick={handleDownload}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", m: "auto", flexDirection: "column", mt: 4 }}>
        <Box
          ref={previewAreaRef}
          sx={{
            width: "100%",
            maxWidth: "92vw",
            height: isMobile ? "70vh" : "72vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
        {/* MOBILE: one slide at a time */}
        {isMobile ? (
          <div
            style={{
              width: `${BASE_PAGE.w * mobileScale}px`,
              height: `${BASE_PAGE.h * mobileScale}px`,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${BASE_PAGE.w}px`,
                height: `${BASE_PAGE.h}px`,
                transform: `scale(${mobileScale})`,
                transformOrigin: "top left",
                position: "absolute",
                inset: 0,
              }}
            >
              <div
                className="book-container mobile-only"
                style={{ width: `${BASE_PAGE.w}px`, height: `${BASE_PAGE.h}px` }}
              >
                <div
                  className="mobile-slide"
                  aria-live="polite"
                  style={{ width: `${BASE_PAGE.w}px`, height: `${BASE_PAGE.h}px` }}
                >
                  {slides[mobileIndex - 1]}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // DESKTOP/TABLET: 3D flip-book
          <div
            style={{
              width: `${BASE_BOOK.w * bookScale}px`,
              height: `${BASE_BOOK.h * bookScale}px`,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${BASE_BOOK.w}px`,
                height: `${BASE_BOOK.h}px`,
                transform: `scale(${bookScale})`,
                transformOrigin: "top left",
                position: "absolute",
                inset: 0,
              }}
            >
              <div className="book-container" style={{ width: `${BASE_BOOK.w}px`, height: `${BASE_BOOK.h}px` }}>
                <div
                  id="book"
                  className="book"
                  style={{
                    transform: getBookTransform(),
                    transition: "transform 0.5s ease",
                  }}
                >

              {/* Paper 1 */}
              <div id="p1" className={`paper ${currentLocation > 1 ? "flipped" : ""}`}
                style={{ zIndex: currentLocation > 1 ? 1 : 2 }}
              >
                <div className="front">
                  <div className="front-content capture-slide" id="sf1">
                    <Slide1 />
                  </div>
                </div>
                <div className="back">
                  <div className="back-content capture-slide" id="b1">
                    <Slide2 />
                  </div>
                </div>
              </div>

              {/* Paper 2 */}
              <div id="p2" className={`paper ${currentLocation > 2 ? "flipped" : ""}`}
                style={{ zIndex: currentLocation > 2 ? 2 : 1 }}
              >
                <div className="front">
                  <div className="front-content capture-slide" id="f2">
                    <Slide3 />
                  </div>
                </div>
                <div className="back">
                  <div className="back-content capture-slide" id="b2">
                    <Slide4 />
                  </div>
                </div>
              </div>

                </div>
              </div>
            </div>
          </div>

        )}
        </Box>

        {/* Controls */}
        <Box sx={{ display: "flex", gap: "10px", alignItems: "center", mt: 3 }}>
          <IconButton
            id="prev-btn"
            onClick={goPrevPage}
            disabled={isPrevDisabled}
            sx={{
              ...changeModuleBtn,
              border: `${isPrevDisabled ? "1px solid gray" : "1px solid #8D6DA1"}`,
            }}
            aria-label="Previous page"
          >
            <KeyboardArrowLeft fontSize="large" />
          </IconButton>

          <IconButton
            id="next-btn"
            onClick={goNextPage}
            disabled={isNextDisabled}
            sx={{
              ...changeModuleBtn,
              border: `${isNextDisabled ? "1px solid gray" : "1px solid #8D6DA1"}`,
            }}
            aria-label="Next page"
          >
            <KeyboardArrowRight fontSize="large" />
          </IconButton>
        </Box>
        <GlobalWatermark />
      </Box>

      <Box
        aria-hidden
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          opacity: 0.01,
          pointerEvents: "none",
          zIndex: -1,
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
      >
        <Box ref={setCaptureRef("slide1")} sx={{ width: `${CAPTURE_SIZE.w}px`, height: `${CAPTURE_SIZE.h}px` }}>
          <Slide1 />
        </Box>
        <Box ref={setCaptureRef("slide2")} sx={{ width: `${CAPTURE_SIZE.w}px`, height: `${CAPTURE_SIZE.h}px` }}>
          <Slide2 />
        </Box>
        <Box ref={setCaptureRef("slide3")} sx={{ width: `${CAPTURE_SIZE.w}px`, height: `${CAPTURE_SIZE.h}px` }}>
          <Slide3 />
        </Box>
        <Box ref={setCaptureRef("slide4")} sx={{ width: `${CAPTURE_SIZE.w}px`, height: `${CAPTURE_SIZE.h}px` }}>
          <Slide4 />
        </Box>
      </Box>
    </>

  );
};

export default PreviewBookCard;

const changeModuleBtn = {
  border: "1px solid #3a7bd5",
  p: 1,
  display: "flex",
  justifyContent: "center",
  color: "#212121",
  alignItems: "center",
  "&.Mui-disabled": {
    color: "gray",
    cursor: "default",
    pointerEvents: "none",
  },
};
