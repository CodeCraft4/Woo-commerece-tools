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


  const isMobile = useMediaQuery("(max-width:480px)");
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


  const slideRefs: any = {
    s1: useRef(null),
    s2: useRef(null),
    s3: useRef(null),
    s4: useRef(null),
  };

  const [slideImages, setSlideImages] = useState({
    slide1: "",
    slide2: "",
    slide3: "",
    slide4: "",
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("card_preview_downloaded", "0");
    } catch {}
  }, []);


  console.log(slideImages, "slideImages")

  const captureSlides = async () => {
    setLoading(true)
    const results: any = {};

    // 1️⃣ Disable transform ONLY on slide sections
    const slidesForCapture = document.querySelectorAll(".capture-slide");
    slidesForCapture.forEach((el) => {
      el.classList.add("capture-no-transform");
    });

    // 2️⃣ Capture each slide
    for (let key of ["s1", "s2", "s3", "s4"]) {
      const node = slideRefs[key].current;
      if (!node) continue;

      const dataUrl = await toJpeg(node, {
        cacheBust: true,
        pixelRatio: 1.5,
        quality: 0.8,
        skipFonts: true,
        fontEmbedCSS: "",
      });


      results[key.replace("s", "slide")] = dataUrl;
    }

    // 3️⃣ Restore transforms
    slidesForCapture.forEach((el) => {
      el.classList.remove("capture-no-transform");
    });

    setSlideImages(results);
    setLoading(false)
    return results;
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
  const areaW = Math.max(260, (previewArea.w || viewport.w || 0) - 8);
  const areaH = Math.max(360, (previewArea.h || viewport.h || 0) - 8);
  const mobileScale = Math.min(1, areaW / BASE_PAGE.w, areaH / BASE_PAGE.h);


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
            className="book-container mobile-only"
            style={{
              width: `${BASE_PAGE.w * mobileScale}px`,
              height: `${BASE_PAGE.h * mobileScale}px`,
            }}
          >
            <div
              className="mobile-slide"
              aria-live="polite"
              style={{
                width: `${BASE_PAGE.w}px`,
                height: `${BASE_PAGE.h}px`,
                transform: `scale(${mobileScale})`,
                transformOrigin: "top left",
              }}
            >
              {slides[mobileIndex - 1]}
            </div>
          </div>
        ) : (
          // DESKTOP/TABLET: 3D flip-book
          <div className="book-container">
            <div id="book" className="book"
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
                    <Slide1 ref={slideRefs.s1} />
                  </div>
                </div>
                <div className="back">
                  <div className="back-content capture-slide" id="b1">
                    <Slide2 ref={slideRefs.s2} />
                  </div>
                </div>
              </div>

              {/* Paper 2 */}
              <div id="p2" className={`paper ${currentLocation > 2 ? "flipped" : ""}`}
                style={{ zIndex: currentLocation > 2 ? 2 : 1 }}
              >
                <div className="front">
                  <div className="front-content capture-slide" id="f2">
                    <Slide3 ref={slideRefs.s3} />
                  </div>
                </div>
                <div className="back">
                  <div className="back-content capture-slide" id="b2">
                    <Slide4 ref={slideRefs.s4} />
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
