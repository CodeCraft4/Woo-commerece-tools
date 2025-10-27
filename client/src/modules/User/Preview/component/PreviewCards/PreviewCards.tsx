import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "./card.css";
import GlobalWatermark from "../../../../../components/GlobalWatermark/GlobalWatermark";
import Slide1 from "../Slide1/Slide1";
import Slide2 from "../Slide2/Slide2";
import Slide3 from "../Slide3/Slide3";
import Slide4 from "../Slide4/Slide4";

const PreviewBookCard = () => {
  const [currentLocation, setCurrentLocation] = useState(1);

  const numOfPapers = 2;
  const maxLocation = numOfPapers + 1;

  const goNextPage = () => {
    if (currentLocation < maxLocation) {
      setCurrentLocation((prev) => prev + 1);
    }
  };

  const goPrevPage = () => {
    if (currentLocation > 1) {
      setCurrentLocation((prev) => prev - 1);
    }
  };

  const getBookTransform = () => {
    if (currentLocation === 1) return "translateX(0%)";
    if (currentLocation === maxLocation) return "translateX(100%)";
    return "translateX(50%)";
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        m: "auto",
        flexDirection: "column",
        mt: 2,
      }}
    >
      <div className="book-container">
        {/* Book */}
        <div
          id="book"
          className="book"
          style={{
            transform: getBookTransform(),
            transition: "transform 0.5s ease",
          }}
        >
          {/* Paper 1 */}
          <div
            id="p1"
            className={`paper ${currentLocation > 1 ? "flipped" : ""}`}
            style={{ zIndex: currentLocation > 1 ? 1 : 2 }}
          >
            <div className="front">
              <div id="sf1" className="front-content">
                {/* First Slide */}
                <Slide1 />
              </div>
            </div>
            <div className="back">
              <div id="b1" className="back-content">
                {/* Spread 2nd Slide */}
                <Slide2 />
              </div>
            </div>
          </div>

          {/* Paper 2 */}
          <div
            id="p2"
            className={`paper ${currentLocation > 2 ? "flipped" : ""}`}
            style={{ zIndex: currentLocation > 2 ? 2 : 1 }}
          >
            <div className="front">
              <div id="f2" className="front-content">
                {/* Spread 3rd Slide */}
                <Slide3 />
              </div>
            </div>
            <div className="back">
              <div id="b2" className="back-content">
                {/* 4th Last Slide */}
                <Slide4 />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Box sx={{ display: "flex", gap: "10px", alignItems: "center", mt: 3 }}>
        {/* Prev Button */}
        <IconButton
          id="prev-btn"
          onClick={goPrevPage}
          disabled={currentLocation === 1}
          sx={{
            ...changeModuleBtn,
            border: `${
              currentLocation === 1 ? "1px solid gray" : "1px solid #3a7bd5"
            }`,
          }}
        >
          <KeyboardArrowLeft fontSize="large" />
        </IconButton>

        {/* Next Button */}
        <IconButton
          id="next-btn"
          onClick={goNextPage}
          disabled={currentLocation === maxLocation}
          sx={{
            ...changeModuleBtn,
            border: `${
              currentLocation === maxLocation
                ? "1px solid gray"
                : "1px solid #3a7bd5"
            }`,
          }}
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
