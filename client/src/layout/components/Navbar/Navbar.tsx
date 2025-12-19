import { AppBar, Backdrop, Box, CircularProgress, Toolbar, Typography } from "@mui/material";
import { USER_ROUTES } from "../../../constant/route";
import { useNavigate } from "react-router-dom";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { Drafts, KeyboardArrowLeft } from "@mui/icons-material";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { useSlide2 } from "../../../context/Slide2Context";
import { useSlide3 } from "../../../context/Slide3Context";
import * as htmlToImage from "html-to-image";
import { useSlide1 } from "../../../context/Slide1Context";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabase/supabase";
import { useState } from "react";

const Navbar = () => {
  const { user } = useAuth()
  const navigate = useNavigate();
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const pathname = location.pathname.startsWith(`${USER_ROUTES.HOME}/`);
  const {
    open: isDraftModal,
    openModal: isDraftModalOpen,
    closeModal: isCloseDraftModal,
  } = useModal();

  // ✅ Slide 2 Context
  const {
    oneTextValue,
    multipleTextValue,
    showOneTextRightSideBox,
    textElements,
    texts,
    draggableImages,
    qrPosition,
    qrAudioPosition,
    selectedAIimageUrl2,
    isAIimage2,
    aimage2,
    selectedStickers2,
    fontSize,
    fontFamily,
    fontColor,
    fontWeight,
    textAlign,
    verticalAlign,
    rotation,
    lineHeight2,
    letterSpacing2,
    selectedVideoUrl,
    selectedAudioUrl,
  } = useSlide2();

  // ✅ Slide 3 Context
  const {
    textElements3,
    draggableImages3,
    images3,
    selectedImg3,
    selectedVideoUrl3,
    selectedAudioUrl3,
    selectedLayout3,
    oneTextValue3,
    multipleTextValue3,
    selectedStickers3,
    qrPosition3,
    qrAudioPosition3,
    aimage3,
    isAIimage3,
    selectedAIimageUrl3,
  } = useSlide3();

  // Slide1 Cover layout and its element
  const { layout1 } = useSlide1();


  const captureSlideCover = async (): Promise<string | null> => {
    const element = document.getElementById("slide-cover-capture");
    if (!element) {
      console.warn("⚠️ SlideCover not found for screenshot capture.");
      return null;
    }

    try {
      // ✅ Temporarily disable opacity and overlays
      const originalOpacity = element.style.opacity;
      const originalFilter = element.style.filter;
      element.style.opacity = "1";
      element.style.filter = "none";

      // ✅ Take screenshot
      const dataUrl = await htmlToImage.toPng(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      // ✅ Restore original styles
      element.style.opacity = originalOpacity;
      element.style.filter = originalFilter;

      console.log("📸 SlideCover Screenshot Captured!");
      return dataUrl;
    } catch (error) {
      console.error("❌ Error capturing SlideCover:", error);
      return null;
    }
  };


  // ✅ Save all slide data + screenshot
  const handleDraftConfirm = async () => {
    const coverScreenshot = await captureSlideCover();

    const layout1Draft = layout1
      ? {
        elements: layout1?.stickers?.map((el: any) => ({
          id: el.id,
          src: el.src,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
        })),
        textElements: layout1.textElements?.map((te: any) => ({
          id: te.id,
          text: te.text,
          x: te.x,
          y: te.y,
          width: te.width,
          height: te.height,
          fontSize: te.fontSize,
          fontFamily: te.fontFamily,
          fontWeight: te.fontWeight,
          color: te.color,
          italic: te.italic || false,
          textAlign: te.textAlign,
          verticalAlign: te.verticalAlign,
        })),
      }
      : null;

    // --- Slide2 draft ---
    const oneTextLayout = showOneTextRightSideBox
      ? {
        value: oneTextValue,
        fontSize,
        fontWeight,
        fontFamily,
        fontColor,
        textAlign,
        verticalAlign,
        lineHeight: lineHeight2,
        letterSpacing: letterSpacing2,
        rotation,
      }
      : null;

    const multipleTextLayout = multipleTextValue
      ? texts.map((t) => ({
        value: t.value,
        fontSize: t.fontSize,
        fontWeight: t.fontWeight,
        fontFamily: t.fontFamily,
        fontColor: t.fontColor,
        textAlign: t.textAlign,
        verticalAlign: t.verticalAlign,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing,
      }))
      : null;

    const slide2Draft = {
      layoutType: multipleTextValue
        ? "multipleText"
        : showOneTextRightSideBox
          ? "oneText"
          : "blank",
      oneTextLayout,
      multipleTextLayout,
      textElements,
      draggableImages,
      qrPosition,
      qrAudioPosition,
      aiImage: {
        ...aimage2,
        url: selectedAIimageUrl2,
        active: isAIimage2,
      },
      selectedStickers2,
      selectedVideoUrl,
      selectedAudioUrl,
    };

    // --- Slide3 draft ---
    const slide3Draft = {
      textElements3,
      draggableImages3,
      images3,
      selectedImg3,
      selectedVideoUrl3,
      selectedAudioUrl3,
      selectedLayout3,
      oneTextValue3,
      multipleTextValue3,
      selectedStickers3,
      qrPosition3,
      qrAudioPosition3,
      aimage3,
      isAIimage3,
      selectedAIimageUrl3,
    };

    const allDrafts = {
      slide1: layout1Draft,
      slide2: slide2Draft,
      slide3: slide3Draft,
      coverScreenshot,
      timestamp: new Date().toISOString(),
    };

    try {
      setLoadingDrafts(true)
      if (!user) {
        alert("You must be logged in to save Draft.");
        return;
      }

      const { error } = await supabase.from("draft").insert({
        user_id: user.id,
        cover_screenshot: coverScreenshot,
        slide1: layout1Draft,
        slide2: slide2Draft,
        slide3: slide3Draft,
      });

      if (error) throw error;
      console.log("✅ Draft saved to Supabase:", allDrafts);
    } catch (error) {
      console.error("❌ Error saving Draft:", error);
    }

    setLoadingDrafts(false)

    isCloseDraftModal();
    navigate("/");
  };

  return (
    <Box>
      <AppBar
        position="relative"
        sx={{ bgcolor: "white", color: "black", height: 'auto', borderBottom: `1px solid lightGray`, left: 0, top: 0, width: '100%' }}
        elevation={0}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            sx={{
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
            onClick={isDraftModalOpen}
          >
            <KeyboardArrowLeft /> Exit
          </Typography>

          {pathname ? (
            <LandingButton
              title="Preview"
              onClick={() => navigate(USER_ROUTES.PREVIEW)}
            />
          ) : (
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <LandingButton
                onClick={() => navigate(-1)}
                title="Edit Design"
                variant="outlined"
                loading={loadingDrafts}
              />
              <LandingButton title="Add to Basket" />
            </Box>
          )}
        </Toolbar>
      </AppBar>


      {loadingDrafts && (
        <Backdrop
          open
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress color="inherit" />
          {/* <Typography>Saving your draft...</Typography> */}
        </Backdrop>
      )}

      {isDraftModal && (
        <ConfirmModal
          open={isDraftModal}
          onCloseModal={isCloseDraftModal}
          btnText={loadingDrafts ? "Saving..." : "Save Draft"}
          title="Are you Sure to want save your card in Draft?"
          onClick={handleDraftConfirm}
          icon={<Drafts />}
        />
      )}
    </Box>
  );
};

export default Navbar;
