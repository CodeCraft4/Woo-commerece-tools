import { useEffect, useMemo, useRef, useState } from "react";
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
import { toJpeg } from "html-to-image";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import toast from "react-hot-toast";
import { safeSetLocalStorage, safeSetSessionStorage } from "../../../../../lib/storage";
import { saveSlidesToIdb } from "../../../../../lib/idbSlides";

const PreviewBookCard = () => {
  // currentLocation is 1..(numOfPapers+1) for the flip-book
  const [currentLocation, setCurrentLocation] = useState(1);
  // single index for mobile 1..4
  const [mobileIndex, setMobileIndex] = useState(1);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()


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


  const captureRefs = {
    s1: useRef<HTMLDivElement | null>(null),
    s2: useRef<HTMLDivElement | null>(null),
    s3: useRef<HTMLDivElement | null>(null),
    s4: useRef<HTMLDivElement | null>(null),
  };

  useEffect(() => {
    try {
      sessionStorage.setItem("card_preview_downloaded", "0");
    } catch {}
  }, []);

  const captureSlides = async () => {
    setLoading(true);
    try {
      const results: any = {};

      // Ensure web fonts are loaded before capture to preserve text styling.
      if ((document as any)?.fonts?.ready) {
        await (document as any).fonts.ready;
      }

      for (let key of ["s1", "s2", "s3", "s4"]) {
        const node = captureRefs[key as keyof typeof captureRefs].current;
        if (!node) continue;

        const dataUrl = await toJpeg(node, {
          cacheBust: true,
          pixelRatio: 2,
          quality: 0.9,
          skipFonts: false,
          backgroundColor: "#ffffff",
        });

        results[key.replace("s", "slide")] = dataUrl;
      }

      if (!Object.keys(results).length) {
        throw new Error("Unable to capture card slides. Please try again.");
      }

      return results;
    } finally {
      setLoading(false);
    }
  };

  const persistSlides = async (slidesCaptured: Record<string, string>) => {
    const payload = JSON.stringify(slidesCaptured);

    safeSetSessionStorage("slides", payload);

    // Keep localStorage minimal to avoid quota issues.
    const minimal = slidesCaptured?.slide1 ? JSON.stringify({ slide1: slidesCaptured.slide1 }) : "{}";
    safeSetLocalStorage("slides_backup", minimal, { clearOnFail: ["slides_backup"] });

    try {
      await saveSlidesToIdb(slidesCaptured);
    } catch {
      // ignore; session/local already cover fallback
    }
  };

  const BASE_PAGE = { w: 500, h: 700 };
  const BASE_BOOK = { w: 1000, h: 700 };
  const areaW = Math.max(260, (previewArea.w || viewport.w || 0) - 8);
  const areaH = Math.max(320, (previewArea.h || viewport.h || 0) - 8);
  const mobileScale = Math.min(1, areaW / BASE_PAGE.w, areaH / BASE_PAGE.h);
  const bookScale = Math.min(1, areaW / BASE_BOOK.w, areaH / BASE_BOOK.h);


  return (
    <>
      <Box sx={{ display: "flex", gap: 3, justifyContent: 'flex-end', alignItems: 'flex-end', m: 'auto', p: 2, mt: -9 }}>
        <LandingButton
          title="Download"
          loading={loading}
          onClick={async () => {
            try {
              const slidesCaptured = await captureSlides();
              await persistSlides(slidesCaptured);
              try {
                sessionStorage.setItem("card_preview_downloaded", "1");
              } catch {}
              navigate(USER_ROUTES.SUBSCRIPTION, { state: { slides: slidesCaptured } });
            } catch (err: any) {
              toast.error(err?.message || "Failed to prepare download preview");
            }
          }}
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
        sx={{
          position: "fixed",
          left: -10000,
          top: -10000,
          pointerEvents: "none",
        }}
      >
        <Box sx={{ width: BASE_PAGE.w, height: BASE_PAGE.h }}>
          <Slide1 ref={captureRefs.s1} />
        </Box>
        <Box sx={{ width: BASE_PAGE.w, height: BASE_PAGE.h }}>
          <Slide2 ref={captureRefs.s2} />
        </Box>
        <Box sx={{ width: BASE_PAGE.w, height: BASE_PAGE.h }}>
          <Slide3 ref={captureRefs.s3} />
        </Box>
        <Box sx={{ width: BASE_PAGE.w, height: BASE_PAGE.h }}>
          <Slide4 ref={captureRefs.s4} />
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
