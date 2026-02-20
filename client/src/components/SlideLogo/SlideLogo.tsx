// SlideLogo.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Chip, IconButton, Paper, Switch, TextField, Tooltip, Typography } from "@mui/material";
import {
  Close,
  ContentCopyOutlined,
  Forward10,
  Forward30,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  LockOpenOutlined,
  LockOutlined,
  TitleOutlined,
  UploadFileRounded,
} from "@mui/icons-material";
import QrGenerator from "../QR-code/Qrcode";
import { Rnd } from "react-rnd";
import { COLORS } from "../../constant/color";
import { motion } from "framer-motion";
import { useSlide4 } from "../../context/Slide4Context";
import { useLocation, useParams } from "react-router-dom";
import mergePreservePdf from "../../utils/mergePreservePdf";
import { safeGetStorage } from "../../lib/storage";
import { getDraftCardId, isUuid } from "../../lib/draftCardId";
import { readDraftFull } from "../../lib/draftLocal";
import AlignmentGuides from "../AlignmentGuides/AlignmentGuides";
import { useAlignGuides } from "../../hooks/useAlignGuides";

/* ===================== helpers + types ===================== */
const num = (v: any, d = 0) => (typeof v === "number" && !Number.isNaN(v) ? v : d);
const str = (v: any, d = "") => (typeof v === "string" ? v : d);
const bool = (v: any, d = false) => (typeof v === "boolean" ? v : d);
const idOrIdx = (obj: any, idx: number, prefix: string) => str(obj?.id, `${prefix}-${idx}`);

type ElementEl = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src?: string | null;
  zIndex?: number;
  rotation?: number;
  isEditable?: boolean;
  locked?: boolean;
  clipPath?: any
};
type StickerEl = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  sticker?: string | null;
  isEditable?: boolean;
  locked?: boolean;
};
type TextEl = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  textAlign: "left" | "center" | "right";
  verticalAlign: "top" | "center" | "bottom";
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: number;
  italic?: boolean;
  zIndex?: number;
  isEditable?: boolean;
  locked?: boolean;

};
type LayoutNorm = {
  elements: ElementEl[];
  stickers: StickerEl[];
  textElements: TextEl[];
};

const toElement = (obj: any, i: number, editable: boolean, prefix = "bg"): ElementEl => ({
  id: idOrIdx(obj, i, prefix),
  x: num(obj?.x, 0),
  y: num(obj?.y, 0),
  width: num(obj?.width, num(obj?.w, 200)),
  height: num(obj?.height, num(obj?.h, 200)),
  src: obj?.src ?? obj?.image ?? obj?.url ?? null,
  zIndex: num(obj?.zIndex, 1),
  rotation: num(obj?.rotation, 0),
  isEditable: editable,
  locked: bool(obj?.locked, !editable),
  clipPath: obj?.clipPath ?? obj?.shapePath ?? null,
});
const toSticker = (obj: any, i: number, editable: boolean, prefix = "st"): StickerEl => ({
  id: idOrIdx(obj, i, prefix),
  x: num(obj?.x, 0),
  y: num(obj?.y, 0),
  width: num(obj?.width, 80),
  height: num(obj?.height, 80),
  zIndex: num(obj?.zIndex, 1),
  rotation: num(obj?.rotation, 0),
  sticker: obj?.sticker ?? obj?.src ?? obj?.image ?? obj?.url ?? null,
  isEditable: editable,
  locked: bool(obj?.locked, !editable),
});
const toText = (obj: any, i: number, editable: boolean, prefix = "te"): TextEl => {
  const tAlign = str(obj?.textAlign, "center");
  const vAlign = str(obj?.verticalAlign, "center");
  return {
    id: idOrIdx(obj, i, prefix),
    x: num(obj?.x, num(obj?.position?.x, 0)),
    y: num(obj?.y, num(obj?.position?.y, 0)),
    width: num(obj?.width, num(obj?.w, num(obj?.size?.width, 240))),
    height: num(obj?.height, num(obj?.h, num(obj?.size?.height, 60))),
    text: str(obj?.text ?? obj?.value, ""),
    textAlign: (tAlign === "start" ? "left" : tAlign === "end" ? "right" : tAlign) as TextEl["textAlign"],
    verticalAlign: (["top", "bottom"].includes(vAlign) ? (vAlign as any) : "center") as TextEl["verticalAlign"],
    fontSize: num(obj?.fontSize, 18),
    fontFamily: str(obj?.fontFamily, "Roboto"),
    color: str(obj?.fontColor ?? obj?.color, "#000"),
    fontWeight: num(obj?.fontWeight ?? obj?.bold, 400),
    italic: bool(obj?.italic, false),
    zIndex: num(obj?.zIndex, 1),
    isEditable: editable,
    locked: bool(obj?.locked, !editable),
  };
};

function normalizeSlide(slide: any): {
  bgColor: string | null;
  bgImage: string | null;
  layout: LayoutNorm;
} {
  if (!slide || typeof slide !== "object") {
    return { bgColor: null, bgImage: null, layout: { elements: [], stickers: [], textElements: [] } };
  }
  const layout = slide.layout ?? {};
  const user = slide.user ?? {};
  const bg = slide.bg ?? {};
  const flags = slide.flags ?? {};
  const rect = bg?.rect ?? { x: 0, y: 0, width: 0, height: 0 };
  const bgEditable = bool(bg?.editable, false);       // default locked
  const bgLocked = bool(bg?.locked, !bgEditable);

  const out: LayoutNorm = { elements: [], stickers: [], textElements: [] };

  // bg frames (locked/editable)
  out.elements.push(...(layout?.bgFrames?.locked ?? []).map((o: any, i: number) => toElement(o, i, false, "bg-locked")));
  out.elements.push(...(layout?.bgFrames?.editable ?? []).map((o: any, i: number) => toElement(o, i, true, "bg-edit")));
  out.textElements.push(...(user?.freeTexts ?? []).map((o: any, i: number) => toText(o, i, !o?.locked, "ut")));

  // single bg image
  if (bg?.image) {
    out.elements.push(
      toElement(
        {
          id: "bg-image",
          x: num(rect.x, 0),
          y: num(rect.y, 0),
          width: num(rect.width, 0),
          height: num(rect.height, 0),
          src: bg.image,
          zIndex: 0,
          rotation: 0,
          locked: bgLocked,          // hard lock flag
        },
        9990,
        bgEditable && !bgLocked,      // isEditable flag for UI
        "bg",
      ),
    );
  }

  // user images as elements
  out.elements.push(...(user?.images?.locked ?? []).map((o: any, i: number) => toElement(o, i, false, "uimg-locked")));
  out.elements.push(...(user?.images?.editable ?? []).map((o: any, i: number) => toElement(o, i, true, "uimg-edit")));

  // stickers (layout + user + qrVideo)
  out.stickers.push(...(layout?.stickers?.locked ?? []).map((o: any, i: number) => toSticker(o, i, false, "st-locked")));
  out.stickers.push(...(layout?.stickers?.editable ?? []).map((o: any, i: number) => toSticker(o, i, true, "st-edit")));
  out.stickers.push(...(user?.stickers?.locked ?? []).map((o: any, i: number) => toSticker(o, i, false, "ust-locked")));
  out.stickers.push(...(user?.stickers?.editable ?? []).map((o: any, i: number) => toSticker(o, i, true, "ust-edit")));

  if (slide.qrVideo?.url) {
    out.stickers.push(
      toSticker(
        {
          id: "qr-video",
          x: num(slide.qrVideo.x, 56),
          y: num(slide.qrVideo.y, 404),
          width: num(slide.qrVideo.width, 70),
          height: num(slide.qrVideo.height, 105),
          zIndex: num(slide.qrVideo.zIndex, 1000),
          url: slide.qrVideo.url,
        },
        9991,
        false,
        "qr",
      ),
    );
  }

  // texts
  out.textElements.push(...(layout?.staticText ?? []).map((o: any, i: number) => toText(o, i, !!o?.editable, "te")));
  out.textElements.push(
    ...(slide.multipleTexts ?? []).map((o: any, i: number) => {
      const explicit =
        typeof o?.isEditable === "boolean"
          ? o.isEditable
          : typeof o?.editable === "boolean"
            ? o.editable
            : undefined;
      const editable = explicit ?? !o?.locked;
      return toText(o, i, editable, "mte");
    })
  );
  if (slide.oneText && str(slide.oneText.value, "").trim().length > 0) {
    out.textElements.push(
      toText(
        {
          id: "single-text",
          x: num(slide.oneText.x, 24),
          y: num(slide.oneText.y, 24),
          width: num(slide.oneText.width, 360),
          height: num(slide.oneText.height, 120),
          text: slide.oneText.value,
          fontSize: slide.oneText.fontSize,
          fontFamily: slide.oneText.fontFamily,
          fontColor: slide.oneText.fontColor,
          fontWeight: slide.oneText.fontWeight,
          textAlign: slide.oneText.textAlign,
          verticalAlign: slide.oneText.verticalAlign,
          italic: false,
          zIndex: 1,
        },
        9992,
        true,
        "ote",
      ),
    );
  }

  // freeze edits if AI image flag
  if (flags?.isAIImage === true) {
    out.elements = out.elements.map((e) => ({ ...e, isEditable: false }));
    out.stickers = out.stickers.map((s) => ({ ...s, isEditable: false }));
    out.textElements = out.textElements.map((t) => ({ ...t, isEditable: false }));
  }

  return { bgColor: bg?.color ?? null, bgImage: bg?.image ?? null, layout: out };
}

/* new text factory */
const createNewTextElement4 = (defaults: any) => ({
  id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  value: "",
  fontSize: defaults.fontSize || 16,
  fontWeight: defaults.fontWeight || 400,
  fontColor: defaults.fontColor || "#000000",
  fontFamily: defaults.fontFamily || "Roboto",
  textAlign: defaults.textAlign || "center",
  rotation: defaults.rotation || 0,
  zIndex: defaults.zIndex || 1,
  position: { x: 50 + Math.random() * 50, y: 50 + Math.random() * 50 },
  size: { width: 200, height: 40 },
  isEditing: false,
});

interface SlideLogoProps {
  textAlign?: "start" | "center" | "end";
  rotation?: number;
  togglePopup?: (name: string | null) => void;
  activePopup?: string | null;
  activeIndex?: number;
  addTextRight?: number; // ⬅ comes from your popup counter
  rightBox?: boolean;
  isAdminEditor?: boolean;
}

/* -------------------- main wrapper -------------------- */
const SlideLogo = ({
  activeIndex,
  rightBox,
  isAdminEditor,
  addTextRight, // ⬅ receive it here
}: SlideLogoProps) => {



  return (
    <Box sx={{ display: "flex", width: "100%", gap: "5px", position: "relative" }}>
      {activeIndex === 3 && rightBox ? (
        isAdminEditor ? (
          <AdminSlide4Canvas addTextRight={addTextRight} />
        ) : (
          <UserSlide4Preview />
        )
      ) : null}
    </Box>
  );
};

/* -------------------- USER VIEW-ONLY -------------------- */
const UserSlide4Preview = () => {
  const {
    isSlideActive4,
    bgColor4,
    bgImage4,
    // selectedVideoUrl4,
    // selectedAudioUrl4,
    // qrPosition4,
    // qrAudioPosition4,
    setBgColor4,
    setBgImage4,
    setLayout4,
    layout4,
    setFontColor4,
    setFontSize4,
    setFontWeight4,
    setFontFamily4,
  } = useSlide4();

  /* ------------------ pull slide1 from route ------------------ */

  const location = useLocation();
  const { id: routeId } = useParams<{ id?: string }>();
  const draftId = useMemo(() => (routeId && isUuid(routeId) ? routeId : getDraftCardId() ?? ""), [routeId]);
  const localDraftFull = useMemo(() => (draftId ? readDraftFull(draftId) : null), [draftId]);
  const slide4 = location.state?.layout?.slides?.slide4 ?? null;
  const draftSlide4 = location.state?.draftFull?.slide4 ?? localDraftFull?.slide4 ?? null;



  /* ------------------ local UI state ------------------ */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedBgIndex, setSelectedBgIndex] = useState<number | null>(null);
  console.log(selectedBgIndex)
  const [uploadTarget, setUploadTarget] = useState<{ type: "bg" | "sticker"; index: number } | null>(null);
  const rightBoxRef = useRef<HTMLDivElement>(null);
  const align = useAlignGuides(rightBoxRef);

  /* ------------------ user upload handlers (editable only) ------------------ */
  const handleImageUploadClick = (type: "bg" | "sticker", index: number) => {
    if (type === "bg") setSelectedBgIndex(index);
    setUploadTarget({ type, index });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const dataUrl = event.target?.result as string;
      setLayout4((prev: any) => {
        if (!prev) return prev;
        if (uploadTarget.type === "bg") {
          const elements = [...(prev.elements ?? [])];
          const el = elements[uploadTarget.index];
          if (!el?.isEditable) return prev; // why: block admin-only frames
          elements[uploadTarget.index] = { ...el, src: dataUrl };
          return { ...prev, elements };
        }
        if (uploadTarget.type === "sticker") {
          const stickers = [...(prev.stickers ?? [])];
          const st = stickers[uploadTarget.index];
          if (!st?.isEditable) return prev;
          stickers[uploadTarget.index] = { ...st, sticker: dataUrl };
          return { ...prev, stickers };
        }
        return prev;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setUploadTarget(null);
  };

  /* ------------------ static text edit bindings (editable only) ------------------ */
  const handleTextChange = (newText: string, index: number) => {
    setLayout4((prev: any) => {
      const updated = [...prev.textElements];
      if (!updated[index]?.isEditable) return prev;
      updated[index] = { ...updated[index], text: newText };
      return { ...prev, textElements: updated };
    });
  };

  const handleTextFocus = (index: number, te: any) => {
    if (!te?.isEditable) return;
    setEditingIndex(index);
    setFontSize4(te.fontSize);
    setFontFamily4(te.fontFamily);
    setFontColor4(te.color);
    setFontWeight4(te.fontWeight);
  };


  /* ------------------ normalize slide1 -> user view state ------------------ */
  useEffect(() => {
    if (draftSlide4) {
      setLayout4?.(draftSlide4.layout ?? draftSlide4);
      const hasBgColor = draftSlide4.bgColor4 !== undefined || draftSlide4.bgColor !== undefined;
      const hasBgImage = draftSlide4.bgImage4 !== undefined || draftSlide4.bgImage !== undefined;
      if (hasBgColor) {
        setBgColor4?.(draftSlide4.bgColor4 ?? draftSlide4.bgColor ?? null);
      }
      if (hasBgImage) {
        setBgImage4?.(draftSlide4.bgImage4 ?? draftSlide4.bgImage ?? null);
      }

      const baseSlide4 = localDraftFull?.layout?.slides?.slide4 ?? slide4 ?? null;
      if (baseSlide4) {
        const norm = normalizeSlide(baseSlide4);
        if (!hasBgColor) setBgColor4?.(norm.bgColor);
        if (!hasBgImage) setBgImage4?.(norm.bgImage);
      }
      return;
    }

    const saved = safeGetStorage("slide4_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.layout4) {
          if (parsed.bgColor4 !== undefined) setBgColor4?.(parsed.bgColor4);
          if (parsed.bgImage4 !== undefined) setBgImage4?.(parsed.bgImage4);
          setLayout4?.(parsed.layout4);
          return;
        }
      } catch { }
    }

    if (!slide4) return;
    const norm = normalizeSlide(slide4);
    setBgColor4?.(norm.bgColor);
    setBgImage4?.(norm.bgImage);
    setLayout4?.(norm.layout);
  }, [draftSlide4, slide4, localDraftFull, setBgColor4, setBgImage4, setLayout4]);

  return (
    <Box
      ref={rightBoxRef}
      sx={{
        flex: 1,
        zIndex: 10,
        p: 2,
        position: "relative",
        height: "100vh",
        opacity: isSlideActive4 ? 1 : 0.6,
        pointerEvents: isSlideActive4 ? "auto" : "none",
        backgroundColor: bgImage4 ? "transparent" : bgColor4 ?? "transparent",
        // backgroundImage: bgImage4 ? `url(${bgImage4})` : "none",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        "&::after": !isSlideActive4
          ? {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(146, 145, 145, 0.51)",
            zIndex: 1000,
            pointerEvents: "none",
          }
          : {},
      }}
    >
      <AlignmentGuides
        {...align.guides}
        hide={!isSlideActive4 || !align.isActive}
      />

      {/* Hidden file input (user uploads for editable items) */}
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

      {layout4 && (
        <Box sx={{ width: "100%", height: "100%" }}>
          {/* BG frames */}
          {layout4.elements
            ?.slice()
            .sort((a: any, b: any) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
            .map((el: any, index: number) => {
              const isEditable = !!el.isEditable;
              const isLocked = !!el.locked;

              return (
                <Box
                  key={el.id ?? index}
                  sx={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    borderRadius: 1,
                    overflow: "visible",
                    cursor: isEditable ? "pointer" : "default",
                  }}
                  onClick={() => setSelectedBgIndex(index)}
                >
                  <Box
                    component="img"
                    src={el.src || undefined}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "fill",
                      borderRadius: 1,
                      display: "block",
                      pointerEvents: "none",
                      clipPath: el.clipPath || "none",
                      WebkitClipPath: el.clipPath || "none",
                    }}
                  />
                  {/* ✅ Only show upload icon when this frame is editable (NOT when locked) */}
                  {isEditable && !isLocked && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(0,0,0,0.45)",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid white",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                      }}
                      onClick={() => handleImageUploadClick("bg", index)}
                      title="Change background image"
                    >
                      <UploadFileRounded sx={{ color: "white" }} />
                    </Box>
                  )}
                </Box>
              );
            })}

          {/* Stickers */}
          {layout4.stickers?.map((st: any, index: number) => {
            const isEditable = !!st.isEditable;
            return (
              <Box
                key={st.id ?? index}
                sx={{
                  position: "absolute",
                  left: st.x,
                  top: st.y,
                  zIndex: st.zIndex,
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={st.sticker || undefined}
                  sx={{
                    width: st.width,
                    height: st.height,
                    objectFit: "contain",
                    borderRadius: 1,
                    display: "block",
                    pointerEvents: "none",
                  }}
                />
                {/* Hover upload (editable only) */}
                {isEditable && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid white",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                    }}
                    onClick={() => handleImageUploadClick("sticker", index)}
                  >
                    <UploadFileRounded sx={{ color: "white", fontSize: 18 }} />
                  </Box>
                )}
              </Box>
            );
          })}

          {/* Static text */}
          {layout4.textElements?.map((te: any, index: number) => {
            const isEditable = !!te.isEditable;
            const isActive = editingIndex === index;
            return (
              <Box
                key={te.id ?? index}
                sx={{
                  position: "absolute",
                  left: te.x,
                  top: te.y,
                  width: te.width,
                  height: 'auto',
                  zIndex: (te.zIndex ?? 1) + 1000,

                  // ✅ easiest way to center the block itself
                  display: "grid",
                  placeItems: "center",

                  // ✅ cursor
                  cursor: !isEditable ? "not-allowed" : (isActive ? "text" : "pointer"),

                  // ✅ border
                  border: isEditable
                    ? (isActive ? "1px dashed #1976d2" : "1px dashed rgba(25,118,210,.35)")
                    : "none",
                  borderRadius: "6px",
                  transition: "border .15s ease",
                }}
                onClick={isEditable ? () => setEditingIndex(index) : undefined}
                onDoubleClick={isEditable ? () => setEditingIndex(index) : undefined}
              >
                <TextField
                  variant="standard"
                  fullWidth
                  multiline
                  value={te.text || ""}
                  onFocus={isEditable ? () => handleTextFocus(index, te) : undefined}
                  onChange={isEditable && isActive ? (e) => handleTextChange(e.target.value, index) : undefined}
                  onBlur={() => setEditingIndex(null)}

                  InputProps={{
                    readOnly: !(isEditable && isActive),
                    disableUnderline: true,
                    style: {
                      textAlign: "center",

                      fontSize: te.fontSize,
                      fontFamily: te.fontFamily,
                      color: te.color,
                      fontWeight: te.fontWeight,
                      fontStyle: te.italic ? "italic" : "normal",
                      padding: 0,
                      background: "transparent",
                      lineHeight: "1.2em",

                      // Let wrapper handle pointer until active
                      pointerEvents: isEditable && isActive ? "auto" : "none",
                    },
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",

                    // ✅ make sure both single & multiline inputs are centered
                    "& .MuiInputBase-input, & .MuiInputBase-inputMultiline": {
                      textAlign: "center",
                      textAlignLast: "center",
                    },

                    "& .MuiInputBase-input": {
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "pre-wrap",
                    },
                  }}
                />
              </Box>
            );
          })}

        </Box>
      )}
    </Box>
  );
};

/* -------------------- ADMIN EDITOR -------------------- */
const AdminSlide4Canvas = ({ addTextRight }: { addTextRight?: number }) => {
  const {
    images4,
    selectedImg4,
    setSelectedImage4,
    showOneTextRightSideBox4,
    oneTextValue4,
    setOneTextValue4,
    multipleTextValue4,
    texts4,
    editingIndex4,
    setEditingIndex4,
    fontSize4,
    fontWeight4,
    fontColor4,
    textAlign4,
    verticalAlign4,
    rotation4,
    setTexts4,
    setShowOneTextRightSideBox4,
    fontFamily4,
    textElements4,
    setTextElements4,
    selectedTextId4,
    setSelectedTextId4,
    setMultipleTextValue4,
    isSlideActive4,
    setFontSize4,
    setFontColor4,
    setFontWeight4,
    setFontFamily4,
    setTextAlign4,
    setVerticalAlign4,
    selectedVideoUrl4,
    setSelectedVideoUrl4,
    selectedAudioUrl4,
    setSelectedAudioUrl4,
    draggableImages4,
    setDraggableImages4,
    qrPosition4,
    setQrPosition4,
    qrAudioPosition4,
    setQrAudioPosition4,
    isAIimage4,
    setIsAIimage4,
    selectedAIimageUrl4,
    selectedStickers4,
    updateSticker4,
    removeSticker4,
    aimage4,
    setAIImage4,
    setSelectedLayout4,
    setImageFilter4,
    setActiveFilterImageId4,
    lineHeight4,
    letterSpacing4,
    bgColor4,
    bgImage4,
    bgEdit4,
    setBgEdit4,
    bgLocked4,
    setBgLocked4,
    bgRect4,
    setBgRect4,
    selectedShapeImageId4,
    setSelectedShapeImageId4,
  } = useSlide4();

  const [selectedStickerIndex2, setSelectedStickerIndex2] = useState<number | null>(null);
  const rightBoxRef = useRef<HTMLDivElement>(null);
  const align = useAlignGuides(rightBoxRef);
  const alignItems = useMemo(() => {
    const items: { id: string; x: number; y: number; w: number; h: number }[] = [];
    const push = (id: string, x?: number, y?: number, w?: number, h?: number) => {
      if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof w !== "number" ||
        typeof h !== "number" ||
        Number.isNaN(x + y + w + h)
      ) {
        return;
      }
      items.push({ id, x, y, w, h });
    };

    const selectedIds = Array.isArray(selectedImg4) ? selectedImg4 : [];
    (draggableImages4 ?? [])
      .filter((img: any) => selectedIds.includes(img.id))
      .forEach((img: any) => push(`img:${img.id}`, img.x, img.y, img.width, img.height));

    (textElements4 ?? []).forEach((t: any) =>
      push(`txt:${t.id}`, t.position?.x ?? t.x, t.position?.y ?? t.y, t.size?.width ?? t.width, t.size?.height ?? t.height)
    );

    (selectedStickers4 ?? []).forEach((s: any, idx: number) =>
      push(`st:${s.id ?? idx}`, s.x, s.y, s.width, s.height)
    );

    if (isAIimage4 && aimage4) {
      push("ai:4", aimage4.x, aimage4.y, aimage4.width, aimage4.height);
    }

    return items;
  }, [draggableImages4, selectedImg4, textElements4, selectedStickers4, isAIimage4, aimage4]);

  /* init draggable images */
  useEffect(() => {
    if (images4.length > 0) {
      setDraggableImages4((prev: any[]) => {
        const existingIds = prev.map((img: any) => img.id);
        const newOnes = images4
          .filter((img) => !existingIds.includes(img.id))
          .map((img) => ({
            id: img.id,
            src: img.src,
            x: 50,
            y: 50,
            width: 150,
            height: 150,
            rotation: 0,
          }));
        const stillValid = prev.filter((img: any) => images4.some((incoming) => incoming.id === img.id));
        const next = [...stillValid, ...newOnes];
        return mergePreservePdf(prev, next);
      });
    } else {
      setDraggableImages4((prev: any[]) => mergePreservePdf(prev, []));
    }
  }, [images4, setDraggableImages4]);

  /* add new text on external counter tick */
  const addNewTextElement = () => {
    const arr = Array.isArray(textElements4) ? textElements4 : [];
    const maxZ = arr.reduce((m, t: any) => Math.max(m, Number(t?.zIndex || 0)), 0);
    const newTextElement = createNewTextElement4({
      fontSize: 16,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      textAlign: "center",
      rotation: 0,
      zIndex: maxZ + 1,
    });
    newTextElement.isEditing = true;
    setTextElements4((prev: any[] = []) => [...prev, newTextElement]);
    setSelectedTextId4(newTextElement.id);
  };
  useEffect(() => {
    if (addTextRight) {
      addNewTextElement();
    }
  }, [addTextRight, addTextRight]);

  const updateTextElement = (id: string, updates: Partial<any>) => {
    setTextElements4((prev: any[] = []) => prev.map((text) => (text.id === id ? { ...text, ...updates } : text)));
  };
  const deleteTextElement = (id: string) => {
    setTextElements4((prev: any[] = []) => prev.filter((text) => text.id !== id));
    if (selectedTextId4 === id) setSelectedTextId4(null);
  };

  useEffect(() => {
    if (multipleTextValue4 && texts4.length === 0) {
      const defaultTexts = Array(3)
        .fill(null)
        .map(() => ({
          value: "",
          fontSize: 16,
          fontWeight: 400,
          fontColor: "#000000",
          fontFamily: "Roboto",
          textAlign: "center",
          verticalAlign: "center",
          rotation: 0,
          lineHeight: 1.5,
          letterSpacing: 0,
        }));
      setTexts4(defaultTexts);
    }
  }, [multipleTextValue4, setTexts4, texts4.length]);

  useEffect(() => {
    if (editingIndex4 !== null && editingIndex4 !== undefined) {
      setTexts4((prev) =>
        prev.map((t, i) =>
          i === editingIndex4
            ? { ...t, fontSize4, fontWeight4, fontColor4, fontFamily4, textAlign4, verticalAlign4 }
            : t
        )
      );
    }
  }, [fontSize4, fontFamily4, fontWeight4, fontColor4, textAlign4, verticalAlign4, editingIndex4, setTexts4]);

  useEffect(() => {
    if (selectedVideoUrl4) setQrPosition4((prev) => ({ ...prev, url: selectedVideoUrl4 }));
  }, [selectedVideoUrl4, setQrPosition4]);

  useEffect(() => {
    if (selectedAudioUrl4) setQrAudioPosition4((prev) => ({ ...prev, url: selectedAudioUrl4 }));
  }, [selectedAudioUrl4, setQrAudioPosition4]);

  const currentSelection: any = useMemo(() => {
    if (selectedTextId4) return { type: "text", id: selectedTextId4 };
    if (selectedShapeImageId4) return { type: "image", id: selectedShapeImageId4 };
    if (selectedStickerIndex2 !== null) return { type: "sticker", index: selectedStickerIndex2 };
    return null;
  }, [selectedTextId4, selectedShapeImageId4, selectedStickerIndex2]);

  const getSelectedLocked = (): boolean => {
    if (!currentSelection) return false;
    if (currentSelection.type === "text") {
      const t: any = (textElements4 || []).find((x: any) => x.id === currentSelection.id);
      return !!t?.locked; // ✅ include text
    }
    if (currentSelection.type === "image") {
      const i: any = draggableImages4.find((x) => x.id === currentSelection.id);
      return !!i?.locked;
    }
    if (currentSelection.type === "sticker") {
      const s: any = selectedStickers4?.[currentSelection.index];
      return !!s?.locked;
    }
    return false;
  };
  const selectedLocked = getSelectedLocked();

  const setSelectedLocked = (locked: any) => {
    if (!currentSelection) return;
    if (currentSelection.type === "text") {
      setTextElements4((prev: any[] = []) => prev.map((t) => (t.id === currentSelection.id ? { ...t, locked } : t)));
      if (locked) setSelectedTextId4(null);
      return;
    }
    if (currentSelection.type === "image") {
      setDraggableImages4((prev) => prev.map((img) => (img.id === currentSelection.id ? { ...img, locked } : img)));
      if (locked) setSelectedShapeImageId4(null);
      return;
    }
    if (currentSelection.type === "sticker") {
      const i = currentSelection.index;
      if (i != null) {
        updateSticker4(i, { locked } as any);
        if (locked) setSelectedStickerIndex2(null);
      }
    }
  };

  const selectionLabel = useMemo(() => {
    if (!currentSelection) return "";
    switch (currentSelection.type) {
      case "text":
        return "Text";
      case "image":
        return "Image";
      case "sticker":
        return "Sticker";
      default:
        return "";
    }
  }, [currentSelection]);

  const normalizeZ = (arr: any[]) =>
    [...arr].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)).map((item, i) => ({ ...item, zIndex: i + 1 }));
  const swapZ = (arr: any[], idA: any, idB: any) => {
    const next = arr.map((o) => ({ ...o }));
    const a = next.find((x) => x.id === idA);
    const b = next.find((x) => x.id === idB);
    if (!a || !b) return arr;
    const tmp = a.zIndex ?? 1;
    a.zIndex = b.zIndex ?? 1;
    b.zIndex = tmp;
    return next;
  };
  const layerUp = (id: any) => {
    setDraggableImages4((prev) => {
      const withZ = normalizeZ(prev);
      const me = withZ.find((x) => x.id === id);
      if (!me) return prev;
      const higher = withZ.filter((x) => (x.zIndex ?? 0) > (me.zIndex ?? 0)).sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))[0];
      if (!higher) return prev;
      return swapZ(withZ, me.id, higher.id);
    });
  };
  const layerDown = (id: any) => {
    setDraggableImages4((prev) => {
      const withZ = normalizeZ(prev);
      const me = withZ.find((x) => x.id === id);
      if (!me) return prev;
      const lower = withZ.filter((x) => (x.zIndex ?? 0) < (me.zIndex ?? 0)).sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))[0];
      if (!lower) return prev;
      return swapZ(withZ, me.id, lower.id);
    });
  };



  const placerRef = useRef<HTMLDivElement | null>(null);

  // Esc closes edit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBgEdit4(false);
      if (e.key.toLowerCase() === "l") setBgLocked4((v: any) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Outside click closes edit
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!bgEdit4) return;
      if (!placerRef.current) return;
      if (!placerRef.current.contains(e.target as Node)) setBgEdit4(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [bgEdit4]);


  // duplicate   
  const duplicateLayer = (type: 'text' | 'image' | 'sticker', idOrIndex: string | number) => {

    if (type === 'text') {
      const item: any = textElements4.find(t => t.id === idOrIndex);
      if (!item || item.locked) return;

      const newItem = {
        ...item,
        id: `text-duplicate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        position: {
          x: item.position.x + 30,
          y: item.position.y + 30,
        },
        zIndex: (item.zIndex || 1) + 1,   // put on top
      };

      setTextElements4(prev => [...prev, newItem]);
      setSelectedTextId4(newItem.id);     // optional: auto-select the duplicate
    }

    else if (type === 'image') {
      const item: any = draggableImages4.find(img => img.id === idOrIndex);
      if (!item || item.locked) return;

      const newItem = {
        ...item,
        id: `img-duplicate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        x: item.x + 30,
        y: item.y + 30,
        zIndex: (item.zIndex || 1) + 1,
      };

      setDraggableImages4(prev => [...prev, newItem]);
      setSelectedShapeImageId4(newItem.id);   // optional
    }

    else if (type === 'sticker') {
      const index = typeof idOrIndex === 'number' ? idOrIndex : -1;
      if (index < 0) return;

      const item: any = selectedStickers4?.[index];
      if (!item || item.locked) return;

      // const newSticker = {
      //   ...item,
      //   id: item.id ? `${item.id}-dup-${Date.now()}` : `sticker-dup-${Date.now()}`,
      //   x: item.x + 35,
      //   y: item.y + 35,
      //   zIndex: (item.zIndex || 1) + 1,
      // };

    }
  };

  return (
    <Box
      ref={rightBoxRef}
      sx={{
        flex: 1,
        zIndex: 10,
        p: 2,
        position: "relative",
        height: "700px",
        opacity: isSlideActive4 ? 1 : 0.6,
        pointerEvents: isSlideActive4 ? "auto" : "none",
        backgroundColor: bgColor4 ?? "transparent",
        // backgroundImage: bgImage4 ? `url(${bgImage4})` : "none",
        backgroundSize: "cover",
        "&::after": !isSlideActive4
          ? {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(146, 145, 145, 0.51)",
            zIndex: 1000,
            pointerEvents: "none",
          }
          : {},
      }}
    >
      <AlignmentGuides
        {...align.guides}
        hide={!isSlideActive4 || !align.isActive}
      />

      {/* BG */}
      {bgImage4 && (
        <Rnd
          size={{ width: bgRect4.width, height: bgRect4.height }}
          position={{ x: bgRect4.x, y: bgRect4.y }}
          bounds="parent"
          enableUserSelectHack={false}
          // ✅ only draggable when unlocked AND in edit mode
          disableDragging={!bgEdit4 || bgLocked4}
          // ✅ only resizable when unlocked AND in edit mode
          enableResizing={
            bgEdit4 && !bgLocked4
              ? {
                top: false,
                right: false,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: true,
                bottomLeft: false,
                topLeft: false,
              }
              : false
          }
          onDragStop={(_, d) => setBgRect4((r: any) => ({ ...r, x: d.x, y: d.y }))}
          onResizeStop={(_, __, ref, ___, position) =>
            setBgRect4({
              x: position.x,
              y: position.y,
              width: parseInt(ref.style.width, 10),
              height: parseInt(ref.style.height, 10),
            })
          }
          style={{
            zIndex: 1,
            outline: bgEdit4 && !bgLocked4 ? "2px solid #1976d2" : "none",
            cursor: bgEdit4 && !bgLocked4 ? "move" : "default",
          }}
          resizeHandleStyles={{
            bottomRight: {
              width: "14px",
              height: "14px",
              background: "white",
              border: "2px solid #1976d2",
              borderRadius: "3px",
              right: "-7px",
              bottom: "-7px",
              cursor: "se-resize",
              boxShadow: "0 0 2px rgba(0,0,0,.25)",
              pointerEvents: bgEdit4 && !bgLocked4 ? "auto" : "none",
            },
          }}
        >
          <Box
            ref={placerRef}
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              backgroundColor: bgImage4 ? "transparent" : bgColor4 ?? "transparent",
              backgroundImage: bgImage4 ? `url(${bgImage4})` : "none",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              userSelect: "none",
            }}
            // ✅ double-click only works when unlocked
            onDoubleClick={() => {
              if (!bgLocked4) setBgEdit4(true);
            }}
          >
            {/* Lock/Unlock toggle (top-left) */}
            <IconButton
              onClick={(e) => { e.stopPropagation(); setBgLocked4((v: any) => !v); if (!bgLocked4) setBgEdit4(false); }}
              sx={{
                position: "absolute",
                top: -5,
                right: -5,
                bgcolor: "black",
                color: "white",
                width: 28,
                height: 28,
                "&:hover": { bgcolor: bgLocked4 ? "#2e7d32" : "#d32f2f" },
              }}
            >
              {bgLocked4 ? <LockOutlined fontSize="small" /> : <LockOpenOutlined fontSize="small" />}
            </IconButton>
            {/* Small hint when locked */}
            {bgLocked4 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 6,
                  left: 6,
                  px: 1,
                  py: 0.5,
                  fontSize: 12,
                  bgcolor: "rgba(0,0,0,.55)",
                  color: "white",
                  borderRadius: 1,
                  pointerEvents: "none",
                }}
              >
                BG locked
              </Box>
            )}
          </Box>
        </Rnd>
      )}
      {/* selection switch */}
      <Paper
        elevation={2}
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          p: 1,
          px: 1.5,
          borderRadius: 2,
          display: "flex",
          gap: 1,
          alignItems: "center",
          zIndex: 20000,
        }}
      >
        <Chip size="small" label={selectionLabel} icon={selectedLocked ? <LockOutlined /> : <LockOpenOutlined />} variant="outlined" />
        <Switch size="small" checked={!selectedLocked} onChange={(_, checked) => setSelectedLocked(!checked ? true : false)} />
      </Paper>

      {/* ====== Free Texts ====== */}
      {!(multipleTextValue4 || showOneTextRightSideBox4) &&
        textElements4?.map((textElement) => {
          const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

          const hAlign =
            textElement.textAlign === "top"
              ? "flex-start"
              : textElement.textAlign === "end"
                ? "flex-end"
                : "center";
          const vAlign =
            textElement.verticalAlign === "top"
              ? "flex-start"
              : textElement.verticalAlign === "bottom"
                ? "flex-end"
                : "center";

          let touchStartTime = 0;
          let lastTap = 0;

          return (
            <Rnd
              key={textElement.id}
              cancel={textElement.isEditing ? ".no-drag, .text-edit" : ".no-drag"}
              enableUserSelectHack={false}
              enableResizing={{ bottomRight: true }}
              size={{ width: textElement.size.width, height: textElement.size.height }}
              position={{ x: textElement.position.x, y: textElement.position.y }}
              bounds="parent"
              style={{
                transform: `rotate(${textElement.rotation || 0}deg)`,
                zIndex: textElement.zIndex,
                display: "flex",
                alignItems: vAlign,
                justifyContent: hAlign,
                touchAction: "none",
                transition: "border 0.2s ease",
                cursor: textElement.isEditing ? "text" : "move",
              }}
              onDragStart={() => align.onDragStart()}
              onDrag={(_, d) => {
                const snap = align.onDrag(
                  d.x,
                  d.y,
                  textElement.size.width,
                  textElement.size.height,
                  alignItems,
                  `txt:${textElement.id}`
                );
                if (snap.snappedX || snap.snappedY) {
                  updateTextElement(textElement.id, {
                    position: { x: snap.x, y: snap.y },
                  });
                }
              }}
              onTouchStart={() => { touchStartTime = Date.now(); }}
              onTouchEnd={() => {
                const now = Date.now();
                const timeSince = now - lastTap;
                const touchDuration = now - touchStartTime;
                if (touchDuration < 200) {
                  if (timeSince < 300) {
                    setSelectedTextId4(textElement.id);
                    updateTextElement(textElement.id, { isEditing: true });
                  } else {
                    setSelectedTextId4(textElement.id);
                  }
                }
                lastTap = now;
              }}
              onMouseDown={() => setSelectedTextId4(textElement.id)}
              onDoubleClick={() => {
                setSelectedTextId4(textElement.id);
                updateTextElement(textElement.id, { isEditing: true });
              }}
              onDragStop={(_, d) => {
                const snap = align.onDrag(
                  d.x,
                  d.y,
                  textElement.size.width,
                  textElement.size.height,
                  alignItems,
                  `txt:${textElement.id}`
                );
                updateTextElement(textElement.id, { position: { x: snap.x, y: snap.y } });
                align.onDragStop();
              }}
              onResizeStop={(_, __, ref, ___, position) => {
                updateTextElement(textElement.id, {
                  size: { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) },
                  position: { x: position.x, y: position.y },
                });
              }}
              resizeHandleStyles={{
                bottomRight: {
                  width: isMobile ? "20px" : "12px",
                  height: isMobile ? "20px" : "12px",
                  background: "white",
                  border: "2px solid #1976d2",
                  borderRadius: "3px",
                  right: isMobile ? "-10px" : "-6px",
                  bottom: isMobile ? "-10px" : "-6px",
                  cursor: "se-resize",
                  zIndex: 999,
                  touchAction: "none",
                },
              }}
            >
              <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                {/* Delete */}
                <IconButton
                  size="small"
                  className="no-drag"
                  onClick={(e) => { e.stopPropagation(); deleteTextElement(textElement.id); }}
                  sx={{
                    position: "absolute", top: -10, right: -10, bgcolor: "#1976d2", color: "white",
                    width: isMobile ? 26 : 20, height: isMobile ? 26 : 20, "&:hover": { bgcolor: "#f44336" },
                    zIndex: 1, pointerEvents: "auto", touchAction: "auto",
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>

                {/* Rotate */}
                <IconButton
                  size="small"
                  className="no-drag"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTextElement(textElement.id, { rotation: (textElement.rotation || 0) + 30 });
                  }}
                  sx={{
                    position: "absolute", top: -10, left: -10, bgcolor: "#1976d2", color: "white",
                    width: isMobile ? 26 : 20, height: isMobile ? 26 : 20, "&:hover": { bgcolor: "#f44336" },
                    zIndex: 3000, pointerEvents: "auto", touchAction: "auto",
                  }}
                >
                  <Forward30 fontSize={isMobile ? "medium" : "small"} />
                </IconButton>

                {/* Layer controls (use your global layerUpAny/layerDownAny) */}
                <Tooltip title="To Back">
                  <Box
                    className="no-drag"
                    onClick={(e) => { e.stopPropagation(); layerDown({ type: 'text', id: textElement.id }); }}
                    sx={{
                      position: "absolute", top: -25, left: 20, bgcolor: "black", color: "white",
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      p: isMobile ? "4px" : "2px", zIndex: 9999, cursor: "pointer", "&:hover": { bgcolor: "#333" },
                    }}
                  >
                    <KeyboardArrowDownOutlined fontSize={isMobile ? "medium" : "small"} />
                  </Box>
                </Tooltip>

                <Tooltip title="To Front">
                  <Box
                    className="no-drag"
                    onClick={(e) => { e.stopPropagation(); layerUp({ type: 'text', id: textElement.id }); }}
                    sx={{
                      position: "absolute", top: -25, left: 45, bgcolor: "black", color: "white",
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      p: isMobile ? "4px" : "2px", zIndex: 9999, cursor: "pointer", "&:hover": { bgcolor: "#333" },
                    }}
                  >
                    <KeyboardArrowUpOutlined fontSize={isMobile ? "medium" : "small"} />
                  </Box>
                </Tooltip>

                {/* Duplicate */}
                <Tooltip title="Duplicate text">
                  <IconButton
                    size="small"
                    className="no-drag"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateLayer('text', textElement.id);
                    }}
                    sx={{
                      position: "absolute", top: -25, left: 70, bgcolor: "black", color: "white",
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      p: isMobile ? "4px" : "2px", zIndex: 9999, cursor: "pointer", "&:hover": { bgcolor: "#333" },
                    }}
                  >
                    <ContentCopyOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Content: drag anywhere when NOT editing; click twice to edit */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: vAlign,
                    justifyContent: hAlign,
                    userSelect: "none",
                    touchAction: "none",
                    transform: `rotate(${textElement.rotation || 0}deg)`,
                    border: textElement.id === selectedTextId4 ? "2px solid #1976d2" : "1px dashed #4a7bd5",
                    zIndex: textElement.zIndex,
                    cursor: textElement.isEditing ? "text" : "move", // ✅ keep move cursor
                  }}
                  onDoubleClick={() => {
                    setSelectedTextId4(textElement.id);
                    updateTextElement(textElement.id, { isEditing: true });
                  }}
                >
                  <TextField
                    variant="standard"
                    value={textElement.value}
                    className="text-edit"         // ✅ used by cancel when editing
                    placeholder="Add Text"
                    multiline
                    fullWidth
                    tabIndex={0}
                    // autoFocus={textElement.id === selectedTextId1 && textElement.isEditing}
                    InputProps={{
                      readOnly: !textElement.isEditing,
                      disableUnderline: true,
                      style: {
                        fontSize: textElement.fontSize,
                        fontWeight: textElement.fontWeight,
                        color: textElement.fontColor || "#000",
                        fontFamily: textElement.fontFamily || "Arial",
                        lineHeight: textElement.lineHeight || 1.4,
                        letterSpacing: textElement.letterSpacing ? `${textElement.letterSpacing}px` : "0px",
                        padding: 0,
                        width: "100%",
                        display: "flex",
                        alignItems: vAlign,
                        justifyContent: hAlign,
                        // ✅ drag by default, only interact with text in edit mode
                        pointerEvents: textElement.isEditing ? "auto" : "none",
                      },
                    }}
                    onChange={(e) => updateTextElement(textElement.id, { value: e.target.value })}
                    onFocus={(e) => { e.stopPropagation(); updateTextElement(textElement.id, { isEditing: true }); }}
                    onBlur={(e) => { e.stopPropagation(); updateTextElement(textElement.id, { isEditing: false }); }}
                    sx={{
                      "& .MuiInputBase-input": { overflowY: "auto", textAlign: textElement.textAlign || "center" },
                    }}
                  />
                </Box>
              </Box>
            </Rnd>
          );
        })}

      {/* ====== Video QR ====== */}
      {selectedVideoUrl4 && (
        <Rnd
          cancel=".no-drag"
          position={{ x: qrPosition4.x, y: qrPosition4.y }}
          onDragStop={(_, d) => setQrPosition4((prev) => ({ ...prev, x: d.x, y: d.y, zIndex: qrPosition4.zIndex }))}
          bounds="parent"
          enableResizing={false}
          style={{ padding: "10px", zIndex: 999 }}
        >
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end", m: "auto", width: "100%", textAlign: "center", height: "100%", bottom: 0, flex: 1 }}>
              <Box component="img" src="/assets/images/video-qr-tips.png" sx={{ width: "100%", height: 200, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", top: 55, height: 10, width: 10, left: { md: 6, sm: 6, xs: 5 }, borderRadius: 2 }}>
                <QrGenerator url={selectedVideoUrl4} size={Math.min(qrPosition4.width, qrPosition4.height)} />
              </Box>
              <a href={selectedVideoUrl4} target="_blank" rel="noreferrer">
                <Typography sx={{ position: "absolute", top: 80, right: 15, zIndex: 9999, color: "black", fontSize: "10px", width: "105px" }}>
                  {`${selectedVideoUrl4.slice(0, 20)}.....`}
                </Typography>
              </a>
              <IconButton
                className="no-drag"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVideoUrl4(null);
                }}
                sx={{ position: "absolute", top: 0, right: 0, bgcolor: COLORS.black, color: COLORS.white, zIndex: 9999, "&:hover": { bgcolor: "red" } }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </motion.div>
        </Rnd>
      )}

      {/* ====== Audio QR ====== */}
      {selectedAudioUrl4 && (
        <Rnd
          cancel=".no-drag"
          position={{ x: qrAudioPosition4.x, y: qrAudioPosition4.y }}
          onDragStop={(_, d) => setQrAudioPosition4((prev) => ({ ...prev, x: d.x, y: d.y, zIndex: qrAudioPosition4.zIndex }))}
          bounds="parent"
          enableResizing={false}
          style={{ padding: "10px", zIndex: 999 }}
        >
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end", m: "auto", width: "100%", textAlign: "center", height: "100%", bottom: 0, flex: 1 }}>
              <Box component="img" src="/assets/images/audio-qr-tips.png" sx={{ width: "100%", height: 200, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", top: 55, height: 10, width: 10, left: { md: 6, sm: 6, xs: 5 }, borderRadius: 2 }}>
                <QrGenerator url={selectedAudioUrl4} size={Math.min(qrAudioPosition4.width, qrAudioPosition4.height)} />
              </Box>
              <a href={selectedAudioUrl4} target="_blank" rel="noreferrer">
                <Typography sx={{ position: "absolute", top: 78, right: 15, zIndex: 9999, color: "black", fontSize: "10px", width: "105px" }}>
                  {`${selectedAudioUrl4.slice(0, 20)}.....`}
                </Typography>
              </a>
              <IconButton onClick={() => setSelectedAudioUrl4(null)} className="no-drag" sx={{ position: "absolute", top: 0, right: 0, bgcolor: COLORS.black, color: COLORS.white, "&:hover": { bgcolor: "red" } }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </motion.div>
        </Rnd>
      )}

      {/* ====== User Images (with lock, z-index, rotate, delete) ====== */}
      {draggableImages4
        .filter((img: any) => selectedImg4.includes(img.id))
        .map(({ id, src, x, y, width, height, zIndex, rotation = 0, filter, locked }: any) => {
          const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
          const isSelected = selectedShapeImageId4 === id;
          const isLocked = !!locked;

          return (
            <Rnd
              key={id}
              size={{ width, height }}
              position={{ x, y }}
              bounds="parent"
              enableUserSelectHack={false}
              cancel=".non-draggable"
              disableDragging={isLocked}
              enableResizing={isLocked ? false : { bottomRight: true }}
              onDragStart={() => align.onDragStart()}
              onDrag={(_, d) => {
                if (isLocked) return;
                const snap = align.onDrag(d.x, d.y, width, height, alignItems, `img:${id}`);
                if (snap.snappedX || snap.snappedY) {
                  setDraggableImages4((prev) =>
                    prev.map((img) => (img.id === id ? { ...img, x: snap.x, y: snap.y } : img))
                  );
                }
              }}
              onDragStop={(_, d) => {
                if (isLocked) return;
                const snap = align.onDrag(d.x, d.y, width, height, alignItems, `img:${id}`);
                setDraggableImages4((prev) =>
                  prev.map((img) => (img.id === id ? { ...img, x: snap.x, y: snap.y } : img))
                );
                align.onDragStop();
              }}
              onResizeStop={(_, __, ref, ___, position) => {
                if (isLocked) return;
                const newWidth = parseInt(ref.style.width);
                const newHeight = parseInt(ref.style.height);
                setDraggableImages4((prev) =>
                  prev.map((img) => (img.id === id ? { ...img, width: newWidth, height: newHeight, x: position.x, y: position.y } : img))
                );
              }}
              style={{
                zIndex: zIndex || 1,
                boxSizing: "border-box",
                borderRadius: 8,
                touchAction: "none",
                outline: isSelected ? "2px solid #1976d2" : "none",
                opacity: isLocked ? 0.9 : 1,
              }}
              onClick={() => setSelectedShapeImageId4(id)}
              resizeHandleStyles={{
                bottomRight: {
                  width: isMobile ? "20px" : "10px",
                  height: isMobile ? "20px" : "10px",
                  background: "white",
                  border: "1px solid #1976d2",
                  borderRadius: "10%",
                  right: isMobile ? "-10px" : "-5px",
                  bottom: isMobile ? "-10px" : "-5px",
                },
              }}
            >
              <Box sx={{ position: "relative", width: "100%", height: "100%", overflow: "visible", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    border: "2px solid #1976d2",
                    outline: isSelected ? "2px solid #cf57ffff" : "none",
                    borderRadius: isSelected ? 1 : 0,
                    pointerEvents: "auto",
                    cursor: isLocked ? "default" : "move",
                  }}
                  onMouseDown={() => setSelectedShapeImageId4(id)}
                >
                  <img
                    src={src}
                    alt="Uploaded"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 8,
                      pointerEvents: "none",
                      objectFit: "fill",
                      filter: filter || "none",
                      zIndex: zIndex,
                      clipPath: ((): string => {
                        const me = draggableImages4.find((img) => img.id === id);
                        return me?.shapePath || "none";
                      })(),
                    }}
                  />
                </Box>

                {!isLocked && (
                  <Box
                    className="non-draggable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraggableImages4((prev) => prev.map((img) => (img.id === id ? { ...img, rotation: (img.rotation || 0) + 15 } : img)));
                    }}
                    sx={{
                      position: "absolute",
                      top: -25,
                      left: -5,
                      bgcolor: "black",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: isMobile ? "4px" : "2px",
                      zIndex: 9999,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#333" },
                    }}
                  >
                    <Forward30 fontSize={isMobile ? "medium" : "small"} />
                  </Box>
                )}

                {!isLocked && (
                  <>
                    <Tooltip title="To Back">
                      <Box
                        className="non-draggable"
                        onClick={(e) => {
                          e.stopPropagation();
                          layerDown(id);
                        }}
                        sx={{
                          position: "absolute",
                          top: -25,
                          left: 20,
                          bgcolor: "black",
                          color: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: isMobile ? "4px" : "2px",
                          zIndex: 9999,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#333" },
                        }}
                      >
                        <KeyboardArrowDownOutlined fontSize={isMobile ? "medium" : "small"} />
                      </Box>
                    </Tooltip>

                    <Tooltip title="To Front">
                      <Box
                        className="non-draggable"
                        onClick={(e) => {
                          e.stopPropagation();
                          layerUp(id);
                        }}
                        sx={{
                          position: "absolute",
                          top: -25,
                          left: 45,
                          bgcolor: "black",
                          color: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: isMobile ? "4px" : "2px",
                          zIndex: 9999,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#333" },
                        }}
                      >
                        <KeyboardArrowUpOutlined fontSize={isMobile ? "medium" : "small"} />
                      </Box>
                    </Tooltip>
                  </>
                )}

                {/* Duplicate Image Button */}
                {!isLocked && (
                  <Tooltip title="Duplicate">
                    <Box
                      className="non-draggable"
                      onClick={(e) => {
                        e.stopPropagation();

                        const original = draggableImages4.find((img) => img.id === id);
                        if (!original) return;

                        const duplicate = {
                          ...original,
                          id: `img-dup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                          x: original.x + 40,
                          y: original.y + 30,
                          zIndex: (original.zIndex || 1) + 5,
                        };

                        setDraggableImages4((prev) => [...prev, duplicate]);
                        setSelectedShapeImageId4(duplicate.id);
                        setSelectedImage4((prev: any) => [...prev, duplicate.id]); // ← yeh line important hai (filter ke liye)
                      }}
                      sx={{
                        position: "absolute",
                        top: -25,
                        left: 70,
                        bgcolor: COLORS.black,
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        zIndex: 10000,
                        cursor: "pointer",
                        "&:hover": { bgcolor: COLORS.gray },
                      }}
                    >
                      <ContentCopyOutlined fontSize="small" />
                    </Box>
                  </Tooltip>
                )}


                {!isLocked && (
                  <Box
                    className="non-draggable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage4((prev) => prev.filter((i) => i !== id));
                      setDraggableImages4((prev) => prev.filter((img) => img.id !== id));
                      setActiveFilterImageId4(null);
                      setImageFilter4(false);
                    }}
                    sx={{
                      position: "absolute",
                      top: -25,
                      right: -5,
                      bgcolor: "black",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: isMobile ? "4px" : "2px",
                      zIndex: 9999,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#333" },
                    }}
                  >
                    <Close fontSize={isMobile ? "medium" : "small"} />
                  </Box>
                )}
              </Box>
            </Rnd>
          );
        })}

      {/* ====== One Text Layout ====== */}
      {showOneTextRightSideBox4 && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: { md: "675px", sm: "575px", xs: "575px" },
            width: { md: "470px", sm: "370px", xs: "90%" },
            border: "3px dashed #3a7bd5",
            position: "absolute",
            bgcolor: "#6183cc36",
            p: 1,
            top: 10,
          }}
        >
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: "35px",
              height: "35px",
              p: 1,
              bgcolor: COLORS.primary,
              color: "white",
              border: "1px solid #ccc",
              "&:hover": { bgcolor: "#f44336", color: "white" },
              zIndex: 5,
            }}
            onClick={() => {
              setOneTextValue4("");
              setShowOneTextRightSideBox4(false);
              setSelectedLayout4("blank");
            }}
          >
            <Close />
          </IconButton>
          <Box
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: verticalAlign4 === "top" ? "flex-start" : verticalAlign4 === "center" ? "center" : "flex-end",
              alignItems: textAlign4 === "start" ? "flex-start" : textAlign4 === "center" ? "center" : "flex-end",
            }}
          >
            <TextField
              variant="standard"
              value={oneTextValue4}
              onChange={(e) => setOneTextValue4(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: {
                  "& .MuiInputBase-input": {
                    fontSize: fontSize4,
                    fontWeight: fontWeight4,
                    color: fontColor4,
                    fontFamily: fontFamily4,
                    textAlign: textAlign4,
                    transform: `rotate(${rotation4}deg)`,
                    lineHeight: lineHeight4,
                    letterSpacing: letterSpacing4,
                    height: 200,
                  },
                },
              }}
              autoFocus
              multiline
              fullWidth
            />
          </Box>
        </Box>
      )}

      {/* ====== Multi Text Layout ====== */}
      {multipleTextValue4 && (
        <Box
          sx={{
            height: "98%",
            width: { md: "475px", sm: "375px", xs: "90%" },
            borderRadius: "6px",
            p: 1,
            position: "absolute",
            top: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {texts4.map((textObj, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                height: { md: "210px", sm: "180px", xs: "180px" },
                width: "100%",
                mb: 2,
                border: "3px dashed #3a7bd5",
                borderRadius: "6px",
                justifyContent: "center",
                display: "flex",
                alignItems: verticalAlign4 === "top" ? "flex-start" : verticalAlign4 === "center" ? "center" : "flex-end",
              }}
            >
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: "28px",
                  height: "28px",
                  bgcolor: COLORS.primary,
                  color: "white",
                  border: "1px solid #ccc",
                  "&:hover": { bgcolor: "#f44336", color: "white" },
                  zIndex: 5,
                }}
                onClick={() => {
                  setTexts4((prev) => {
                    const updated = prev.filter((_, i) => i !== index);
                    if (updated.length === 0) {
                      setMultipleTextValue4(false);
                      setSelectedLayout4("blank");
                    }
                    return updated;
                  });
                }}
              >
                <Close />
              </IconButton>

              {editingIndex4 === index ? (
                <TextField
                  autoFocus
                  fullWidth
                  multiline
                  variant="standard"
                  value={textObj.value}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setTexts4((prev) =>
                      prev.map((t, i) =>
                        i === index ? { ...t, value: newValue, textAlign: textAlign4, verticalAlign: verticalAlign4 } : t
                      )
                    );
                  }}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      "& textarea": {
                        width: "100%",
                        resize: "none",
                        height: "100px",
                        fontSize: textObj.fontSize1,
                        fontWeight: textObj.fontWeight1,
                        color: textObj.fontColor1,
                        fontFamily: textObj.fontFamily1,
                        textAlign: textObj.textAlign,
                        lineHeight: textObj.lineHeight,
                        letterSpacing: textObj.letterSpacing,
                      },
                    },
                  }}
                />
              ) : (
                <Box
                  onClick={() => {
                    if (editingIndex4 !== null) {
                      setTexts4((prev) =>
                        prev.map((t, i) => (i === editingIndex4 ? { ...t, textAlign: textAlign4, verticalAlign: verticalAlign4 } : t))
                      );
                    }
                    setEditingIndex4(index);
                    setFontSize4(textObj.fontSize1);
                    setFontFamily4(textObj.fontFamily1);
                    setFontWeight4(textObj.fontWeight1);
                    setFontColor4(textObj.fontColor1);
                    setTextAlign4(textObj.textAlign);
                    setVerticalAlign4(textObj.verticalAlign);
                  }}
                  sx={{ width: "100%", height: "100%", cursor: "pointer" }}
                >
                  <Typography
                    sx={{
                      fontSize: textObj.fontSize1,
                      fontWeight: textObj.fontWeight1,
                      color: textObj.fontColor1,
                      fontFamily: textObj.fontFamily1,
                      textAlign: textObj.textAlign,
                      lineHeight: textObj.lineHeight,
                      letterSpacing: textObj.letterSpacing,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: textObj.verticalAlign === "top" ? "flex-start" : textObj.verticalAlign === "bottom" ? "flex-end" : "center",
                      justifyContent: textObj.textAlign === "left" ? "flex-start" : textObj.textAlign === "right" ? "flex-end" : "center",
                    }}
                  >
                    {textObj.value.length === 0 ? <TitleOutlined sx={{ alignSelf: "center", color: "gray" }} /> : null} {textObj.value}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* ====== AI Image ====== */}
      {isAIimage4 && (
        <Rnd
          size={{ width: aimage4.width, height: aimage4.height }}
          position={{ x: aimage4.x, y: aimage4.y }}
          onDragStart={() => align.onDragStart()}
          onDrag={(_, d) => {
            const snap = align.onDrag(
              d.x,
              d.y,
              aimage4.width,
              aimage4.height,
              alignItems,
              "ai:4"
            );
            if (snap.snappedX || snap.snappedY) {
              setAIImage4((prev) => ({ ...prev, x: snap.x, y: snap.y }));
            }
          }}
          onDragStop={(_, d) => {
            const snap = align.onDrag(
              d.x,
              d.y,
              aimage4.width,
              aimage4.height,
              alignItems,
              "ai:4"
            );
            setAIImage4((prev) => ({ ...prev, x: snap.x, y: snap.y }));
            align.onDragStop();
          }}
          onResizeStop={(_, __, ref, ___, position) =>
            setAIImage4({ width: parseInt(ref.style.width), height: parseInt(ref.style.height), x: position.x, y: position.y })
          }
          bounds="parent"
          enableResizing={{ bottomRight: true }}
          resizeHandleStyles={{
            bottomRight: { width: "10px", height: "10px", background: "white", border: "2px solid #1976d2", borderRadius: "10%", right: "-5px", bottom: "-5px", cursor: "se-resize" },
          }}
          style={{ zIndex: 10, border: "2px solid #1976d2", display: "flex", alignItems: "stretch", justifyContent: "stretch" }}
        >
          <Box sx={{ position: "relative", width: "100%", height: "100%", display: "flex" }}>
            <Box component="img" src={`${selectedAIimageUrl4}`} alt="AI" sx={{ width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none" }} />
            <IconButton onClick={() => setIsAIimage4?.(false)} sx={{ position: "absolute", top: -7, right: -7, bgcolor: "black", color: "white", width: 22, height: 22, "&:hover": { bgcolor: "red" } }}>
              <Close />
            </IconButton>
          </Box>
        </Rnd>
      )}

      {/* ====== Stickers ====== */}
      {selectedStickers4?.map((sticker: any, index) => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const isSelected = selectedStickerIndex2 === index;
        const isLocked = !!sticker.locked;

        return (
          <Rnd
            key={sticker.id || index}
            size={{ width: sticker.width, height: sticker.height }}
            position={{ x: sticker.x, y: sticker.y }}
            bounds="parent"
            enableUserSelectHack={false}
            cancel=".non-draggable"
            disableDragging={isLocked}
            enableResizing={isLocked ? false : { bottomRight: true }}
            onMouseDown={() => setSelectedStickerIndex2(index)}
            onDragStart={() => align.onDragStart()}
            onDrag={(_, d) => {
              if (isLocked) return;
              const snap = align.onDrag(
                d.x,
                d.y,
                sticker.width,
                sticker.height,
                alignItems,
                `st:${sticker.id ?? index}`
              );
              if (snap.snappedX || snap.snappedY) {
                updateSticker4(index, { x: snap.x, y: snap.y, zIndex: sticker.zIndex });
              }
            }}
            onDragStop={(_, d) => {
              if (!isLocked) {
                const snap = align.onDrag(
                  d.x,
                  d.y,
                  sticker.width,
                  sticker.height,
                  alignItems,
                  `st:${sticker.id ?? index}`
                );
                updateSticker4(index, { x: snap.x, y: snap.y, zIndex: sticker.zIndex });
              }
              align.onDragStop();
            }}
            onResizeStop={(_, __, ref, ___, position) =>
              !isLocked && updateSticker4(index, { width: parseInt(ref.style.width), height: parseInt(ref.style.height), x: position.x, y: position.y, zIndex: sticker.zIndex })
            }
            resizeHandleStyles={{
              bottomRight: {
                width: isMobile ? "20px" : "10px",
                height: isMobile ? "20px" : "10px",
                background: "white",
                border: "2px solid #1976d2",
                borderRadius: "10%",
                right: isMobile ? "-10px" : "-5px",
                bottom: isMobile ? "-10px" : "-5px",
                cursor: "se-resize",
              },
            }}
            style={{ zIndex: sticker.zIndex, position: "absolute", touchAction: "none", outline: isSelected ? "2px solid #1976d2" : "none", opacity: isLocked ? 0.9 : 1 }}
          >
            <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
              <Box
                component="img"
                src={sticker.sticker}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: `rotate(${sticker.rotation || 0}deg)`,
                  transition: "transform 0.2s",
                  border: "1px solid #1976d2",
                  pointerEvents: "none",
                }}
              />

              {!isLocked && (
                <IconButton
                  className="non-draggable"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSticker4(index);
                    if (isSelected) setSelectedStickerIndex2(null);
                  }}
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -10,
                    bgcolor: "black",
                    color: "white",
                    p: isMobile ? 1.5 : 1,
                    width: isMobile ? 32 : 25,
                    height: isMobile ? 32 : 25,
                    zIndex: 9999,
                    "&:hover": { bgcolor: "red" },
                  }}
                >
                  <Close fontSize={isMobile ? "medium" : "small"} />
                </IconButton>
              )}

              {!isLocked && (
                <IconButton
                  className="non-draggable"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSticker4(index, { rotation: ((sticker.rotation || 0) + 15) % 360 });
                  }}
                  sx={{
                    position: "absolute",
                    top: -8,
                    left: -5,
                    bgcolor: "black",
                    color: "white",
                    p: isMobile ? 1.5 : 1,
                    width: isMobile ? 32 : 25,
                    height: isMobile ? 32 : 25,
                    zIndex: 9999,
                    "&:hover": { bgcolor: "blue" },
                  }}
                >
                  <Forward10 fontSize={isMobile ? "medium" : "small"} />
                </IconButton>
              )}
            </Box>
          </Rnd>
        );
      })}
    </Box>
  );
};

export default SlideLogo;
