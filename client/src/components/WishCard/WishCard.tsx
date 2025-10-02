import { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SlideCover from "../SlideCover/SlideCover";
import SlideLogo from "../SlideLogo/SlideLogo";
import SlideSpread from "../SpreadSheet/SpreadSheat";
import LayoutPopup from "../LayoutPopup/LayoutPopup";
import VideoPopup from "../VideoPopup/VideoPopup";
import MediaPopup from "../MediaPopup/MediaPopup";
import StickerPopup from "../StickerPopup/StickerPopup";
import FontSizePopup from "../FontSizePopup/FontSizePopup";
import PhotoPopup from "../PhotoPopup/PhotoPopup";
import TextPopup from "../TextPopup/TextPopup";
import GeneAIPopup from "../GeneAIPopup/GeneAI";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from './../../../node_modules/react-dnd-html5-backend/dist/index';

const slides = ["Slide1", "Slide2", "Slide3"];

const WishCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePopup, setActivePopup] = useState(null);

  // ==============VIDEO UPLOADING=======================
  const [showFontSizePopup, setShowFontSizePopup] = useState(false);
  // Toggle popup on icon click
  const togglePopup = (name: any) => {
    setActivePopup((prev) => (prev === name ? null : name));
  };

  // Main box scroll refs and drag state
  const mainRef: any = useRef(null);
  const isMainDragging: any = useRef(false);
  const mainStartX: any = useRef(0);
  const mainScrollLeft: any = useRef(0);

  // Thumbnail scroll refs and drag state
  const thumbRef: any = useRef(null);
  const isThumbDragging: any = useRef(false);
  const thumbStartX: any = useRef(0);
  const thumbScrollLeft: any = useRef(0);

  // Scroll thumbnails container by fixed amount
  const scrollThumbnails = (direction: any) => {
    if (!thumbRef.current) return;
    const scrollAmount = 100;
    if (direction === "left") {
      thumbRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      thumbRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Main drag handlers
  const onMainMouseDown = (e: any) => {
    isMainDragging.current = true;
    mainStartX.current = e.pageX - mainRef.current.offsetLeft;
    mainScrollLeft.current = mainRef.current.scrollLeft;
  };
  const onMainMouseLeave = () => {
    isMainDragging.current = false;
  };
  const onMainMouseUp = () => {
    isMainDragging.current = false;
  };
  // const onMainMouseMove = (e: any) => {
  //   if (!isMainDragging.current) return;
  //   e.preventDefault();
  //   const x = e.pageX - mainRef.current.offsetLeft;
  //   const walk = (x - mainStartX.current) * 2;
  //   mainRef.current.scrollLeft = mainScrollLeft.current - walk;
  // };

  // Thumbnail drag handlers
  const onThumbMouseDown = (e: any) => {
    isThumbDragging.current = true;
    thumbStartX.current = e.pageX - thumbRef.current.offsetLeft;
    thumbScrollLeft.current = thumbRef.current.scrollLeft;
  };
  const onThumbMouseLeave = () => {
    isThumbDragging.current = false;
  };
  const onThumbMouseUp = () => {
    isThumbDragging.current = false;
  };
  const onThumbMouseMove = (e: any) => {
    if (!isThumbDragging.current) return;
    e.preventDefault();
    const x = e.pageX - thumbRef.current.offsetLeft;
    const walk = (x - thumbStartX.current) * 2;
    thumbRef.current.scrollLeft = thumbScrollLeft.current - walk;
  };
  // Scroll main box to clicked slide
  const scrollToSlide = (index: any) => {
    if (!mainRef.current) return;
    const mainChildren = mainRef.current.children;
    if (mainChildren[index]) {
      mainChildren[index].scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
      setActiveIndex(index);
    }
  };


  return (
    <DndProvider backend={HTML5Backend}>
    <Box
      sx={{
        maxWidth: "100%",
        margin: "auto",
        textAlign: "center",
        userSelect: "none",
      }}
    >
      {/* Main box */}
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          gap: 10,
          px: 1,
          py: 5,
          cursor: isMainDragging.current ? "grabbing" : "grab",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
        }}
        ref={mainRef}
        onMouseDown={onMainMouseDown}
        onMouseLeave={onMainMouseLeave}
        onMouseUp={onMainMouseUp}
        // onMouseMove={onMainMouseMove}
      >
        {slides.map((_, index) => {
          return (
            <Box
              key={index}
              sx={{
                flex: "0 0 auto",
                width: index === 1 ? 800 : 400,
                height: 600,
                ml: index === 0 ? 80 : 0,
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "row",
                boxShadow: 1,
                transition: "all 0.3s ease",
                position: "relative",
              }}
              // onMouseEnter={() => scrollToSlide(index)}
            >
              {/* First slide (cover) with image + editable text */}
              {index === 0 ? (
                <SlideCover/>
              ) : index === 1 ? (
                <SlideSpread
                  togglePopup={togglePopup}
                  activeIndex={activeIndex}
                />
              ) : (
                <SlideLogo />
              )}
            </Box>
          );
        })}

        {activePopup === "layout" && (
          <LayoutPopup
            onClose={() => setActivePopup(null)}
          />
        )}

        {activePopup === "text" && (
          <TextPopup
            onClose={() => setActivePopup(null)}
            onShowFontSizePopup={() => setShowFontSizePopup(true)}
          />
        )}

        {showFontSizePopup && (
          <FontSizePopup
            onClose={() => setShowFontSizePopup(false)}
          />
        )}

        {activePopup === "photo" && (
          <PhotoPopup
            onClose={() => setActivePopup(null)}
          />
        )}

        {activePopup === "sticker" && (
          <StickerPopup onClose={() => setActivePopup(null)} />
        )}

        {activePopup === "video" && (
          <VideoPopup
            onClose={() => setActivePopup(null)}
          />
        )}

        {activePopup === "audio" && (
          <MediaPopup
            onClose={() => setActivePopup(null)}
            mediaType="audio"
          />
        )}

        {activePopup === "geneAi" && (
          <GeneAIPopup onClose={() => setActivePopup(null)} />
        )}
      </Box>

      {/* Thumbnail gallery */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          position: "relative",
          userSelect: "none",
          background: "white",
          height: 100,
        }}
      >
        {/* Prev button */}
        <IconButton
          onClick={() => scrollThumbnails("left")}
          sx={{
            zIndex: 10,
          }}
          aria-label="scroll thumbnails left"
        >
          <ArrowBackIos sx={{ color: "#212121" }} />
        </IconButton>

        {/* Thumbnails container */}
        <Box
          ref={thumbRef}
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            gap: 1,
            px: 0.5,
            cursor: isThumbDragging.current ? "grabbing" : "grab",
            userSelect: "none",
            width: "auto",
          }}
          onMouseDown={onThumbMouseDown}
          onMouseLeave={onThumbMouseLeave}
          onMouseUp={onThumbMouseUp}
          onMouseMove={onThumbMouseMove}
        >
          {slides.map((label, index) => (
            <Box
              key={index}
              onClick={() => scrollToSlide(index)}
              sx={{
                width: 80,
                height: 60,
                bgcolor: index === activeIndex ? "#1976d2" : "#ccc",
                color: index === activeIndex ? "white" : "black",
                borderRadius: 1,
                cursor: "pointer",
                border:
                  index === activeIndex
                    ? "3px solid #1976d2"
                    : "2px solid transparent",
                opacity: index === activeIndex ? 1 : 0.6,
                transition: "all 0.3s ease",
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                userSelect: "none",
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        {/* Next button */}
        <IconButton
          onClick={() => scrollThumbnails("right")}
          sx={{
            zIndex: 10,
          }}
          aria-label="scroll thumbnails right"
        >
          <ArrowForwardIos sx={{ color: "#212121" }} />
        </IconButton>
      </Box>

    </Box>
    </DndProvider>
  );
};

export default WishCard;
