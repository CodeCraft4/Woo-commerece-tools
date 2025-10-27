import { useState, useRef, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import {
  ArrowBackIos,
  ArrowForwardIos,
  AudiotrackOutlined,
  AutoAwesomeMosaicOutlined,
  BlurOn,
  CollectionsOutlined,
  EmojiEmotionsOutlined,
  SlideshowOutlined,
  TitleOutlined,
} from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SlideCover from "../SlideCover/SlideCover";
import SlideLogo from "../SlideLogo/SlideLogo";
import SlideSpread from "../SpreadSheet/SpreadSheat";
import LayoutPopup from "../Slide2/LayoutPopup/LayoutPopup";
import VideoPopup from "../Slide2/VideoPopup/VideoPopup";
import MediaPopup from "../Slide2/MediaPopup/MediaPopup";
import StickerPopup from "../Slide2/StickerPopup/StickerPopup";
import FontSizePopup from "../Slide2/FontSizePopup/FontSizePopup";
import PhotoPopup from "../Slide2/PhotoPopup/PhotoPopup";
import TextPopup from "../Slide2/TextPopup/TextPopup";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "./../../../node_modules/react-dnd-html5-backend/dist/index";
import FontColorPopup from "../Slide2/FontColorsPopup/FontColorsPopup";
import FontFamilyPopup from "../Slide2/FontFamilyPopup/FontFamilyPopup";
import SpreadRightSide from "../SpreadRightSide/SpreadRightSide";
import Layout3Popup from "../Slide3/Layout3Popup/Layout3Popup";
import Text3Popup from "../Slide3/Text3Popup/Text3Popup";
import Photo3Popup from "../Slide3/Photo3Popup/Photo3Popup";
import Sticker3Popup from "../Slide3/Sticker3Popup/Sticker3Popup";
import Video3Popup from "../Slide3/Video3Popup/Video3Popup";
import Media3Popup from "../Slide3/Media3Popup/Media3Popup";
import FontSize3Popup from "../Slide3/FontSize3Popup/FontSize3Popup";
import FontColor3Popup from "../Slide3/FontColors3Popup/FontColors3Popup";
import FontFamily3Popup from "../Slide3/FontFamily3Popup/FontFamily3Popup";
import GlobalWatermark from "../GlobalWatermark/GlobalWatermark";
import Layout1Popup from "../Slide1/Layout1Popup/Layout1Popup";
import Text1Popup from "../Slide1/Text1Popup/Text1Popup";
import Photo1Popup from "../Slide1/Photo1Popup/Photo1Popup";
import Sticker1Popup from "../Slide1/Sticker1Popup/Sticker1Popup";
import Video1Popup from "../Slide1/Video1Popup/Video1Popup";
import Media1Popup from "../Slide1/Media1Popup/Media1Popup";
import FontSize1Popup from "../Slide1/FontSize1Popup/FontSize1Popup";
import FontFamily1Popup from "../Slide1/FontFamily1Popup/FontFamily1Popup";
import Layout4Popup from "../Slide4/Layout4Popup/Layout4Popup";
import Text4Popup from "../Slide4/Text4Popup/Text4Popup";
import Photo4Popup from "../Slide4/Photo4Popup/Photo4Popup";
import Sticker4Popup from "../Slide4/Sticker4Popup/Sticker4Popup";
import Video4Popup from "../Slide4/Video4Popup/Video4Popup";
import Media4Popup from "../Slide4/Media4Popup/Media4Popup";
import FontSize4Popup from "../Slide4/FontSize4Popup/FontSize4Popup";
import FontColor4Popup from "../Slide4/FontColors4Popup/FontColors4Popup";
import FontFamily4Popup from "../Slide4/FontFamily4Popup/FontFamily4Popup";
import GeneAIPopup from "../Slide1/GeneAIPopup/GeneAI";
import GeneAI2Popup from "../Slide2/GeneAI2Popup/GeneAI2";
import GeneAI3Popup from "../Slide3/GeneAI3Popup/GeneAI3";
import GeneAI4Popup from "../Slide4/GeneAI4Popup/GeneAI4";
import { useSlide1 } from "../../context/Slide1Context";
import { useSlide2 } from "../../context/Slide2Context";
import { useSlide3 } from "../../context/Slide3Context";
import { useSlide4 } from "../../context/Slide4Context";
import FontColor1Popup from "../Slide1/FontColors1Popup/FontColors1Popup";

const slides = [
  { id: 1, label: "Slide1" },
  { id: 2, label: "Slide2" },
  { id: 3, label: "Slide3" },
  { id: 4, label: "Slide4" },
];

const WishCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePopup, setActivePopup] = useState(null);

  // const [addTextRightSide, setAddTextRightSide] = useState(false);
  const [addTextCount, setAddTextCount] = useState(0);
  const [addTextCountRight, setAddTextCountRight] = useState(0);
  const [addTextCountFirst, setAddTextCountFirst] = useState(0);
  const [addTextCountLast, setAddTextCountLast] = useState(0);

  // For slide
  const [activeTextSlide1Child, setActiveTextSlide1Child] = useState<
    "size" | "color" | "family" | null
  >(null);

  const [activeTextChild, setActiveTextChild] = useState<
    "size" | "color" | "family" | null
  >(null);

  // For slide 3
  const [activeTextSlide3Child, setActiveTextSlide3Child] = useState<
    "size" | "color" | "family" | null
  >(null);

  // For slide 4
  const [activeTextSlideLastChild, setActiveTextSlideLastChild] = useState<
    "size" | "color" | "family" | null
  >(null);

  const { tips1, setTips1, setIsSlideActive1 } = useSlide1();
  const { tips, setTips, setIsSlideActive } = useSlide2();
  const { tips3, setTips3, setIsSlideActive3 } = useSlide3();
  const { tips4, setTips4, setIsSlideActive4 } = useSlide4();

  // ==============SLIDE STATE MANAGEMENT=======================
  // Function to handle slide changes and manage state
  useEffect(() => {
    setIsSlideActive1(true);
    setIsSlideActive(false);
    setIsSlideActive3(false);
    setIsSlideActive4(false);
  }, []);

  // Handle slide navigation
  const handleSlideChange = (direction: "left" | "right") => {
    let newIndex = activeIndex;

    if (direction === "left") {
      newIndex = activeIndex > 0 ? activeIndex - 1 : slides.length - 1;
    } else {
      newIndex = activeIndex < slides.length - 1 ? activeIndex + 1 : 0;
    }

    // ✅ Deactivate all slides first
    setIsSlideActive1(false);
    setIsSlideActive(false);
    setIsSlideActive3(false);
    setIsSlideActive4(false);

    // ✅ Activate only the current slide
    if (newIndex === 0) setIsSlideActive1(true);
    if (newIndex === 1) setIsSlideActive(true);
    if (newIndex === 2) setIsSlideActive3(true);
    if (newIndex === 3) setIsSlideActive4(true);

    setActiveIndex(newIndex);
    scrollToSlide(newIndex);
  };

  // ==============VIDEO UPLOADING=======================
  // Toggle popup on icon click
  const togglePopup = (name: any) => {
    setActivePopup((prev) => (prev === name ? null : name));
  };

  // For Slide 1
  const renderActiveTextFirstChild = () => {
    switch (activeTextSlide1Child) {
      case "size":
        // FontSizePopup now receives the handleCloseChild function
        return <FontSize1Popup />;
      case "color":
        // FontColorPopup now receives the handleCloseChild function
        return <FontColor1Popup />;
      case "family":
        // FontFamilyPopup now receives the handleCloseChild function
        return <FontFamily1Popup />;
      default:
        return null;
    }
  };

  // For Slide 2
  const renderActiveTextChild = () => {
    switch (activeTextChild) {
      case "size":
        // FontSizePopup now receives the handleCloseChild function
        return <FontSizePopup />;
      case "color":
        // FontColorPopup now receives the handleCloseChild function
        return <FontColorPopup />;
      case "family":
        // FontFamilyPopup now receives the handleCloseChild function
        return <FontFamilyPopup />;
      default:
        return null;
    }
  };

  // For Slide 3
  const renderActiveTextSlide3Child = () => {
    switch (activeTextSlide3Child) {
      case "size":
        // FontSizePopup now receives the handleCloseChild function
        return <FontSize3Popup />;
      case "color":
        // FontColorPopup now receives the handleCloseChild function
        return <FontColor3Popup />;
      case "family":
        // FontFamilyPopup now receives the handleCloseChild function
        return <FontFamily3Popup />;
      default:
        return null;
    }
  };

  // For Slide 4
  const renderActiveTextSlideLastChild = () => {
    switch (activeTextSlideLastChild) {
      case "size":
        // FontSizePopup now receives the handleCloseChild function
        return <FontSize4Popup />;
      case "color":
        // FontColorPopup now receives the handleCloseChild function
        return <FontColor4Popup />;
      case "family":
        // FontFamilyPopup now receives the handleCloseChild function
        return <FontFamily4Popup />;
      default:
        return null;
    }
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

  // Scroll to selected slide
  const scrollToSlide = (index: number) => {
    if (!mainRef.current) return;
    const slide = mainRef.current.children[index];
    if (!slide) return;

    slide.scrollIntoView({ behavior: "smooth", inline: "center" });

    // ✅ Deactivate all slides first
    setIsSlideActive1(false);
    setIsSlideActive(false);
    setIsSlideActive3(false);
    setIsSlideActive4(false);

    // ✅ Activate only the clicked/target slide
    if (index === 0) setIsSlideActive1(true);
    if (index === 1) setIsSlideActive(true);
    if (index === 2) setIsSlideActive3(true);
    if (index === 3) setIsSlideActive4(true);

    setActiveIndex(index);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          maxWidth: "100%",
          margin: "auto",
          textAlign: "center",
          userSelect: "none",
          position: "relative",
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
            py: { md: 5, sm: 5, xs: 1 },
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
          }}
          ref={mainRef}
          onMouseDown={onMainMouseDown}
          onMouseLeave={onMainMouseLeave}
          onMouseUp={onMainMouseUp}
          // onMouseMove={onMainMouseMove}
        >
          {slides.map((e, index) => {
            return (
              <Box
                key={e.id}
                sx={{
                  flex: "0 0 auto",
                  width: { md: 400, sm: 400, xs: "100%" },
                  height: { md: 600, sm: 600, xs: "500px" },
                  ml: index === 0 ? { md: 80, sm: 80, xs: 0 } : 0,
                  borderRadius: 2,
                  mt: { md: 0, sm: 0, xs: 12 },
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "row",
                  boxShadow: 5,
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
                // onMouseEnter={() => scrollToSlide(index)}
              >
                {/* First slide (cover) with image + editable text */}
                {e.id === 1 ? (
                  <SlideCover
                    togglePopup={togglePopup}
                    activeIndex={index}
                    addTextRight={addTextCountFirst}
                    rightBox={true}
                  />
                ) : e.id === 2 ? (
                  <SlideSpread
                    togglePopup={togglePopup}
                    activeIndex={index}
                    addTextRight={addTextCount}
                    rightBox={true}
                  />
                ) : e.id === 3 ? (
                  <SpreadRightSide
                    togglePopup={togglePopup}
                    activeIndex={index}
                    addTextRight={addTextCountRight}
                    rightBox={true}
                  />
                ) : (
                  <SlideLogo
                    togglePopup={togglePopup}
                    activeIndex={index}
                    addTextRight={addTextCountLast}
                    rightBox={true}
                  />
                )}
              </Box>
            );
          })}

          {activeIndex === 0 && (
            <>
              {activePopup === "layout" && (
                <Layout1Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "text" && (
                <Text1Popup
                  onClose={() => setActivePopup(null)}
                  onShowFontSizePopup={() => setActiveTextSlide1Child("size")}
                  onShowFontColorPopup={() => setActiveTextSlide1Child("color")}
                  onShowFontFamilyPopup={() =>
                    setActiveTextSlide1Child("family")
                  }
                  activeChildComponent={renderActiveTextFirstChild()}
                  onAddTextToCanvas={() =>
                    setAddTextCountFirst((prev) => prev + 1)
                  }
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "photo" && (
                <Photo1Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "sticker" && (
                <Sticker1Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "video" && (
                <Video1Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "audio" && (
                <Media1Popup
                  onClose={() => setActivePopup(null)}
                  mediaType="audio"
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "geneAi" && (
                <GeneAIPopup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}
            </>
          )}

          {activeIndex === 1 && (
            <>
              {activePopup === "layout" && (
                <LayoutPopup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "text" && (
                <TextPopup
                  onClose={() => setActivePopup(null)}
                  onShowFontSizePopup={() => setActiveTextChild("size")}
                  onShowFontColorPopup={() => setActiveTextChild("color")}
                  onShowFontFamilyPopup={() => setActiveTextChild("family")}
                  activeChildComponent={renderActiveTextChild()}
                  onAddTextToCanvas={() => setAddTextCount((prev) => prev + 1)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "photo" && (
                <PhotoPopup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "sticker" && (
                <StickerPopup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "video" && (
                <VideoPopup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "audio" && (
                <MediaPopup
                  onClose={() => setActivePopup(null)}
                  mediaType="audio"
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "geneAi" && (
                <GeneAI2Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}
            </>
          )}

          {activeIndex === 2 && (
            <>
              {activePopup === "layout" && (
                <Layout3Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "text" && (
                <Text3Popup
                  onClose={() => setActivePopup(null)}
                  onShowFontSizePopup={() => setActiveTextSlide3Child("size")}
                  onShowFontColorPopup={() => setActiveTextSlide3Child("color")}
                  onShowFontFamilyPopup={() =>
                    setActiveTextSlide3Child("family")
                  }
                  renderActiveTextSlide3Child={renderActiveTextSlide3Child()}
                  onAddTextToCanvas={() =>
                    setAddTextCountRight((prev) => prev + 1)
                  }
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "photo" && (
                <Photo3Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "sticker" && (
                <Sticker3Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "video" && (
                <Video3Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "audio" && (
                <Media3Popup
                  onClose={() => {
                    setActivePopup(null);
                  }}
                  mediaType="audio"
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "geneAi" && (
                <GeneAI3Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}
            </>
          )}

          {activeIndex === 3 && (
            <>
              {activePopup === "layout" && (
                <Layout4Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "text" && (
                <Text4Popup
                  onClose={() => setActivePopup(null)}
                  onShowFontSizePopup={() =>
                    setActiveTextSlideLastChild("size")
                  }
                  onShowFontColorPopup={() =>
                    setActiveTextSlideLastChild("color")
                  }
                  onShowFontFamilyPopup={() =>
                    setActiveTextSlideLastChild("family")
                  }
                  activeChildComponent={renderActiveTextSlideLastChild()}
                  onAddTextToCanvas={() =>
                    setAddTextCountLast((prev) => prev + 1)
                  }
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "photo" && (
                <Photo4Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "sticker" && (
                <Sticker4Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "video" && (
                <Video4Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "audio" && (
                <Media4Popup
                  onClose={() => {
                    setActivePopup(null);
                  }}
                  mediaType="audio"
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "geneAi" && (
                <GeneAI4Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}
            </>
          )}

          {/* Editing Toolbar */}

          {/* 1st Card */}
          {activeIndex === 0 && (
            <Box
              sx={{
                height: { md: "600px", sm: "600px", xs: "80px" },
                width: { md: "auto", sm: "auto", xs: "95%" },
                bgcolor: "white",
                borderRadius: "4px",
                p: 1,
                display: "flex",
                flexDirection: { md: "column", sm: "column", xs: "row" },
                overflowX: { md: "hidden", sm: "hidden", xs: "scroll" },
                gap: "15px",
                position: "absolute",
                top: { md: 40, sm: 40, xs: 10 },
                left: { md: "31%", sm: "31%", xs: 10 },
                zIndex: 10,
                boxShadow: 3,
              }}
            >
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("layout")}
                aria-label="Layout"
              >
                <AutoAwesomeMosaicOutlined fontSize="large" />
                Layout
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("text")}
                aria-label="Text"
              >
                <TitleOutlined fontSize="large" />
                Text
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("photo")}
                aria-label="Photo"
              >
                <CollectionsOutlined fontSize="large" />
                Photo
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("sticker")}
                aria-label="Sticker"
              >
                <EmojiEmotionsOutlined fontSize="large" />
                Sticker
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("video");
                  setTips1(!tips1);
                }}
                sx={editingButtonStyle}
              >
                <SlideshowOutlined fontSize="large" />
                Video
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("audio");
                  setTips1(!tips1);
                }}
                sx={editingButtonStyle}
              >
                <AudiotrackOutlined fontSize="large" />
                Audio
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("geneAi");
                  setTips(!tips);
                }}
                sx={editingButtonStyle}
              >
                <BlurOn fontSize="large" />
                GenAI
              </IconButton>
            </Box>
          )}
          {/* 2nd Card */}
          {activeIndex === 1 && (
            <Box
              sx={{
                height: { md: "600px", sm: "600px", xs: "80px" },
                width: { md: "auto", sm: "auto", xs: "95%" },
                bgcolor: "white",
                borderRadius: "4px",
                p: 1,
                display: "flex",
                flexDirection: { md: "column", sm: "column", xs: "row" },
                overflowX: { md: "hidden", sm: "hidden", xs: "scroll" },
                gap: "15px",
                position: "absolute",
                top: { md: 40, sm: 40, xs: 10 },
                left: { md: "34.5%", sm: "34.5%", xs: 10 },
                zIndex: 10,
                boxShadow: 3,
              }}
            >
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("layout")}
                aria-label="Layout"
              >
                <AutoAwesomeMosaicOutlined fontSize="large" />
                Layout
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("text")}
                aria-label="Text"
              >
                <TitleOutlined fontSize="large" />
                Text
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("photo")}
                aria-label="Photo"
              >
                <CollectionsOutlined fontSize="large" />
                Photo
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("sticker")}
                aria-label="Sticker"
              >
                <EmojiEmotionsOutlined fontSize="large" />
                Sticker
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("video");
                  setTips(!tips);
                }}
                sx={editingButtonStyle}
              >
                <SlideshowOutlined fontSize="large" />
                Video
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("audio");
                  setTips(!tips);
                }}
                sx={editingButtonStyle}
              >
                <AudiotrackOutlined fontSize="large" />
                Audio
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("geneAi");
                  setTips(!tips);
                }}
                sx={editingButtonStyle}
              >
                <BlurOn fontSize="large" />
                GenAI
              </IconButton>
            </Box>
          )}
          {/* 3rd Card */}
          {activeIndex === 2 && (
            <Box
              sx={{
                height: { md: "600px", sm: "600px", xs: "80px" },
                width: { md: "auto", sm: "auto", xs: "95%" },
                bgcolor: "white",
                borderRadius: "4px",
                p: 1,
                display: "flex",
                flexDirection: { md: "column", sm: "column", xs: "row" },
                overflowX: { md: "hidden", sm: "hidden", xs: "scroll" },
                gap: "15px",
                position: "absolute",
                top: { md: 40, sm: 40, xs: 10 },
                left: { md: "46%", sm: "46%", xs: 10 },
                zIndex: 10,
                boxShadow: 3,
              }}
            >
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("layout")}
                aria-label="Layout"
              >
                <AutoAwesomeMosaicOutlined fontSize="large" />
                Layout
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("text")}
                aria-label="Text"
              >
                <TitleOutlined fontSize="large" />
                Text
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("photo")}
                aria-label="Photo"
              >
                <CollectionsOutlined fontSize="large" />
                Photo
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("sticker")}
                aria-label="Sticker"
              >
                <EmojiEmotionsOutlined fontSize="large" />
                Sticker
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("video");
                  setTips3(!tips3);
                }}
                sx={editingButtonStyle}
              >
                <SlideshowOutlined fontSize="large" />
                Video
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("audio");
                  setTips3(!tips3);
                }}
                sx={editingButtonStyle}
              >
                <AudiotrackOutlined fontSize="large" />
                Audio
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("geneAi");
                  setTips(!tips);
                }}
                sx={editingButtonStyle}
              >
                <BlurOn fontSize="large" />
                GenAI
              </IconButton>
            </Box>
          )}
          {/* 4th card */}
          {activeIndex === 3 && (
            <Box
              sx={{
                height: { md: "600px", sm: "600px", xs: "80px" },
                width: { md: "auto", sm: "auto", xs: "95%" },
                bgcolor: "white",
                borderRadius: "4px",
                p: 1,
                display: "flex",
                flexDirection: { md: "column", sm: "column", xs: "row" },
                overflowX: { md: "hidden", sm: "hidden", xs: "scroll" },
                gap: "15px",
                position: "absolute",
                top: { md: 40, sm: 40, xs: 10 },
                right: { md: "23%", sm: "23%", xs: 10 },
                zIndex: 10,
                boxShadow: 3,
              }}
            >
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("layout")}
                aria-label="Layout"
              >
                <AutoAwesomeMosaicOutlined fontSize="large" />
                Layout
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("text")}
                aria-label="Text"
              >
                <TitleOutlined fontSize="large" />
                Text
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("photo")}
                aria-label="Photo"
              >
                <CollectionsOutlined fontSize="large" />
                Photo
              </IconButton>
              <IconButton
                sx={editingButtonStyle}
                onClick={() => togglePopup("sticker")}
                aria-label="Sticker"
              >
                <EmojiEmotionsOutlined fontSize="large" />
                Sticker
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("video");
                  setTips4(!tips4);
                }}
                sx={editingButtonStyle}
              >
                <SlideshowOutlined fontSize="large" />
                Video
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("audio");
                  setTips4(!tips4);
                }}
                sx={editingButtonStyle}
              >
                <AudiotrackOutlined fontSize="large" />
                Audio
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("geneAi");
                  setTips(!tips);
                }}
                sx={editingButtonStyle}
              >
                <BlurOn fontSize="large" />
                GenAI
              </IconButton>
            </Box>
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
            onClick={() => handleSlideChange("left")}
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
            {slides.map((e, index) => (
              <Box
                key={index}
                onClick={() => scrollToSlide(index)}
                sx={{
                  width: 70,
                  height: 80,
                  bgcolor: "#ccc",
                  color: "#212121",
                  // color: index === activeIndex ? "white" : "black",
                  // borderRadius: 1,
                  cursor: "pointer",
                  border:
                    index === activeIndex
                      ? "2px solid #1976d2"
                      : "2px solid transparent",
                  opacity: index === activeIndex ? 1 : 0.6,
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  userSelect: "none",
                  fontSize: "15px",
                }}
              >
                {e.label}
              </Box>
            ))}
          </Box>

          {/* Next button */}
          <IconButton
            onClick={() => handleSlideChange("right")}
            sx={{
              zIndex: 10,
            }}
            aria-label="scroll thumbnails right"
          >
            <ArrowForwardIos sx={{ color: "#212121" }} />
          </IconButton>
        </Box>
      </Box>
      <GlobalWatermark />
    </DndProvider>
  );
};

export default WishCard;

const editingButtonStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: "13px",
  color: "#212121",
  "&:hover": {
    color: "#3a7bd5",
  },
};
