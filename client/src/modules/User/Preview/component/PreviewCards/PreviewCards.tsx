// src/features/PreviewCard/PreviewBookCard.tsx
import { useMemo, useState } from "react";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "./card.css";
import GlobalWatermark from "../../../../../components/GlobalWatermark/GlobalWatermark";
import Slide1 from "../Slide1/Slide1";
import Slide2 from "../Slide2/Slide2";
import Slide3 from "../Slide3/Slide3";
import Slide4 from "../Slide4/Slide4";

const PreviewBookCard = () => {
  // currentLocation is 1..(numOfPapers+1) for the flip-book
  const [currentLocation, setCurrentLocation] = useState(1);
  // single index for mobile 1..4
  const [mobileIndex, setMobileIndex] = useState(1);

  const isMobile = useMediaQuery("(max-width:480px)");

  const numOfPapers = 2; // 4 slides across 2 papers
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

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", m: "auto", flexDirection: "column"}}>
      {/* MOBILE: one slide at a time */}
      {isMobile ? (
        <div className="book-container mobile-only">
          <div className="mobile-slide" aria-live="polite">
            {slides[mobileIndex - 1]}
          </div>
        </div>
      ) : (
        // DESKTOP/TABLET: 3D flip-book
        <div className="book-container">
          <div
            id="book"
            className="book"
            style={{
              transform: getBookTransform(),
              transition: "transform 0.5s ease",
            }}
          >
            {/* Paper 1 */}
            <div id="p1" className={`paper ${currentLocation > 1 ? "flipped" : ""}`} style={{ zIndex: currentLocation > 1 ? 1 : 2 }}>
              <div className="front">
                <div id="sf1" className="front-content">
                  <Slide1 />
                </div>
              </div>
              <div className="back">
                <div id="b1" className="back-content">
                  <Slide2 />
                </div>
              </div>
            </div>

            {/* Paper 2 */}
            <div id="p2" className={`paper ${currentLocation > 2 ? "flipped" : ""}`} style={{ zIndex: currentLocation > 2 ? 2 : 1 }}>
              <div className="front">
                <div id="f2" className="front-content">
                  <Slide3 />
                </div>
              </div>
              <div className="back">
                <div id="b2" className="back-content">
                  <Slide4 />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
