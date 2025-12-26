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
  FilterFramesOutlined,
  SlideshowOutlined,
  TitleOutlined,
  WallpaperOutlined,
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
import TextAlign1Popup from "../Slide1/TextAlign1Popup/TextAlign1Popup";
import TextAlignPopup from "../Slide2/TextAlignPopup/TextAlignPopup";
import TextAlign3Popup from "../Slide3/TextAlign3Popup/TextAlign3Popup";
import TextAlign4Popup from "../Slide4/TextAlign4Popup/TextAlign4Popup";
import LineHeight1Popup from "../Slide1/LineHeight1Popup/LineHeight1Popup";
import LineHeight2Popup from "../Slide2/LineHeight2Popup/LineHeight2Popup";
import LineHeight4Popup from "../Slide4/LineHeight4Popup/LineHeight4Popup";
import LineHeight3Popup from "../Slide3/LineHeight3Popup/LineHeight3Popup";
import { COLORS } from "../../constant/color";
import ImageAdjustment from "../Slide2/ImageAdjustment/ImageAdjustment";
import ImageAdjustment3Popup from "../Slide3/ImageAdjustment3Popup/ImageAdjustment3Poup";
import BgChanger from "../Slide1/BgChanger/BgChanger";
import ShapeFrames from "../Slide1/ShapeFrames/ShapeFrames";
import ImageAdjustment1 from "../Slide1/ImageAdjustment1/ImageAdjustment1";
import ImageAdjustment4Popup from "../Slide4/ImageAdjustment4Popup/ImageAdjustment4Popup";
import BgChanger2 from "../Slide2/BgChanger2/BgChanger2";
import ShapeFrames2 from "../Slide2/ShapeFrames2/ShapeFrames2";
import BgChanger3 from "../Slide3/BgChanger3/BgChanger3";
import ShapeFrames3 from "../Slide3/ShapeFrames3/ShapeFrames3";
import BgChanger4 from "../Slide4/BgChanger4/BgChanger4";
import ShapeFrames4 from "../Slide4/ShapeFrames4/ShapeFrames4";
// import { pdfFileToPngDataUrls } from "../../lib/pdfToPng";

const slides = [
  { id: 1, label: "Slide1" },
  { id: 2, label: "Slide2" },
  { id: 3, label: "Slide3" },
  { id: 4, label: "Slide4" },
];

type wishCardType = {
  adminEditor?: any
  initialLayout?: any;
  product?: any
}

const WishCard = (props: wishCardType) => {

  const { adminEditor } = props

  const [activeIndex, setActiveIndex] = useState(0);
  const [activePopup, setActivePopup] = useState(null);

  // const [addTextRightSide, setAddTextRightSide] = useState(false);
  const [addTextCount, setAddTextCount] = useState(0);
  const [addTextCountRight, setAddTextCountRight] = useState(0);
  const [addTextCountFirst, setAddTextCountFirst] = useState(0);
  const [addTextCountLast, setAddTextCountLast] = useState(0);

  // For slide 1
  const [activeTextSlide1Child, setActiveTextSlide1Child] = useState<
    "size" | "color" | "family" | "textAlign" | "lineHeight" | null
  >(null);

  // For Slide 2
  const [activeTextChild, setActiveTextChild] = useState<
    "size" | "color" | "family" | "textAlign" | "lineHeight" | null
  >(null);

  // For slide 3
  const [activeTextSlide3Child, setActiveTextSlide3Child] = useState<
    "size" | "color" | "family" | "textAlign" | "lineHeight" | null
  >(null);

  // For slide 4
  const [activeTextSlideLastChild, setActiveTextSlideLastChild] = useState<
    "size" | "color" | "family" | "textAlign" | "lineHeight" | null
  >(null);

  const { setIsSlideActive1, setTips1, } = useSlide1();
  const { setTips, setIsSlideActive } = useSlide2();
  const { setTips3, setIsSlideActive3 } = useSlide3();
  const { setIsSlideActive4, setTips4 } = useSlide4();

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
      case "textAlign":
        return <TextAlign1Popup />;
      case "lineHeight":
        return <LineHeight1Popup />;
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
      case "textAlign":
        return <TextAlignPopup />;
      case "lineHeight":
        return <LineHeight2Popup />;
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
      case "textAlign":
        return <TextAlign3Popup />;
      case "lineHeight":
        return <LineHeight3Popup />;
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
      case "textAlign":
        return <TextAlign4Popup />;
      case "lineHeight":
        return <LineHeight4Popup />;
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
      {/* One Box for Tools */}
      <Box
        sx={{
          maxWidth: "100%",
          margin: "auto",
          textAlign: "center",
          userSelect: "none",
          position: "relative",
          height: '100%',
          // p: 1
        }}
      >
        {/* Main box */}
        {/* Inside this Box the card and toolbar */}
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            gap: 10,
            px: { md: 1, sm: 1, xs: 0 },
            py: { md: 5, sm: 5, xs: 1 },
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            width: '100%',
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
                  width: { md: 500, sm: 400, xs: "100%" },
                  height: { md: 700, sm: 600, xs: 600 },
                  ml: index === 0 ? { md: 80, sm: 23, xs: 0 } : 0,
                  mr: adminEditor && index === 3 ? 55 : 0,
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "row",
                  boxShadow: 5,
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                {e.id === 1 ? (
                  <SlideCover
                    togglePopup={togglePopup}
                    activeIndex={index}
                    addTextRight={addTextCountFirst}
                    rightBox={true}
                    isCaptureMode={true}
                    isAdminEditor={adminEditor}
                  // coverPng={coverPng}
                  />
                ) : e.id === 2 ? (
                  <SlideSpread
                    togglePopup={togglePopup}
                    activeIndex={index}
                    addTextRight={addTextCount}
                    rightBox={true}
                    isAdminEditor={adminEditor}
                  />
                ) : e.id === 3 ? (
                  <SpreadRightSide
                    togglePopup={togglePopup}
                    activeIndex={index}
                    addTextRight={addTextCountRight}
                    rightBox={true}
                    isAdminEditor={adminEditor}
                  />
                ) : (
                  <SlideLogo
                    togglePopup={togglePopup}
                    activeIndex={index}
                    addTextRight={addTextCountLast}
                    rightBox={true}
                    isAdminEditor={adminEditor}
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
                  onChangeTextAlign={() =>
                    setActiveTextSlide1Child("textAlign")
                  }
                  onAddTextToCanvas={() =>
                    setAddTextCountFirst((prev) => prev + 1)
                  }
                  onSetLineHeightPopup={() => setActiveTextSlide1Child("lineHeight")}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "photo" && (
                <Photo1Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                  isAdminEditor={adminEditor}
                />
              )}

              {activePopup === "photo" && (
                <ImageAdjustment1
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                // togglePopup={togglePopup("photo")}
                />
              )}
              {activePopup === "frames" && (
                <ShapeFrames
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "photo" && (
                <ImageAdjustment1
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                  isAdminEditor={!!adminEditor}
                />
              )}
              {
                activePopup === "BgChanger" && (
                  <BgChanger
                    onClose={() => setActivePopup(null)}
                    activeIndex={activeIndex}
                  />
                )
              }

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
                  onChangeTextAlign={() => setActiveTextChild("textAlign")}
                  onAddTextToCanvas={() => setAddTextCount((prev) => prev + 1)}
                  onSetLineHeightPopup={() => setActiveTextChild("lineHeight")}
                  activeIndex={activeIndex}
                />
              )}

              {activePopup === "photo" && (
                <PhotoPopup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                  isAdminEditor={adminEditor}
                />
              )}
              {activePopup === "sticker" && (
                <StickerPopup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}
              {activePopup === "photo" && (
                <ImageAdjustment
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                  isAdminEditor={!!adminEditor}
                // togglePopup={togglePopup("photo")}
                />
              )}
              {
                activePopup === "BgChanger" && (
                  <BgChanger2
                    onClose={() => setActivePopup(null)}
                    activeIndex={activeIndex}
                  />
                )
              }
              {
                activePopup === "frames" && (
                  <ShapeFrames2
                    onClose={() => setActivePopup(null)}
                    activeIndex={activeIndex}
                  />
                )
              }
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
                  onSetLineHeightPopup={() => setActiveTextSlide3Child("lineHeight")}
                  onChangeTextAlign={() =>
                    setActiveTextSlide3Child("textAlign")
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
                  isAdminEditor={adminEditor}
                />
              )}

              {activePopup === "photo" && (
                <ImageAdjustment3Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                  isAdminEditor={!!adminEditor}
                // togglePopup={togglePopup("photo")}
                />
              )}

              {
                activePopup === "BgChanger" && (
                  <BgChanger3
                    onClose={() => setActivePopup(null)}
                    activeIndex={activeIndex}
                  />
                )
              }
              {
                activePopup === "frames" && (
                  <ShapeFrames3
                    onClose={() => setActivePopup(null)}
                    activeIndex={activeIndex}
                  />
                )
              }

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
                  onShowFontSizePopup={() => setActiveTextSlideLastChild("size")}
                  onShowFontColorPopup={() => setActiveTextSlideLastChild("color")}
                  onShowFontFamilyPopup={() =>
                    setActiveTextSlideLastChild("family")
                  }
                  onSetLineHeightPopup={() => setActiveTextSlideLastChild("lineHeight")}
                  onChangeTextAlign={() =>
                    setActiveTextSlideLastChild("textAlign")
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
                  isAdminEditor={adminEditor}
                />
              )}

              {activePopup === "photo" && (
                <ImageAdjustment4Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                  isAdminEditor={!!adminEditor}
                // togglePopup={togglePopup("photo")}
                />
              )}

              {activePopup === "sticker" && (
                <Sticker4Popup
                  onClose={() => setActivePopup(null)}
                  activeIndex={activeIndex}
                />
              )}
              {
                activePopup === "BgChanger" && (
                  <BgChanger4
                    onClose={() => setActivePopup(null)}
                    activeIndex={activeIndex}
                  />
                )
              }
              {
                activePopup === "frames" && (
                  <ShapeFrames4
                    onClose={() => setActivePopup(null)}
                    activeIndex={activeIndex}
                  />
                )
              }

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

          {/* 1st card Toolbar */}
          {
            adminEditor &&
            <>
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
                    top: { md: 40, sm: 40, xs: '100%' },
                    left: { md: "28.5%", sm: "14%", xs: 10 },
                    zIndex: { md: 10, sm: 10, xs: 99999 },
                    boxShadow: 3,
                    "&::-webkit-scrollbar": {
                      height: "6px",
                      width: '5px'
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#212121",
                      borderRadius: "20px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: COLORS.primary,
                      borderRadius: "20px",
                    },
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
                  {
                    adminEditor && (
                      <IconButton sx={editingButtonStyle}
                        onClick={() => togglePopup("frames")}
                        aria-label="Frames">
                        <FilterFramesOutlined fontSize="large" />
                        Frames
                      </IconButton>
                    )
                  }
                  <IconButton
                    sx={editingButtonStyle}
                    onClick={() => togglePopup("photo")}
                    aria-label="Photo"
                  >
                    <CollectionsOutlined fontSize="large" />
                    Photo
                  </IconButton>
                  {/* {
                    adminEditor && (
                      <IconButton
                        sx={editingButtonStyle}
                        onClick={handlePdfIconClick}
                        aria-label="PDF"
                      >
                        <PictureAsPdfOutlined fontSize="large" />
                        PDF
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept="application/pdf"
                          style={{ display: "none" }}
                          onChange={handlePdfSelected}
                        />

                      </IconButton>

                    )
                  } */}
                  <IconButton
                    sx={editingButtonStyle}
                    onClick={() => togglePopup("sticker")}
                    aria-label="Sticker"
                  >
                    <EmojiEmotionsOutlined fontSize="large" />
                    Sticker
                  </IconButton>

                  {
                    adminEditor && (
                      <IconButton sx={editingButtonStyle}
                        onClick={() => togglePopup("BgChanger")}
                        aria-label="BgChanger">
                        <WallpaperOutlined fontSize="large" />
                        BGImg
                      </IconButton>
                    )
                  }
                  <IconButton
                    onClick={() => {
                      togglePopup("video");
                      setTips1(true);
                    }}
                    sx={editingButtonStyle}
                  >
                    <SlideshowOutlined fontSize="large" />
                    Video
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      togglePopup("audio");
                      setTips1(true);
                    }}
                    sx={editingButtonStyle}
                  >
                    <AudiotrackOutlined fontSize="large" />
                    Audio
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      togglePopup("geneAi");
                    }}
                    sx={editingButtonStyle}
                  >
                    <BlurOn fontSize="large" />
                    GenAI
                  </IconButton>
                </Box>
              )}
            </>
          }

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
                top: { md: 50, sm: 50, xs: '100%' },
                left: adminEditor ? {
                  xs: 10,
                  sm: "14%",
                  md: "18%",
                  lg: "27%",
                  xl: "28%",
                } : {
                  xs: 10,
                  sm: "14%",
                  md: "18%",
                  lg: "27%",
                  xl: "33%",
                },
                zIndex: { md: 10, sm: 10, xs: 99999 },
                boxShadow: 3,
                "&::-webkit-scrollbar": {
                  height: "6px",
                  width: '5px'
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1ff",
                  borderRadius: "20px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: COLORS.primary,
                  borderRadius: "20px",
                },
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

              {
                adminEditor && (
                  <IconButton sx={editingButtonStyle}
                    onClick={() => togglePopup("frames")}
                    aria-label="Frames">
                    <FilterFramesOutlined fontSize="large" />
                    Frames
                  </IconButton>
                )
              }
              {
                adminEditor && (
                  <IconButton sx={editingButtonStyle}
                    onClick={() => togglePopup("BgChanger")}
                    aria-label="BgChanger">
                    <WallpaperOutlined fontSize="large" />
                    BGImg
                  </IconButton>
                )
              }

              <IconButton
                onClick={() => {
                  togglePopup("video");
                  setTips(true);
                }}
                sx={editingButtonStyle}
              >
                <SlideshowOutlined fontSize="large" />
                Video
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("audio");
                  setTips(true);
                }}
                sx={editingButtonStyle}
              >
                <AudiotrackOutlined fontSize="large" />
                Audio
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("geneAi");
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
                top: { md: 50, sm: 50, xs: '100%' },
                left: adminEditor ? { xl: "28.5%", lg: '27%', md: "18%", sm: "14%", xs: 10 } : { xl: "39%", lg: '27%', md: "18%", sm: "14%", xs: 10 },
                zIndex: { md: 10, sm: 10, xs: 99999 },
                boxShadow: 3,
                "&::-webkit-scrollbar": {
                  height: "6px",
                  width: '5px'
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1ff",
                  borderRadius: "20px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: COLORS.primary,
                  borderRadius: "20px",
                },
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

              {
                adminEditor && (
                  <IconButton sx={editingButtonStyle}
                    onClick={() => togglePopup("frames")}
                    aria-label="Frames">
                    <FilterFramesOutlined fontSize="large" />
                    Frames
                  </IconButton>
                )
              }
              {
                adminEditor && (
                  <IconButton sx={editingButtonStyle}
                    onClick={() => togglePopup("BgChanger")}
                    aria-label="BgChanger">
                    <WallpaperOutlined fontSize="large" />
                    BGImg
                  </IconButton>
                )
              }
              <IconButton
                onClick={() => {
                  togglePopup("video");
                  setTips3(true);
                }}
                sx={editingButtonStyle}
              >
                <SlideshowOutlined fontSize="large" />
                Video
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("audio");
                  setTips3(true);
                }}
                sx={editingButtonStyle}
              >
                <AudiotrackOutlined fontSize="large" />
                Audio
              </IconButton>
              <IconButton
                onClick={() => {
                  togglePopup("geneAi");
                }}
                sx={editingButtonStyle}
              >
                <BlurOn fontSize="large" />
                GenAI
              </IconButton>
            </Box>
          )}

          {/* 4th card */}
          {adminEditor &&
            <>
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
                    top: { md: 40, sm: 40, xs: '100%' },
                    left: { md: "35%", sm: "54%", xs: 10 },
                    zIndex: { md: 10, sm: 10, xs: 99999 },
                    boxShadow: 3,
                    "&::-webkit-scrollbar": {
                      height: "6px",
                      width: '5px'
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#f1f1f1ff",
                      borderRadius: "20px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: COLORS.primary,
                      borderRadius: "20px",
                    },
                  }}
                >
                  <IconButton sx={editingButtonStyle} onClick={() => togglePopup("layout")}>
                    <AutoAwesomeMosaicOutlined fontSize="large" />
                    Layout
                  </IconButton>

                  <IconButton sx={editingButtonStyle} onClick={() => togglePopup("text")}>
                    <TitleOutlined fontSize="large" />
                    Text
                  </IconButton>

                  <IconButton sx={editingButtonStyle} onClick={() => togglePopup("photo")}>
                    <CollectionsOutlined fontSize="large" />
                    Photo
                  </IconButton>

                  <IconButton sx={editingButtonStyle} onClick={() => togglePopup("sticker")}>
                    <EmojiEmotionsOutlined fontSize="large" />
                    Sticker
                  </IconButton>
                  {
                    adminEditor && (
                      <IconButton sx={editingButtonStyle}
                        onClick={() => togglePopup("frames")}
                        aria-label="Frames">
                        <FilterFramesOutlined fontSize="large" />
                        Frames
                      </IconButton>
                    )
                  }
                  {
                    adminEditor && (
                      <IconButton sx={editingButtonStyle}
                        onClick={() => togglePopup("BgChanger")}
                        aria-label="BgChanger">
                        <WallpaperOutlined fontSize="large" />
                        BGImg
                      </IconButton>
                    )
                  }

                  <IconButton
                    onClick={() => {
                      togglePopup("video");
                      setTips4(true);
                    }}
                    sx={editingButtonStyle}
                  >
                    <SlideshowOutlined fontSize="large" />
                    Video
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      togglePopup("audio");
                      setTips4(true);
                    }}
                    sx={editingButtonStyle}
                  >
                    <AudiotrackOutlined fontSize="large" />
                    Audio
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      togglePopup("geneAi");
                    }}
                    sx={editingButtonStyle}
                  >
                    <BlurOn fontSize="large" />
                    GenAI
                  </IconButton>
                </Box>
              )}
            </>}

        </Box>

        {/* Thumbnail gallery */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            position: "relative",
            bottom: { md: 20, sm: 20, xs: -10 },
            width: '100%',
            userSelect: "none",
            background: "transparent",
            zIndex: 22,
          }}
        >
          {/* Prev button */}
          <IconButton
            onClick={() => handleSlideChange("left")}
            sx={{
              zIndex: 100,
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
              px: { md: 0.5, sm: 0.5, xs: 0 },
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
                  width: { md: 70, sm: 70, xs: 60 },
                  height: { md: 80, sm: 80, xs: 60 },
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
                  borderRadius: 2
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