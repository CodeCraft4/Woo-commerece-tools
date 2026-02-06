import { AppBar, Backdrop, Box, CircularProgress, Toolbar, Typography } from "@mui/material";
import { Drafts, KeyboardArrowLeft } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import toast from "react-hot-toast";

import { USER_ROUTES } from "../../../constant/route";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import LandingButton from "../../../components/LandingButton/LandingButton";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabase/supabase";

// ✅ slide contexts
import { useSlide1 } from "../../../context/Slide1Context";
import { useSlide2 } from "../../../context/Slide2Context";
import { useSlide3 } from "../../../context/Slide3Context";
import { useSlide4 } from "../../../context/Slide4Context";

type SelectedVariant = { key?: string; title?: string; price?: number; basePrice?: number };

const safeParse = <T,>(s: string | null): T | null => {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
};

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const makeUuid = () => globalThis.crypto.randomUUID();

/* ===================== FONT STYLE NORMALIZERS ===================== */
// picks first defined key
const pick = (obj: any, keys: string[], fallback: any) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return fallback;
};

// returns BOTH canonical + legacy keys, so any UI variant restores correctly
const normTextBox = (t: any, g: any) => {
  const fontSize = pick(t, ["fontSize", "fontSize1", "fontSize2", "fontSize3"], g.fontSize);
  const fontWeight = pick(t, ["fontWeight", "fontWeight1", "fontWeight2", "fontWeight3"], g.fontWeight);
  const fontFamily = pick(t, ["fontFamily", "fontFamily1", "fontFamily2", "fontFamily3"], g.fontFamily);
  const fontColor = pick(t, ["fontColor", "fontColor1", "fontColor2", "fontColor3", "color"], g.fontColor);
  const textAlign = pick(t, ["textAlign", "textAlign1", "textAlign2", "textAlign3"], g.textAlign);
  const verticalAlign = pick(t, ["verticalAlign", "verticalAlign1", "verticalAlign2", "verticalAlign3"], g.verticalAlign);
  const lineHeight = pick(t, ["lineHeight", "lineHeight1", "lineHeight2", "lineHeight3"], g.lineHeight);
  const letterSpacing = pick(
    t,
    ["letterSpacing", "letterSpacing1", "letterSpacing2", "letterSpacing3"],
    g.letterSpacing
  );
  const rotation = pick(t, ["rotation", "rotation1", "rotation2", "rotation3"], g.rotation ?? 0);

  return {
    value: t?.value ?? "",

    // canonical
    fontSize,
    fontWeight,
    fontFamily,
    fontColor,
    textAlign,
    verticalAlign,
    lineHeight,
    letterSpacing,
    rotation,

    // legacy mirrors (many components use these)
    fontSize1: fontSize,
    fontWeight1: fontWeight,
    fontFamily1: fontFamily,
    fontColor1: fontColor,
    textAlign1: textAlign,
    verticalAlign1: verticalAlign,

    fontSize3: fontSize,
    fontWeight3: fontWeight,
    fontFamily3: fontFamily,
    fontColor3: fontColor,
    textAlign3: textAlign,
    verticalAlign3: verticalAlign,
  };
};
/* ================================================================ */

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route param is your draftId (uuid). If not valid, we generate one.
  const { id: routeId } = useParams<{ id: string }>();

  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const isCardEditorRoute = location.pathname.startsWith(`${USER_ROUTES.HOME}/`);

  const { open: isDraftModal, openModal: openDraftModal, closeModal: closeDraftModal } = useModal();

  // ✅ Admin base polygonlayout can come from:
  // - location.state.layout  (normal flow)
  // - location.state.draftFull.layout (resume draft flow)
  const adminLayout = useMemo(() => {
    const st: any = location.state;
    return st?.layout ?? st?.draftFull?.layout ?? null;
  }, [location.state]);

  // ✅ meta can come from:
  // - location.state (normal flow)
  // - location.state.draftFull (resume draft flow)
  const meta = useMemo(() => {
    const st: any = location.state;
    return {
      title: st?.title ?? st?.draftFull?.title ?? st?.cardname ?? "",
      category: st?.category ?? st?.draftFull?.category ?? st?.cardcategory ?? "",
      description: st?.description ?? st?.draftFull?.description ?? "",
    };
  }, [location.state]);

  // ✅ slide contexts
  const { layout1 } = useSlide1();
  const { layout4 } = useSlide4();

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

    // ✅ IMPORTANT: for draft show
    layout2,
    bgColor2,
    bgImage2,
  } = useSlide2();

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

    // ✅ ADD style + layout state for slide3
    texts3,
    showOneTextRightSideBox3,
    fontSize3,
    fontFamily3,
    fontColor3,
    fontWeight3,
    textAlign3,
    verticalAlign3,
    rotation3,
    lineHeight3,
    letterSpacing3,

    // ✅ IMPORTANT: for draft show (same idea as slide2)
    layout3,
    bgColor3,
    bgImage3,
  } = useSlide3();

  // ✅ Ensure the URL always has a valid UUID draft id
  const draftId = useMemo(() => {
    if (routeId && isUuid(routeId)) return routeId;
    return "";
  }, [routeId]);

  useEffect(() => {
    if (!isCardEditorRoute) return;

    // If route param is missing or not UUID => create a new draftId and replace URL.
    if (!draftId) {
      const newId = makeUuid();
      navigate(`${USER_ROUTES.HOME}/${newId}`, { replace: true, state: location.state });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, isCardEditorRoute]);

  // ✅ Screenshot: uses your SlideCover id
  const captureSlideCover = async (): Promise<string | null> => {
    const element = document.getElementById("slide-cover-capture");
    if (!element) return null;

    try {
      const dataUrl = await htmlToImage.toJpeg(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 1,
        quality: 0.7,
        skipFonts: true,
        fontEmbedCSS: "",
      });

      return dataUrl;
    } catch (e) {
      console.error("captureSlideCover failed:", e);
      return null;
    }
  };

  // ✅ Build slide1 json (user edits only)
  const buildSlide1Draft = () => {
    if (!layout1) return null;

    return {
      elements: (layout1?.elements ?? []).map((el: any) => ({
        id: el.id,
        src: el.src ?? null,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        zIndex: el.zIndex,
        rotation: el.rotation,
        locked: el.locked,
        isEditable: el.isEditable,
        clipPath: el.clipPath ?? el.shapePath ?? null,
      })),
      stickers: (layout1?.stickers ?? []).map((st: any) => ({
        id: st.id,
        sticker: st.sticker ?? null,
        x: st.x,
        y: st.y,
        width: st.width,
        height: st.height,
        zIndex: st.zIndex,
        rotation: st.rotation,
        locked: st.locked,
        isEditable: st.isEditable,
      })),
      textElements: (layout1?.textElements ?? []).map((t: any) => ({
        id: t.id,
        text: t.text ?? "",
        x: t.x,
        y: t.y,
        width: t.width,
        height: t.height,
        fontSize: t.fontSize,
        fontFamily: t.fontFamily,
        fontWeight: t.fontWeight,
        color: t.color,
        italic: t.italic ?? false,
        textAlign: t.textAlign,
        verticalAlign: t.verticalAlign,
        zIndex: t.zIndex,
        locked: t.locked,
        isEditable: t.isEditable,
      })),
    };
  };

  // ✅ Slide2 draft (now includes normalized layout + bg + full fontStyle for one/multiple)
  const buildSlide2Draft = () => {
    const g2 = {
      fontSize,
      fontWeight,
      fontFamily,
      fontColor,
      textAlign,
      verticalAlign,
      rotation,
      lineHeight: lineHeight2,
      letterSpacing: letterSpacing2,
    };

    const oneTextLayout = showOneTextRightSideBox
      ? normTextBox(
        {
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
        },
        g2
      )
      : null;

    const multipleTextLayout = multipleTextValue ? (texts ?? []).map((t: any) => normTextBox(t, g2)) : null;

    return {
      // ✅ the part your UI needs to show draft properly
      layout: layout2 ?? null,
      bgColor: bgColor2 ?? null,
      bgImage: bgImage2 ?? null,

      // ✅ existing data
      layoutType: multipleTextValue ? "multipleText" : showOneTextRightSideBox ? "oneText" : "blank",
      oneTextLayout,
      multipleTextLayout,

      // ✅ keep raw texts too (safe for any restore logic)
      texts,

      textElements,
      draggableImages,
      qrPosition,
      qrAudioPosition,

      aiImage: { ...aimage2, url: selectedAIimageUrl2, active: isAIimage2 },
      selectedStickers2,

      selectedVideoUrl,
      selectedAudioUrl,
    };
  };

  // ✅ Slide3 draft (include layout3 + bg + full fontStyle for one/multiple)
  const buildSlide3Draft = () => {
    const g3 = {
      fontSize: fontSize3,
      fontWeight: fontWeight3,
      fontFamily: fontFamily3,
      fontColor: fontColor3,
      textAlign: textAlign3,
      verticalAlign: verticalAlign3,
      rotation: rotation3,
      lineHeight: lineHeight3,
      letterSpacing: letterSpacing3,
    };

    const oneTextLayout = showOneTextRightSideBox3
      ? normTextBox(
        {
          value: oneTextValue3,
          fontSize: fontSize3,
          fontWeight: fontWeight3,
          fontFamily: fontFamily3,
          fontColor: fontColor3,
          textAlign: textAlign3,
          verticalAlign: verticalAlign3,
          lineHeight: lineHeight3,
          letterSpacing: letterSpacing3,
          rotation: rotation3,
        },
        g3
      )
      : null;

    const multipleTextLayout = multipleTextValue3 ? (texts3 ?? []).map((t: any) => normTextBox(t, g3)) : null;

    return {
      // ✅ the part your UI needs to show draft properly
      layout: layout3 ?? null,
      bgColor: bgColor3 ?? null,
      bgImage: bgImage3 ?? null,

      // ✅ layout type (optional but helpful)
      layoutType: multipleTextValue3 ? "multipleText" : showOneTextRightSideBox3 ? "oneText" : "blank",
      oneTextLayout,
      multipleTextLayout,

      // ✅ keep raw texts too
      texts3,

      // ✅ existing data you were saving
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
  };

  // ✅ Build slide4 json (already fine)
  const buildSlide4Draft = () => {
    if (!layout4) return null;

    return {
      elements: (layout4?.elements ?? []).map((el: any) => ({
        id: el.id,
        src: el.src ?? null,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        zIndex: el.zIndex,
        rotation: el.rotation,
        locked: el.locked,
        isEditable: el.isEditable,
        clipPath: el.clipPath ?? el.shapePath ?? null,
      })),
      stickers: (layout4?.stickers ?? []).map((st: any) => ({
        id: st.id,
        sticker: st.sticker ?? null,
        x: st.x,
        y: st.y,
        width: st.width,
        height: st.height,
        zIndex: st.zIndex,
        rotation: st.rotation,
        locked: st.locked,
        isEditable: st.isEditable,
      })),
      textElements: (layout4?.textElements ?? []).map((t: any) => ({
        id: t.id,
        text: t.text ?? "",
        x: t.x,
        y: t.y,
        width: t.width,
        height: t.height,
        fontSize: t.fontSize,
        fontFamily: t.fontFamily,
        fontWeight: t.fontWeight,
        color: t.color,
        italic: t.italic ?? false,
        textAlign: t.textAlign,
        verticalAlign: t.verticalAlign,
        zIndex: t.zIndex,
        locked: t.locked,
        isEditable: t.isEditable,
      })),
    };
  };

  // ✅ Draft Save (upsert)
  const saveDraftToDb = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (!isCardEditorRoute) {
      closeDraftModal();
      navigate("/");
      return;
    }

    // use current url id (after useEffect auto-fix)
    const idInUrl = (window.location.pathname.split("/").pop() || "").trim();
    if (!isUuid(idInUrl)) {
      toast.error("Draft id is invalid. Please try again.");
      return;
    }

    setLoadingDrafts(true);

    try {
      const coverScreenshot = await captureSlideCover();

      const slide1Draft = buildSlide1Draft();
      const slide2Draft = buildSlide2Draft();
      const slide3Draft = buildSlide3Draft();
      const slide4Draft = buildSlide4Draft();

      // meta from storage (ProductPopup sets these)
      const selectedSize = localStorage.getItem("selectedSize") ?? "a4";
      const selectedVariant = safeParse<SelectedVariant>(localStorage.getItem("selectedVariant"));
      const selectedPrices = safeParse<any>(localStorage.getItem("selectedPrices"));

      const prices = selectedPrices ?? null;
      const displayPrice = typeof selectedVariant?.price === "number" ? selectedVariant.price : null;

      const isOnSale = false;

      const { error } = await supabase
        .from("draft")
        .upsert(
          {
            user_id: user.id,
            card_id: idInUrl,

            // ✅ admin base polygonlayout reference
            layout: adminLayout,

            // ✅ user edits
            cover_screenshot: coverScreenshot,
            slide1: slide1Draft,
            slide2: slide2Draft,
            slide3: slide3Draft,
            slide4: slide4Draft,

            // ✅ meta (supports draftFull too)
            title: meta.title,
            category: meta.category,
            description: meta.description,
            selected_size: selectedSize,
            prices,
            display_price: displayPrice,
            is_on_sale: isOnSale,
          },
          { onConflict: "user_id,card_id" }
        );

      if (error) throw error;

      toast.success("Draft saved ✅");
      closeDraftModal();
      navigate("/");
    } catch (e: any) {
      console.error("save draft failed:", e);
      toast.error(e?.message ?? "Save failed");
    } finally {
      setLoadingDrafts(false);
    }
  };

  return (
    <Box>
      <AppBar
        position="relative"
        sx={{
          bgcolor: "white",
          color: "black",
          borderBottom: "1px solid lightGray",
          left: 0,
          top: 0,
          width: "100%",
        }}
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
            onClick={() => location.pathname === USER_ROUTES.PREVIEW ? navigate(-1) : openDraftModal()}
          >
            <KeyboardArrowLeft /> Exit
          </Typography>

          {isCardEditorRoute ? (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <LandingButton title="Preview" onClick={() => navigate(USER_ROUTES.PREVIEW)} />
            </Box>
          ) : (
            null
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
        </Backdrop>
      )}

      {isDraftModal && (
        <ConfirmModal
          open={isDraftModal}
          onCloseModal={closeDraftModal}
          btnText={loadingDrafts ? "Saving..." : "Save Draft"}
          title="Do you want to save this card as Draft?"
          onClick={saveDraftToDb}
          icon={<Drafts />}
          isDraftOpen
        />
      )}
    </Box>
  );
};

export default Navbar;
