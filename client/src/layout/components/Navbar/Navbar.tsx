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

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route param is your draftId (uuid). If not valid, we generate one.
  const { id: routeId } = useParams<{ id: string }>();

  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const isCardEditorRoute = location.pathname.startsWith(`${USER_ROUTES.HOME}/`);

  const {
    open: isDraftModal,
    openModal: openDraftModal,
    closeModal: closeDraftModal,
  } = useModal();

  // ✅ cart
  // ✅ Admin base polygonlayout is coming in location.state.layout
  const adminLayout = useMemo(() => {
    const st: any = location.state;
    return st?.layout ?? null; // polygonlayout object
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
  } = useSlide3();

  // ✅ Ensure the URL always has a valid UUID draft id
  // - If user personalized a NEW card but route param isn't UUID, we replace it with a generated UUID.
  // - This prevents the "invalid uuid: 20" error + prevents overwrite across different cards.
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

  // ✅ Build slide4 json
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

  // ✅ Slide2 draft (your existing structure)
  const buildSlide2Draft = () => {
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
      ? texts.map((t: any) => ({
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

    return {
      layoutType: multipleTextValue ? "multipleText" : showOneTextRightSideBox ? "oneText" : "blank",
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
  };

  // ✅ Slide3 draft
  const buildSlide3Draft = () => {
    return {
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

      // OPTIONAL: store title/category/description if you already keep them somewhere
      // You can also pass from location.state if you want
      const st: any = location.state;
      const title = st?.title ?? st?.cardname ?? "";
      const category = st?.category ?? st?.cardcategory ?? "";
      const description = st?.description ?? "";

      const prices = selectedPrices ?? null;
      const displayPrice = typeof selectedVariant?.price === "number" ? selectedVariant.price : null;

      // If you want to compute sale:
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

            // ✅ meta
            title,
            category,
            description,
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

  // ✅ Add to Basket from editor
  // const handleAddToBasket = async () => {
  //   if (!user) {
  //     toast.error("Please login first");
  //     return;
  //   }

  //   const idInUrl = (window.location.pathname.split("/").pop() || "").trim();
  //   if (!isUuid(idInUrl)) {
  //     toast.error("Invalid draft id for basket");
  //     return;
  //   }

  //   setLoadingDrafts(true);
  //   try {
  //     const coverScreenshot = await captureSlideCover();

  //     const selectedSize = localStorage.getItem("selectedSize") ?? "a4";
  //     const selectedVariant = safeParse<SelectedVariant>(localStorage.getItem("selectedVariant"));
  //     const selectedPrices = safeParse<any>(localStorage.getItem("selectedPrices"));

  //     const st: any = location.state;
  //     const title = st?.title ?? st?.cardname ?? "Untitled";
  //     const category = st?.category ?? st?.cardcategory ?? "default";
  //     const description = st?.description ?? "";

  //     // You may already keep actual/sale split; here we store whatever you have:
  //     const prices = selectedPrices ?? null;
  //     const displayPrice = typeof selectedVariant?.price === "number" ? selectedVariant.price : 0;

  //     const payload:any = {
  //       id: idInUrl,
  //       type: "card" as const,
  //       img: coverScreenshot ?? st?.poster ?? st?.imageurl ?? "",
  //       title,
  //       category,
  //       description,
  //       selectedSize,
  //       prices, // json (your cart can decide)
  //       isOnSale: false,
  //       displayPrice,

  //       // ✅ important: editor base layout for slide1/slide4
  //       polygonlayout: adminLayout,
  //     };

  //     const res = addToCart(payload);

  //     if (!res?.ok && res?.reason === "exists") {
  //       toast.error("Already exists in basket ❌");
  //       return;
  //     }

  //     toast.success("Added to basket ✅");
  //     // navigate(USER_ROUTES.BASKET) // if you have basket route
  //   } catch (e: any) {
  //     console.error("addToBasket failed:", e);
  //     toast.error(e?.message ?? "Add to basket failed");
  //   } finally {
  //     setLoadingDrafts(false);
  //   }
  // };

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
            onClick={openDraftModal}
          >
            <KeyboardArrowLeft /> Exit
          </Typography>

          {isCardEditorRoute ? (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* <LandingButton title="Add to Basket" variant="outlined" onClick={handleAddToBasket} loading={loadingDrafts} /> */}
              <LandingButton title="Preview" onClick={() => navigate(USER_ROUTES.PREVIEW)} />
            </Box>
          ) : (
            <LandingButton title="Back to Design" onClick={() => navigate(-1)} />
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
        />
      )}
    </Box>
  );
};

export default Navbar;
