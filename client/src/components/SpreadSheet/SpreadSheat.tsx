import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Chip, IconButton, Paper, Switch, TextField, Tooltip, Typography } from "@mui/material";
import {
  Close,
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
import { useSlide2 } from "../../context/Slide2Context";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import mergePreservePdf from "../../utils/mergePreservePdf";


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
  clipPath?: any,
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
  // const layout = slide.layout ?? {};
  const user = slide.user ?? {};
  const bg = slide.bg ?? {};
  const flags = slide.flags ?? {};
  const rect = bg?.rect ?? { x: 0, y: 0, width: 0, height: 0 };
  const bgEditable = bool(bg?.editable, false);       // default locked
  const bgLocked = bool(bg?.locked, !bgEditable);

  const out: LayoutNorm = { elements: [], stickers: [], textElements: [] };

  // bg frames (locked/editable)
  // out.elements.push(...(layout?.bgFrames?.locked ?? []).map((o: any, i: number) => toElement(o, i, false, "bg-locked")));
  // out.elements.push(...(layout?.bgFrames?.editable ?? []).map((o: any, i: number) => toElement(o, i, true, "bg-edit")));
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
  // out.stickers.push(...(layout?.stickers?.locked ?? []).map((o: any, i: number) => toSticker(o, i, false, "st-locked")));
  // out.stickers.push(...(layout?.stickers?.editable ?? []).map((o: any, i: number) => toSticker(o, i, true, "st-edit")));
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
  // out.textElements.push(...(layout?.staticText ?? []).map((o: any, i: number) => toText(o, i, !!o?.editable, "te")));
  out.textElements.push(...(slide.multipleTexts ?? []).map((o: any, i: number) => toText(o, i, !!o?.isEditable, "mte")));
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


// Helper function to create a new text element
const createNewTextElement = (defaults: any) => ({
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

interface SlideSpreadProps {
  textAlign?: "start" | "center" | "end";
  rotation?: number;
  togglePopup?: (name: string | null) => void;
  activePopup?: string | null;
  activeIndex?: number;
  addTextRight?: number;
  rightBox?: boolean;
  isAdminEditor?: boolean
}

const SlideSpread = ({
  activeIndex,
  addTextRight,
  rightBox,
  isAdminEditor
}: // togglePopup,
  SlideSpreadProps) => {
  const {
    images,
    selectedImg,
    setSelectedImage,
    showOneTextRightSideBox,
    oneTextValue,
    setOneTextValue,
    multipleTextValue,
    texts,
    editingIndex,
    setEditingIndex,
    fontSize,
    fontWeight,
    fontColor,
    textAlign,
    verticalAlign,
    rotation,
    setTexts,
    setShowOneTextRightSideBox,
    fontFamily,
    // New individual text management
    textElements,
    setTextElements,
    selectedTextId,
    setSelectedTextId,
    setMultipleTextValue,
    isSlideActive,
    setFontSize,
    setFontColor,
    setFontWeight,
    setFontFamily,
    setTextAlign,
    setVerticalAlign,
    selectedVideoUrl,
    setSelectedVideoUrl,
    selectedAudioUrl,
    setSelectedAudioUrl,
    draggableImages,
    setDraggableImages,
    qrPosition,
    setQrPosition,
    qrAudioPosition,
    setQrAudioPosition,
    isAIimage2,
    setIsAIimage2,
    selectedAIimageUrl2,
    selectedStickers2,
    updateSticker2,
    removeSticker2,
    aimage2,
    setAIImage2,
    setSelectedLayout,

    setImageFilter,
    setActiveFilterImageId,

    lineHeight2,
    letterSpacing2,
    layout2,
    setLayout2,

    bgColor2,
    bgImage2,
    setBgColor2,
    setBgImage2,
    bgEdit2,
    setBgEdit2,
    bgLocked2,
    setBgLocked2,
    bgRect2,
    setBgRect2,


    // selection helpers you already had for images/text
    selectedShapeImageId2,
    setSelectedShapeImageId2,
  } = useSlide2();

  console.log(layout2, '--')

  const [selectedBgIndex2, setSelectedBgIndex2] = useState<number | null>(null);

  const location = useLocation();
  const slide2 = location.state?.layout?.slides?.slide2 ?? null;


  useEffect(() => {
    if (!slide2) return;
    const norm = normalizeSlide(slide2);
    setBgColor2?.(norm.bgColor);
    setBgImage2?.(norm.bgImage);
    setLayout2(norm.layout);
  }, [slide2, setBgColor2, setBgImage2, setLayout2]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rightBoxRef = useRef<HTMLDivElement>(null);

  const [selectedStickerIndex2, setSelectedStickerIndex2] = useState<number | null>(null);


  const [uploadTarget, setUploadTarget] = useState<{ type: "bg" | "sticker"; index: number } | null>(null);

  /* ------------------ user upload handlers (editable only) ------------------ */
  const handleImageUploadClick = (type: "bg" | "sticker", index: number) => {
    if (type === "bg") setSelectedBgIndex2(index);
    setUploadTarget({ type, index });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setLayout2((prev: any) => {
        if (!prev) return prev;
        if (uploadTarget.type === "bg") {
          const elements = [...prev.elements];
          const el = elements[uploadTarget.index];
          if (!el?.isEditable) return prev;
          elements[uploadTarget.index] = { ...el, src: dataUrl };
          return { ...prev, elements };
        } else {
          const stickers = [...prev.stickers];
          const st = stickers[uploadTarget.index];
          if (!st?.isEditable) return prev;
          stickers[uploadTarget.index] = { ...st, sticker: dataUrl };
          return { ...prev, stickers };
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setUploadTarget(null);
  };


  /* ------------------ static text edit bindings (editable only) ------------------ */
  const handleTextChange = (newText: string, index: number) => {
    setLayout2((prev: any) => {
      const updated = [...prev.textElements];
      if (!updated[index]?.isEditable) return prev;
      updated[index] = {
        ...updated[index],
        text: newText,
      };
      return { ...prev, textElements: updated };
    });
  };

  const handleTextFocus = (index: number, te: any) => {
    if (!te?.isEditable) return;
    setEditingIndex(index);
    setFontSize(te.fontSize);
    setFontFamily(te.fontFamily);
    setFontColor(te.color);
    setFontWeight(te.fontWeight);
  };

  useEffect(() => {
    if (editingIndex == null) return;
    setLayout2((prev: any) => {
      if (!prev) return prev;
      const updated = [...prev.textElements];
      if (!updated[editingIndex]?.isEditable) return prev;
      updated[editingIndex] = {
        ...updated[editingIndex],
        fontSize, fontFamily, color: fontColor, fontWeight
      };
      return { ...prev, textElements: updated };
    });
  }, [fontSize, fontFamily, fontColor, fontWeight, editingIndex]);
  // Add this handler to initialize draggable state for images (omitted for brevity)
  useEffect(() => {
    if (images.length > 0) {
      setDraggableImages((prev: any[]) => {
        const existingIds = prev.map((img: any) => img.id);
        const newOnes = images
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

        const stillValid = prev.filter((img: any) =>
          images.some((incoming) => incoming.id === img.id)
        );

        const next = [...stillValid, ...newOnes];
        return mergePreservePdf(prev, next);
      });
    } else {
      setDraggableImages((prev: any[]) => mergePreservePdf(prev, []));
    }
  }, [images, setDraggableImages]);

  // Function to add new text element
  const addNewTextElement = () => {
    const newTextElement = createNewTextElement({
      fontSize: 16,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      textAlign: "center",
      rotation: 0,
      zIndex: textElements.length + 1,
    });
    setTextElements((prev) => [...prev, newTextElement]);
    setSelectedTextId(newTextElement.id);
  };

  // Add Texts in screen
  useEffect(() => {
    if (addTextRight) {
      addNewTextElement();
    }
  }, [addTextRight, addTextRight]);

  // Function to update individual text element
  const updateTextElement = (id: string, updates: Partial<any>) => {
    setTextElements((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updates } : text))
    );
  };

  // Function to delete text element
  const deleteTextElement = (id: string) => {
    setTextElements((prev) => prev.filter((text) => text.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  // 👇 Auto-reset multipleTextValue when all multiple texts are deleted
  useEffect(() => {
    // When user re-selects the multipleTextValue layout
    if (multipleTextValue) {
      // If no texts currently exist, recreate the 3 default boxes
      if (texts.length === 0) {
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
            letterSpacing: 0
          }));
        setTexts(defaultTexts);
      }
    }
  }, [multipleTextValue]);

  const handleDeleteBox = (index: number) => {
    setTexts((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      // ✅ If all boxes are deleted → reset layout
      if (updated.length === 0) {
        setMultipleTextValue(false);
        setSelectedLayout("blank");
      }

      return updated;
    });
  };


  // ✅ Place this useEffect HERE (below your state definitions)
  useEffect(() => {
    if (editingIndex !== null && editingIndex !== undefined) {
      setTexts((prev) =>
        prev.map((t, i) =>
          i === editingIndex
            ? {
              ...t,
              fontSize,
              fontWeight,
              fontColor,
              fontFamily,
              textAlign,
              verticalAlign,
            }
            : t
        )
      );
    }
  }, [fontSize, fontFamily, fontWeight, fontColor, textAlign, verticalAlign]);

  useEffect(() => {
    if (selectedVideoUrl) {
      setQrPosition((prev) => ({
        ...prev,
        url: selectedVideoUrl,
      }));
    }
  }, [selectedVideoUrl]);

  useEffect(() => {
    if (selectedAudioUrl) {
      setQrAudioPosition((prev) => ({
        ...prev,
        url: selectedAudioUrl,
      }));
    }
  }, [selectedAudioUrl]);


  // ---------------- SINGLE SWITCH LOGIC ----------------
  // figure out what's selected right now (priority order: free text > user image > sticker > bg)
  const currentSelection: any = useMemo(() => {
    if (selectedTextId) return { type: "text", id: selectedTextId };
    if (selectedShapeImageId2) return { type: "image", id: selectedShapeImageId2 };
    if (selectedStickerIndex2 !== null) return { type: "sticker", index: selectedStickerIndex2 };
    if (selectedBgIndex2 !== null) return { type: "bg", index: selectedBgIndex2 };
    return null;
  }, [selectedTextId, selectedShapeImageId2, selectedStickerIndex2]);

  const getSelectedLocked = (): boolean => {
    if (!currentSelection) return false;
    // if (currentSelection.type === "text") {
    //   const t: any = textElements1.find((x) => x.id === currentSelection.id);
    //   return !!t?.locked;
    // }
    if (currentSelection.type === "image") {
      const i: any = draggableImages.find((x) => x.id === currentSelection.id);
      return !!i?.locked;
    }
    if (currentSelection.type === "sticker") {
      const s: any = selectedStickers2?.[currentSelection.index];
      return !!s?.locked;
    }
    return false;
  };

  const setSelectedLocked = (locked: any) => {
    if (!currentSelection) return;
    if (currentSelection.type === "text") {
      setTextElements((prev) =>
        prev.map((t) => (t.id === currentSelection.id ? { ...t, locked } : t))
      );
      // also drop edit state if locking
      if (locked) setSelectedTextId(null);
      return;
    }
    if (currentSelection.type === "image") {
      setDraggableImages((prev) =>
        prev.map((img) => (img.id === currentSelection.id ? { ...img, locked } : img))
      );
      if (locked) setSelectedShapeImageId2(null);
      return;
    }
    if (currentSelection.type === "sticker") {
      const i = currentSelection.index;
      if (i != null) {
        // updateSticker1 lets us patch the object
        updateSticker2(i, { locked } as any);
        if (locked) setSelectedStickerIndex2(null);
      }
      return;
    }
    // if (currentSelection.type === "bg") {
    //   const index = currentSelection.index;
    //   setLayout1((prev: any) => {
    //     if (!prev?.elements) return prev;
    //     const elements = [...prev.elements];
    //     elements[index] = { ...elements[index], locked };
    //     return { ...prev, elements };
    //   });
    //   if (locked) setSelectedBgIndex2(null);
    //   return;
    // }
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
      case "bg":
        return "BG Frame";
      default:
        return "";
    }
  }, [currentSelection]);

  const selectedLocked = getSelectedLocked();


  // ---------------- Z-Index helpers for images ----------------
  const normalizeZ = (arr: any[]) =>
    [...arr]
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
      .map((item, i) => ({ ...item, zIndex: i + 1 }));

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
    setDraggableImages((prev) => {
      const withZ = normalizeZ(prev);
      const me = withZ.find((x) => x.id === id);
      if (!me) return prev;
      const higher = withZ
        .filter((x) => (x.zIndex ?? 0) > (me.zIndex ?? 0))
        .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))[0];
      if (!higher) return prev;
      return swapZ(withZ, me.id, higher.id);
    });
  };

  const layerDown = (id: any) => {
    setDraggableImages((prev) => {
      const withZ = normalizeZ(prev);
      const me = withZ.find((x) => x.id === id);
      if (!me) return prev;
      const lower = withZ
        .filter((x) => (x.zIndex ?? 0) < (me.zIndex ?? 0))
        .sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))[0];
      if (!lower) return prev;
      return swapZ(withZ, me.id, lower.id);
    });
  };



  const placerRef = useRef<HTMLDivElement | null>(null);

  // Esc closes edit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBgEdit2(false);
      if (e.key.toLowerCase() === "l") setBgLocked2((v: any) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Outside click closes edit
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!bgEdit2) return;
      if (!placerRef.current) return;
      if (!placerRef.current.contains(e.target as Node)) setBgEdit2(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [bgEdit2]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: "5px",
        position: "relative",
      }}
    >
      {activeIndex === 1 && rightBox && (
        <Box
          ref={rightBoxRef}
          sx={{
            flex: 1,
            zIndex: 10,
            p: 2,
            position: "relative",
            height: "700px",
            opacity: isSlideActive ? 1 : 0.6,
            pointerEvents: isSlideActive ? "auto" : "none",
            backgroundColor: bgColor2 ?? "transparent",
            // backgroundImage: bgImage2 ? `url(${bgImage2})` : "none",
            backgroundSize: 'cover',
            "&::after": !isSlideActive
              ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(146, 145, 145, 0.51)",
                zIndex: 1000,
                pointerEvents: "none",
              }
              : {},
          }}
        >

          {/* BG */}
          {isAdminEditor && bgImage2 && (
            <Rnd
              size={{ width: bgRect2.width, height: bgRect2.height }}
              position={{ x: bgRect2.x, y: bgRect2.y }}
              bounds="parent"
              enableUserSelectHack={false}
              // ✅ only draggable when unlocked AND in edit mode
              disableDragging={!bgEdit2 || bgLocked2}
              // ✅ only resizable when unlocked AND in edit mode
              enableResizing={
                bgEdit2 && !bgLocked2
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
              onDragStop={(_, d) => setBgRect2((r: any) => ({ ...r, x: d.x, y: d.y }))}
              onResizeStop={(_, __, ref, ___, position) =>
                setBgRect2({
                  x: position.x,
                  y: position.y,
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                })
              }
              style={{
                zIndex: 1,
                outline: bgEdit2 && !bgLocked2 ? "2px solid #1976d2" : "none",
                cursor: bgEdit2 && !bgLocked2 ? "move" : "default",
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
                  pointerEvents: bgEdit2 && !bgLocked2 ? "auto" : "none",
                },
              }}
            >
              <Box
                ref={placerRef}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  backgroundColor: bgImage2 ? "transparent" : bgColor2 ?? "transparent",
                  backgroundImage: bgImage2 ? `url(${bgImage2})` : "none",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  userSelect: "none",
                }}
                // ✅ double-click only works when unlocked
                onDoubleClick={() => {
                  if (!bgLocked2) setBgEdit2(true);
                }}
              >
                {/* Lock/Unlock toggle (top-left) */}
                <IconButton
                  onClick={(e) => { e.stopPropagation(); setBgLocked2((v: any) => !v); if (!bgLocked2) setBgEdit2(false); }}
                  sx={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    bgcolor: "black",
                    color: "white",
                    width: 28,
                    height: 28,
                    "&:hover": { bgcolor: bgLocked2 ? "#2e7d32" : "#d32f2f" },
                  }}
                >
                  {bgLocked2 ? <LockOutlined fontSize="small" /> : <LockOpenOutlined fontSize="small" />}
                </IconButton>
                {/* Small hint when locked */}
                {bgLocked2 && (
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

          {/* 🎚 Single selection-based switch (admin only) */}
          {isAdminEditor && (
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
              <Chip
                size="small"
                label={selectionLabel}
                icon={selectedLocked ? <LockOutlined /> : <LockOpenOutlined />}
                variant="outlined"
              />
              <Switch
                size="small"
                checked={!selectedLocked}
                onChange={(_, checked) => setSelectedLocked(!checked ? true : false)}
              />
            </Paper>
          )}


          {/* ================================================== Admin Editor ========================================  */}
          {isAdminEditor ? (
            <>
              {
                multipleTextValue || showOneTextRightSideBox ? null : (
                  <>
                    {textElements?.map((textElement) => {
                      const isMobile =
                        typeof window !== "undefined" && window.innerWidth < 768;

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
                          cancel=".no-drag"
                          dragHandleClassName="drag-area"
                          enableUserSelectHack={false}
                          enableResizing={{
                            bottomRight: true,
                          }}
                          size={{
                            width: textElement.size.width,
                            height: textElement.size.height,
                          }}
                          position={{
                            x: textElement.position.x,
                            y: textElement.position.y,
                          }}
                          bounds="parent"
                          style={{
                            transform: `rotate(${textElement.rotation || 0}deg)`,
                            zIndex: textElement.zIndex,
                            display: "flex",
                            alignItems: vAlign,
                            justifyContent: hAlign,
                            touchAction: "none",
                            transition: "border 0.2s ease",
                          }}
                          onTouchStart={() => {
                            touchStartTime = Date.now();
                          }}
                          onTouchEnd={() => {
                            const now = Date.now();
                            const timeSince = now - lastTap;
                            const touchDuration = now - touchStartTime;

                            if (touchDuration < 200) {
                              if (timeSince < 300) {
                                // Double tap = edit
                                setSelectedTextId(textElement.id);
                                updateTextElement(textElement.id, { isEditing: true });
                              } else {
                                // Single tap = select
                                setSelectedTextId(textElement.id);
                                updateTextElement(textElement.id, { isEditing: false });
                              }
                            }
                            lastTap = now;
                          }}
                          onMouseDown={() => {
                            // Desktop: select on click
                            setSelectedTextId(textElement.id);
                          }}
                          onClick={() => {
                            // Desktop: edit on double-click
                            setSelectedTextId(textElement.id);
                            updateTextElement(textElement.id, { isEditing: true });
                          }}
                          onDragStop={(_, d) => {
                            updateTextElement(textElement.id, {
                              position: { x: d.x, y: d.y },
                              zIndex: 2001,
                            });
                          }}
                          onResizeStop={(_, __, ref, ___, position) => {
                            updateTextElement(textElement.id, {
                              size: {
                                width: parseInt(ref.style.width, 10),
                                height: parseInt(ref.style.height, 10),
                              },
                              position: { x: position.x, y: position.y },
                              zIndex: 2001,
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
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            {/* ✅ Close Button */}
                            <IconButton
                              size="small"
                              className="no-drag"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTextElement(textElement.id);
                              }}
                              sx={{
                                position: "absolute",
                                top: -10,
                                right: -10,
                                bgcolor: "#1976d2",
                                color: "white",
                                width: isMobile ? 26 : 20,
                                height: isMobile ? 26 : 20,
                                "&:hover": { bgcolor: "#f44336" },
                                zIndex: 3000,
                                pointerEvents: "auto",
                                touchAction: "auto",
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>

                            {/* rotation Btn */}
                            <IconButton
                              size="small"
                              className="no-drag"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTextElement(textElement.id, {
                                  rotation: (textElement.rotation || 0) + 30,
                                });
                              }}
                              sx={{
                                position: "absolute",
                                top: -10,
                                left: -10,
                                bgcolor: "#1976d2",
                                color: "white",
                                width: isMobile ? 26 : 20,
                                height: isMobile ? 26 : 20,
                                "&:hover": { bgcolor: "#f44336" },
                                zIndex: 3000,
                                pointerEvents: "auto",
                                touchAction: "auto",
                              }}
                            >
                              <Forward30 fontSize={isMobile ? "medium" : "small"} />
                            </IconButton>
                            <Box
                              className="drag-area"
                              sx={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: vAlign,
                                justifyContent: hAlign,
                                cursor: textElement.isEditing ? "text" : "move",
                                userSelect: "none",
                                touchAction: "none",
                                transform: `rotate(${textElement.rotation || 0}deg)`,
                                border:
                                  textElement.id === selectedTextId
                                    ? "2px solid #1976d2"
                                    : "1px dashed #4a7bd5",
                                zIndex: textElement.zIndex
                              }}
                            >
                              {/* ✅ Editable Text */}
                              <TextField
                                variant="standard"
                                value={textElement.value}
                                className="no-drag"
                                placeholder="Add Text"
                                multiline
                                fullWidth
                                tabIndex={0}
                                autoFocus={textElement.id === selectedTextId ? true : false}
                                InputProps={{
                                  readOnly: !textElement.isEditing,
                                  disableUnderline: true,
                                  style: {
                                    fontSize: textElement.fontSize,
                                    fontWeight: textElement.fontWeight,
                                    color: textElement.fontColor || "#000",
                                    fontFamily: textElement.fontFamily || "Arial",
                                    // transform: `rotate(${textElement.rotation || 0}deg)`,
                                    lineHeight: textElement.lineHeight || 1.4,
                                    letterSpacing: textElement.letterSpacing
                                      ? `${textElement.letterSpacing}px`
                                      : "0px",
                                    padding: 0,
                                    width: "100%",
                                    display: "flex",
                                    alignItems: vAlign,
                                    justifyContent: hAlign,
                                    cursor: textElement.isEditing ? "text" : "pointer",
                                    transition: "all 0.2s ease",
                                  },
                                }}
                                onChange={(e) =>
                                  updateTextElement(textElement.id, { value: e.target.value })
                                }
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  updateTextElement(textElement.id, { isEditing: true });
                                }}
                                onBlur={(e) => {
                                  e.stopPropagation();
                                  updateTextElement(textElement.id, { isEditing: false });
                                }}
                                sx={{
                                  "& .MuiInputBase-input": {
                                    overflowY: "auto",
                                    textAlign: textElement.textAlign || "center",
                                  },
                                  pointerEvents: textElement.isEditing ? "auto" : "none",
                                }}
                              />
                            </Box>

                          </Box>
                        </Rnd>
                      );
                    })}
                  </>
                )
              }

              {/* VIDEO QR */}
              {selectedVideoUrl && (
                <Rnd
                  cancel=".no-drag"
                  position={{ x: qrPosition.x, y: qrPosition.y }}
                  onDragStop={(_, d) =>
                    setQrPosition((prev) => ({ ...prev, x: d.x, y: d.y, zIndex: qrPosition.zIndex }))
                  }
                  bounds="parent"
                  enableResizing={false}
                  style={{ padding: "10px", zIndex: 999 }}
                >
                  <motion.div
                    key={selectedVideoUrl}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        height: "100%",
                        bottom: 0,
                        flex: 1,
                      }}
                    >
                      <Box component={"img"} src="/assets/images/video-qr-tips.png" sx={{ width: "100%", height: 200, pointerEvents: "none" }} />
                      <Box sx={{ position: "absolute", top: 55, height: 10, width: 10, left: { md: 6, sm: 6, xs: 5 }, borderRadius: 2 }}>
                        <QrGenerator url={selectedVideoUrl} size={Math.min(qrPosition.width, qrPosition.height)} />
                      </Box>
                      <a href={`${selectedVideoUrl}`} target="_blank">
                        <Typography sx={{ position: "absolute", top: 80, right: 15, zIndex: 9999, color: "black", fontSize: "10px", width: "105px" }}>
                          {`${selectedVideoUrl.slice(0, 20)}.....`}
                        </Typography>
                      </a>
                      <IconButton
                        className="no-drag"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVideoUrl(null);
                        }}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bgcolor: COLORS.black,
                          color: COLORS.white,
                          zIndex: 9999,
                          "&:hover": { bgcolor: "red" },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </motion.div>
                </Rnd>
              )}

              {/* AUDIO QR */}
              {selectedAudioUrl && (
                <Rnd
                  cancel=".no-drag"
                  position={{ x: qrAudioPosition.x, y: qrAudioPosition.y }}
                  onDragStop={(_, d) =>
                    setQrAudioPosition((prev) => ({ ...prev, x: d.x, y: d.y, zIndex: qrAudioPosition.zIndex }))
                  }
                  bounds="parent"
                  enableResizing={false}
                  style={{ padding: "10px", zIndex: 999 }}
                >
                  <motion.div
                    key={selectedAudioUrl}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        height: "100%",
                        bottom: 0,
                        flex: 1,
                      }}
                    >
                      <Box component={"img"} src="/assets/images/audio-qr-tips.png" sx={{ width: "100%", height: 200, pointerEvents: "none" }} />
                      <Box sx={{ position: "absolute", top: 55, height: 10, width: 10, left: { md: 6, sm: 6, xs: 5 }, borderRadius: 2 }}>
                        <QrGenerator url={selectedAudioUrl} size={Math.min(qrAudioPosition.width, qrAudioPosition.height)} />
                      </Box>
                      <a href={`${selectedAudioUrl}`} target="_blank">
                        <Typography sx={{ position: "absolute", top: 78, right: 15, zIndex: 9999, color: "black", fontSize: "10px", width: "105px" }}>
                          {`${selectedAudioUrl.slice(0, 20)}.....`}
                        </Typography>
                      </a>
                      <IconButton
                        onClick={() => setSelectedAudioUrl(null)}
                        className="no-drag"
                        sx={{ position: "absolute", top: 0, right: 0, bgcolor: COLORS.black, color: COLORS.white, "&:hover": { bgcolor: "red" } }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </motion.div>
                </Rnd>
              )}

              {/* USER IMAGES (per-item lock) */}
              {draggableImages
                .filter((img: any) => selectedImg.includes(img.id))
                .map(({ id, src, x, y, width, height, zIndex, rotation = 0, filter, locked }: any) => {
                  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
                  const isSelected = selectedShapeImageId2 === id;
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
                      onDragStop={(_, d) => {
                        if (isLocked) return;
                        setDraggableImages((prev) =>
                          prev.map((img) => (img.id === id ? { ...img, x: d.x, y: d.y } : img))
                        );
                      }}
                      onResizeStop={(_, __, ref, ___, position) => {
                        if (isLocked) return;
                        const newWidth = parseInt(ref.style.width);
                        const newHeight = parseInt(ref.style.height);
                        setDraggableImages((prev) =>
                          prev.map((img) =>
                            img.id === id
                              ? { ...img, width: newWidth, height: newHeight, x: position.x, y: position.y }
                              : img
                          )
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
                      onClick={() => setSelectedShapeImageId2(id)}
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
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          overflow: "visible",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
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
                          onMouseDown={() => setSelectedShapeImageId2(id)}
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
                                const me = draggableImages.find((img) => img.id === id);
                                return me?.shapePath || "none";
                              })(),
                            }}
                          />
                        </Box>

                        {/* rotate */}
                        {!isLocked && (
                          <Box
                            className="non-draggable"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDraggableImages((prev) =>
                                prev.map((img) => (img.id === id ? { ...img, rotation: (img.rotation || 0) + 15 } : img))
                              );
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

                        {/* layer controls */}
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
                                  left: 40,
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
                                  left: 80,
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

                        {/* close */}
                        {!isLocked && (
                          <Box
                            className="non-draggable"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage((prev) => prev.filter((i) => i !== id));
                              setDraggableImages((prev) => prev.filter((img) => img.id !== id));
                              setActiveFilterImageId(null);
                              setImageFilter(false);
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

              {/* ONE TEXT BOX (unchanged) */}
              {showOneTextRightSideBox && (
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
                      setOneTextValue("");
                      if (typeof setShowOneTextRightSideBox === "function") {
                        setShowOneTextRightSideBox(false);
                        setSelectedLayout("blank");
                      }
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
                      justifyContent:
                        verticalAlign === "top"
                          ? "flex-start"
                          : verticalAlign === "center"
                            ? "center"
                            : "flex-end",
                      alignItems:
                        textAlign === "start"
                          ? "flex-start"
                          : textAlign === "center"
                            ? "center"
                            : "flex-end",
                    }}
                  >
                    <TextField
                      variant="standard"
                      value={oneTextValue}
                      onChange={(e) => setOneTextValue(e.target.value)}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          "& .MuiInputBase-input": {
                            fontSize: fontSize,
                            fontWeight: fontWeight,
                            color: fontColor,
                            fontFamily: fontFamily,
                            textAlign: textAlign,
                            transform: `rotate(${rotation}deg)`,
                            lineHeight: lineHeight2,
                            letterSpacing: letterSpacing2,
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

              {/* MULTI TEXT LAYOUT (unchanged behavior) */}
              {multipleTextValue && (
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
                  {texts?.map((textObj, index) => (
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
                        alignItems:
                          verticalAlign === "top"
                            ? "flex-start"
                            : verticalAlign === "center"
                              ? "center"
                              : "flex-end",
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
                          setTexts((prev) => {
                            const updated = prev.filter((_, i) => i !== index);
                            if (updated.length === 0) {
                              setMultipleTextValue(false);
                              setSelectedLayout("blank");
                            }
                            return updated;
                          });
                        }}
                      >
                        <Close />
                      </IconButton>

                      {editingIndex === index ? (
                        <TextField
                          autoFocus
                          fullWidth
                          multiline
                          variant="standard"
                          value={textObj.value}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setTexts((prev) =>
                              prev.map((t, i) =>
                                i === index
                                  ? {
                                    ...t,
                                    value: newValue,
                                    textAlign: textAlign,
                                    verticalAlign: verticalAlign,
                                  }
                                  : t
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
                            if (editingIndex !== null) {
                              setTexts((prev) =>
                                prev.map((t, i) =>
                                  i === editingIndex
                                    ? {
                                      ...t,
                                      textAlign: textAlign,
                                      verticalAlign: verticalAlign,
                                    }
                                    : t
                                )
                              );
                            }
                            setEditingIndex(index);
                            setFontSize(textObj.fontSize1);
                            setFontFamily(textObj.fontFamily1);
                            setFontWeight(textObj.fontWeight1);
                            setFontColor(textObj.fontColor1);
                            setTextAlign(textObj.textAlign);
                            setVerticalAlign(textObj.verticalAlign);
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
                              alignItems:
                                textObj.verticalAlign === "top"
                                  ? "flex-start"
                                  : textObj.verticalAlign === "bottom"
                                    ? "flex-end"
                                    : "center",
                              justifyContent:
                                textObj.textAlign === "left"
                                  ? "flex-start"
                                  : textObj.textAlign === "right"
                                    ? "flex-end"
                                    : "center",
                            }}
                          >
                            {textObj.value.length === 0 ? (
                              <TitleOutlined sx={{ alignSelf: "center", color: "gray" }} />
                            ) : null}{" "}
                            {textObj.value}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {/* AI IMAGE (kept as-is, not part of lock demo) */}
              {isAIimage2 && (
                <Rnd
                  size={{ width: aimage2.width, height: aimage2.height }}
                  position={{ x: aimage2.x, y: aimage2.y }}
                  onDragStop={(_, d) => setAIImage2((prev) => ({ ...prev, x: d.x, y: d.y }))}
                  onResizeStop={(_, __, ref, ___, position) =>
                    setAIImage2({
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                      x: position.x,
                      y: position.y,
                    })
                  }
                  bounds="parent"
                  enableResizing={{ bottomRight: true }}
                  resizeHandleStyles={{
                    bottomRight: {
                      width: "10px",
                      height: "10px",
                      background: "white",
                      border: "2px solid #1976d2",
                      borderRadius: "10%",
                      right: "-5px",
                      bottom: "-5px",
                      cursor: "se-resize",
                    },
                  }}
                  style={{
                    zIndex: 10,
                    border: "2px solid #1976d2",
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "stretch",
                  }}
                >
                  <Box sx={{ position: "relative", width: "100%", height: "100%", display: "flex" }}>
                    <Box component="img" src={`${selectedAIimageUrl2}`} alt="AI Image" sx={{ width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none" }} />
                    <IconButton
                      onClick={() => setIsAIimage2?.(false)}
                      sx={{ position: "absolute", top: -7, right: -7, bgcolor: "black", color: "white", width: 22, height: 22, "&:hover": { bgcolor: "red" } }}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                </Rnd>
              )}

              {/* STICKERS (per-item lock) */}
              {selectedStickers2?.map((sticker: any, index) => {
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
                    onDragStop={(_, d) =>
                      !isLocked &&
                      updateSticker2(index, {
                        x: d.x,
                        y: d.y,
                        zIndex: sticker.zIndex,
                      })
                    }
                    onResizeStop={(_, __, ref, ___, position) =>
                      !isLocked &&
                      updateSticker2(index, {
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                        x: position.x,
                        y: position.y,
                        zIndex: sticker.zIndex,
                      })
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
                    style={{
                      zIndex: sticker.zIndex,
                      position: "absolute",
                      touchAction: "none",
                      outline: isSelected ? "2px solid #1976d2" : "none",
                      opacity: isLocked ? 0.9 : 1,
                    }}
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

                      {/* delete */}
                      {!isLocked && (
                        <IconButton
                          className="non-draggable"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSticker2(index);
                            if (selectedStickerIndex2 === index) setSelectedStickerIndex2(null);
                          }}
                          sx={{
                            position: "absolute",
                            top: -isMobile ? -20 : -8,
                            right: -isMobile ? -20 : -10,
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

                      {/* rotate */}
                      {!isLocked && (
                        <IconButton
                          className="non-draggable"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSticker2(index, { rotation: ((sticker.rotation || 0) + 15) % 360 });
                          }}
                          sx={{
                            position: "absolute",
                            top: -isMobile ? -20 : -8,
                            left: -isMobile ? -20 : -5,
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
            </>
          ) :
            <>
              {
                layout2 &&
                <Box sx={{ width: "100%", height: "100%" }}>
                  {/* BG frames */}
                  {layout2.elements
                    ?.slice()
                    .sort((a: any, b: any) => (a.zIndex ?? 0) - (b.zIndex ?? 0)) // keep BG at the back (zIndex 0)
                    .map((el: any, index: number) => {
                      const isEditable = !!el.isEditable;  // <- comes from normalize
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
                          onClick={() => setSelectedBgIndex2(index)}
                        >
                          <Box
                            component="img"
                            src={el.src || undefined}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
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
                  {layout2.stickers.map((st: any, i: any) => (
                    <Box key={st.id ?? i}
                      sx={{ position: "absolute", left: st.x, top: st.y, zIndex: st.zIndex ?? 1, borderRadius: 1, overflow: "hidden" }}>
                      <Box component="img" src={st.sticker || undefined}
                        sx={{ width: st.width, height: st.height, objectFit: "contain", display: "block", pointerEvents: "none" }} />
                      {st.isEditable && (
                        <Box onClick={() => handleImageUploadClick("sticker", i)}
                          sx={{
                            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                            backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "50%", width: 36, height: 36,
                            display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid white", cursor: "pointer"
                          }}>
                          <UploadFileRounded sx={{ color: "white", fontSize: 18 }} />
                        </Box>
                      )}
                    </Box>
                  ))}

                  {/* Static text */}
                  {layout2.textElements?.map((te: any, index: number) => {
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
                          height: isActive ? 'auto' : te.height,
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
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </Box>
              }

              {
                multipleTextValue || showOneTextRightSideBox ? null : (
                  <>
                    {textElements.map((textElement) => {
                      const isMobile =
                        typeof window !== "undefined" && window.innerWidth < 768;

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
                          cancel=".no-drag"
                          dragHandleClassName="drag-area"
                          enableUserSelectHack={false}
                          enableResizing={{
                            bottomRight: true,
                          }}
                          size={{
                            width: textElement.size.width,
                            height: textElement.size.height,
                          }}
                          position={{
                            x: textElement.position.x,
                            y: textElement.position.y,
                          }}
                          bounds="parent"
                          style={{
                            transform: `rotate(${textElement.rotation || 0}deg)`,
                            zIndex: textElement.zIndex,
                            display: "flex",
                            alignItems: vAlign,
                            justifyContent: hAlign,
                            touchAction: "none",
                            transition: "border 0.2s ease",
                          }}
                          onTouchStart={() => {
                            touchStartTime = Date.now();
                          }}
                          onTouchEnd={() => {
                            const now = Date.now();
                            const timeSince = now - lastTap;
                            const touchDuration = now - touchStartTime;

                            if (touchDuration < 200) {
                              if (timeSince < 300) {
                                // Double tap = edit
                                setSelectedTextId(textElement.id);
                                updateTextElement(textElement.id, { isEditing: true });
                              } else {
                                // Single tap = select
                                setSelectedTextId(textElement.id);
                                updateTextElement(textElement.id, { isEditing: false });
                              }
                            }
                            lastTap = now;
                          }}
                          onMouseDown={() => {
                            // Desktop: select on click
                            setSelectedTextId(textElement.id);
                          }}
                          onClick={() => {
                            // Desktop: edit on double-click
                            setSelectedTextId(textElement.id);
                            updateTextElement(textElement.id, { isEditing: true });
                          }}
                          onDragStop={(_, d) => {
                            updateTextElement(textElement.id, {
                              position: { x: d.x, y: d.y },
                              zIndex: 2001,
                            });
                          }}
                          onResizeStop={(_, __, ref, ___, position) => {
                            updateTextElement(textElement.id, {
                              size: {
                                width: parseInt(ref.style.width, 10),
                                height: parseInt(ref.style.height, 10),
                              },
                              position: { x: position.x, y: position.y },
                              zIndex: 2001,
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
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            {/* ✅ Close Button */}
                            <IconButton
                              size="small"
                              className="no-drag"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTextElement(textElement.id);
                              }}
                              sx={{
                                position: "absolute",
                                top: -10,
                                right: -10,
                                bgcolor: "#1976d2",
                                color: "white",
                                width: isMobile ? 26 : 20,
                                height: isMobile ? 26 : 20,
                                "&:hover": { bgcolor: "#f44336" },
                                zIndex: 3000,
                                pointerEvents: "auto",
                                touchAction: "auto",
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>

                            {/* rotation Btn */}
                            <IconButton
                              size="small"
                              className="no-drag"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTextElement(textElement.id, {
                                  rotation: (textElement.rotation || 0) + 30,
                                });
                              }}
                              sx={{
                                position: "absolute",
                                top: -10,
                                left: -10,
                                bgcolor: "#1976d2",
                                color: "white",
                                width: isMobile ? 26 : 20,
                                height: isMobile ? 26 : 20,
                                "&:hover": { bgcolor: "#f44336" },
                                zIndex: 3000,
                                pointerEvents: "auto",
                                touchAction: "auto",
                              }}
                            >
                              <Forward30 fontSize={isMobile ? "medium" : "small"} />
                            </IconButton>
                            <Box
                              className="drag-area"
                              sx={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: vAlign,
                                justifyContent: hAlign,
                                cursor: textElement.isEditing ? "text" : "move",
                                userSelect: "none",
                                touchAction: "none",
                                transform: `rotate(${textElement.rotation || 0}deg)`,
                                border:
                                  textElement.id === selectedTextId
                                    ? "2px solid #1976d2"
                                    : "1px dashed #4a7bd5",
                                zIndex: textElement.zIndex
                              }}
                            >
                              {/* ✅ Editable Text */}
                              <TextField
                                variant="standard"
                                value={textElement.value}
                                className="no-drag"
                                placeholder="Add Text"
                                multiline
                                fullWidth
                                tabIndex={0}
                                autoFocus={textElement.id === selectedTextId ? true : false}
                                InputProps={{
                                  readOnly: !textElement.isEditing,
                                  disableUnderline: true,
                                  style: {
                                    fontSize: textElement.fontSize,
                                    fontWeight: textElement.fontWeight,
                                    color: textElement.fontColor || "#000",
                                    fontFamily: textElement.fontFamily || "Arial",
                                    // transform: `rotate(${textElement.rotation || 0}deg)`,
                                    lineHeight: textElement.lineHeight || 1.4,
                                    letterSpacing: textElement.letterSpacing
                                      ? `${textElement.letterSpacing}px`
                                      : "0px",
                                    padding: 0,
                                    width: "100%",
                                    display: "flex",
                                    alignItems: vAlign,
                                    justifyContent: hAlign,
                                    cursor: textElement.isEditing ? "text" : "pointer",
                                    transition: "all 0.2s ease",
                                  },
                                }}
                                onChange={(e) =>
                                  updateTextElement(textElement.id, { value: e.target.value })
                                }
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  updateTextElement(textElement.id, { isEditing: true });
                                }}
                                onBlur={(e) => {
                                  e.stopPropagation();
                                  updateTextElement(textElement.id, { isEditing: false });
                                }}
                                sx={{
                                  "& .MuiInputBase-input": {
                                    overflowY: "auto",
                                    textAlign: textElement.textAlign || "center",
                                  },
                                  pointerEvents: textElement.isEditing ? "auto" : "none",
                                }}
                              />
                            </Box>

                          </Box>
                        </Rnd>
                      );
                    })}
                  </>
                )
              }

              {selectedVideoUrl && (
                <Rnd
                  cancel=".no-drag"
                  position={{ x: qrPosition.x, y: qrPosition.y }}
                  onDragStop={(_, d) =>
                    setQrPosition((prev) => ({
                      ...prev,
                      x: d.x,
                      y: d.y,
                      zIndex: qrPosition.zIndex,
                    }))
                  }
                  onResizeStop={(_, __, ref, ___, position) => {
                    setQrPosition((prev) => ({
                      ...prev,
                      width: parseInt(ref.style.width, 10),
                      height: parseInt(ref.style.height, 10),
                      x: position.x,
                      y: position.y,
                      zIndex: qrPosition.zIndex,
                    }));
                  }}
                  bounds="parent"
                  enableResizing={false}
                  style={{
                    padding: "10px",
                    zIndex: 999
                  }}
                >
                  <motion.div
                    key={selectedVideoUrl}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        height: "100%",
                        bottom: 0,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/video-qr-tips.png"
                        sx={{
                          width: '100%',
                          height: 200,
                          position: "relative",
                          pointerEvents: "none",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 55,
                          height: 10,
                          width: 10,
                          left: { md: 7, sm: 7, xs: 5 },
                          borderRadius: 2,
                        }}
                      >
                        <QrGenerator
                          url={selectedVideoUrl}
                          size={Math.min(qrPosition.width, qrPosition.height)}
                        />
                      </Box>
                      <a href={`${selectedVideoUrl}`} target="_blank">
                        <Typography
                          sx={{
                            position: "absolute",
                            top: 80,
                            right: 5,
                            zIndex: 99,
                            color: "black",
                            fontSize: "10px",
                            width: "105px",
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {`${selectedVideoUrl.slice(0, 20)}.....`}
                        </Typography>
                      </a>
                      <IconButton
                        onClick={() => setSelectedVideoUrl(null)}
                        className="no-drag"
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bgcolor: COLORS.black,
                          color: COLORS.white,
                          "&:hover": { bgcolor: "red" },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </motion.div>
                </Rnd>
              )}

              {selectedAudioUrl && (
                <Rnd
                  cancel=".no-drag"
                  position={{ x: qrAudioPosition.x, y: qrAudioPosition.y }}
                  onDragStop={(_, d) =>
                    setQrAudioPosition((prev) => ({
                      ...prev,
                      x: d.x,
                      y: d.y,
                      zIndex: qrAudioPosition.zIndex,
                    }))
                  }
                  onResizeStop={(_, __, ref, ___, position) => {
                    setQrAudioPosition((prev) => ({
                      ...prev,
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                      x: position.x,
                      y: position.y,
                      zIndex: qrAudioPosition.zIndex,
                    }));
                  }}
                  bounds="parent"
                  enableResizing={false}
                  style={{
                    padding: "10px",
                    zIndex: 999
                  }}
                >
                  <motion.div
                    key={selectedVideoUrl} // ✅ unique key triggers re-animation on change
                    initial={{ opacity: 0, x: 100 }} // start off-screen (right)
                    animate={{ opacity: 1, x: 0 }} // slide in
                    exit={{ opacity: 0, x: -100 }} // slide out left
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  // style={{ position: "absolute", width: "100%" }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        height: "100%",
                        bottom: 0,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/audio-qr-tips.png"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                          pointerEvents: "none",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 55,
                          height: 10,
                          width: 10,
                          left: { md: 7, sm: 7, xs: 5 },
                          borderRadius: 2,
                        }}
                      >
                        <QrGenerator
                          url={selectedAudioUrl}
                          size={Math.min(
                            qrAudioPosition.width,
                            qrAudioPosition.height
                          )}
                        />
                      </Box>
                      <a href={`${selectedAudioUrl}`} target="_blank">
                        <Typography
                          sx={{
                            position: "absolute",
                            top: 78,
                            right: 10,
                            zIndex: 99,
                            color: "black",
                            fontSize: "10px",
                            width: "105px",
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {`${selectedAudioUrl.slice(0, 20)}.....`}
                        </Typography>
                      </a>
                      <IconButton
                        onClick={() => setSelectedAudioUrl(null)}
                        className="no-drag"
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bgcolor: COLORS.black,
                          color: COLORS.white,
                          "&:hover": { bgcolor: "red" },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </motion.div>
                </Rnd>
              )}

              {draggableImages
                .filter((img: any) => selectedImg.includes(img.id))
                // .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
                .map(({ id, src, x, y, width, height, zIndex, rotation = 0, filter }: any) => {
                  const isMobile =
                    typeof window !== "undefined" && window.innerWidth < 768;

                  return (
                    <Rnd
                      key={id}
                      size={{ width, height }}
                      position={{ x, y }}
                      bounds="parent"
                      enableUserSelectHack={false}
                      cancel=".non-draggable"
                      onDragStop={(_, d) => {
                        setDraggableImages((prev) =>
                          prev.map((img) =>
                            img.id === id ? { ...img, x: d.x, y: d.y } : img
                          )
                        );
                      }}
                      onResizeStop={(_, __, ref, ___, position) => {
                        const newWidth = parseInt(ref.style.width);
                        const newHeight = parseInt(ref.style.height);
                        setDraggableImages((prev) =>
                          prev.map((img) =>
                            img.id === id
                              ? {
                                ...img,
                                width: newWidth,
                                height: newHeight,
                                x: position.x,
                                y: position.y,
                              }
                              : img
                          )
                        );
                      }}
                      style={{
                        zIndex: zIndex || 1,
                        boxSizing: "border-box",
                        borderRadius: 8,
                        touchAction: "none",
                      }}
                      enableResizing={{ bottomRight: true }}
                      resizeHandleStyles={{
                        bottomRight: {
                          width: isMobile ? "20px" : "10px",
                          height: isMobile ? "20px" : "10px",
                          background: "white",
                          border: "2px solid #1976d2",
                          borderRadius: "10%",
                          right: isMobile ? "-10px" : "-5px",
                          bottom: isMobile ? "-10px" : "-5px",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          overflow: "visible",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* rotated image */}
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: "center center",
                          }}
                        >
                          <img
                            src={src}
                            alt="Uploaded"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 8,
                              pointerEvents: "none",
                              border: "2px solid #1976d2",
                              objectFit: "fill",
                              filter: filter || "none",
                              zIndex: zIndex || 1
                            }}
                          />
                        </Box>

                        {/* Rotate button */}
                        <Box
                          className="non-draggable"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDraggableImages((prev) =>
                              prev.map((img) =>
                                img.id === id
                                  ? { ...img, rotation: (img.rotation || 0) + 15 }
                                  : img
                              )
                            );
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
                            pointerEvents: "auto",
                            touchAction: "manipulation",
                            "&:hover": { bgcolor: "#333" },
                          }}
                        >
                          <Forward30 fontSize={isMobile ? "medium" : "small"} />
                        </Box>

                        {/* Close button */}
                        <Box
                          className="non-draggable"
                          onClick={(e) => {
                            e.stopPropagation();

                            // REMOVE image from selected
                            setSelectedImage(prev => prev.filter(i => i !== id));
                            setDraggableImages(prev => prev.filter(img => img.id !== id));

                            // RESET filter to original
                            setDraggableImages(prev =>
                              prev.map(img =>
                                img.id === id ? { ...img, filter: "none" } : img
                              )
                            );

                            setActiveFilterImageId(null);
                            // CLOSE filter panel
                            setImageFilter(false);
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
                            pointerEvents: "auto",
                            touchAction: "manipulation",
                            "&:hover": { bgcolor: "#333" },
                          }}
                        >
                          <Close fontSize={isMobile ? "medium" : "small"} />
                        </Box>
                      </Box>
                    </Rnd>
                  );
                })}

              {showOneTextRightSideBox && (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: { md: "675px", sm: "575px", xs: '575px' },
                    width: { md: "470px", sm: "370px", xs: "100%" },
                    border: "3px dashed #3a7bd5",
                    bgcolor: "#6183cc36",
                    position: "relative",
                    p: 1,
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
                      if (typeof setShowOneTextRightSideBox === "function") {
                        setShowOneTextRightSideBox(false);
                        setSelectedLayout("blank");
                      }
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
                      justifyContent:
                        verticalAlign === "top"
                          ? "flex-start"
                          : verticalAlign === "center"
                            ? "center"
                            : "flex-end",
                    }}
                  >
                    <TextField
                      variant="standard"
                      value={oneTextValue}
                      onChange={(e) => setOneTextValue(e.target.value)}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          "& .MuiInputBase-input": {
                            fontSize: fontSize,
                            fontWeight: fontWeight,
                            color: fontColor,
                            fontFamily: fontFamily,
                            textAlign: textAlign,
                            transform: `rotate(${rotation}deg)`,
                            lineHeight: lineHeight2,
                            letterSpacing: letterSpacing2
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

              {multipleTextValue && (
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
                  {texts.map((textObj, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        height: { md: "210px", sm: "180px", xs: '180px' },
                        width: "100%",
                        mb: 2,
                        border: "3px dashed #3a7bd5",
                        borderRadius: "6px",
                        justifyContent: "center",
                        display: "flex",
                        alignItems:
                          verticalAlign === "top"
                            ? "flex-start"
                            : verticalAlign === "center"
                              ? "center"
                              : "flex-end",
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
                        onClick={() => handleDeleteBox(index)}
                      >
                        <Close />
                      </IconButton>

                      {editingIndex === index ? (
                        <TextField
                          autoFocus
                          fullWidth
                          multiline
                          variant="standard"
                          value={textObj.value}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setTexts((prev) =>
                              prev.map((t, i) =>
                                i === index
                                  ? {
                                    ...t,
                                    value: newValue,
                                    textAlign: textAlign,
                                    verticalAlign: verticalAlign,
                                  }
                                  : t
                              )
                            );
                          }}
                          InputProps={{
                            disableUnderline: true,
                            sx: {
                              "& textarea": {
                                width: "100%",
                                resize: "none",
                                fontSize: textObj.fontSize,
                                fontWeight: textObj.fontWeight,
                                color: textObj.fontColor,
                                fontFamily: textObj.fontFamily,
                                textAlign: textAlign,
                                lineHeight: textObj.lineHeight,
                                letterSpacing: textObj.letterSpacing,
                              },
                            },
                          }}
                        />
                      ) : (
                        <Box
                          onClick={() => {
                            if (editingIndex !== null) {
                              setTexts((prev) =>
                                prev.map((t, i) =>
                                  i === editingIndex
                                    ? {
                                      ...t,
                                      textAlign: textAlign,
                                      verticalAlign: verticalAlign,
                                    }
                                    : t
                                )
                              );
                            }

                            // ✅ Then select new box
                            setEditingIndex(index);
                            setFontSize(textObj.fontSize);
                            setFontFamily(textObj.fontFamily);
                            setFontWeight(textObj.fontWeight);
                            setFontColor(textObj.fontColor);
                            setTextAlign(textObj.textAlign);
                            setVerticalAlign(textObj.verticalAlign);
                          }}
                          sx={{
                            width: "100%",
                            height: "100%",
                            cursor: "pointer",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: textObj.fontSize,
                              fontWeight: textObj.fontWeight,
                              color: textObj.fontColor,
                              fontFamily: textObj.fontFamily,
                              textAlign: textObj.textAlign,
                              lineHeight: textObj.lineHeight,
                              letterSpacing: textObj.letterSpacing,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems:
                                textObj.verticalAlign === "top"
                                  ? "flex-start"
                                  : textObj.verticalAlign === "bottom"
                                    ? "flex-end"
                                    : "center",
                              justifyContent:
                                textObj.textAlign === "left"
                                  ? "flex-start"
                                  : textObj.textAlign === "right"
                                    ? "flex-end"
                                    : "center",
                            }}
                          >
                            {textObj.value.length === 0 ? (
                              <TitleOutlined
                                sx={{ alignSelf: "center", color: "gray" }}
                              />
                            ) : null}{" "}
                            {textObj.value}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {isAIimage2 && (
                <Rnd
                  cancel=".no-drag"
                  size={{ width: aimage2.width, height: aimage2.height }}
                  position={{ x: aimage2.x, y: aimage2.y }}
                  onDragStop={(_, d) =>
                    setAIImage2((prev) => ({
                      ...prev,
                      x: d.x,
                      y: d.y,
                    }))
                  }
                  onResizeStop={(_, __, ref, ___, position) =>
                    setAIImage2({
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                      x: position.x,
                      y: position.y,
                    })
                  }
                  bounds="parent"
                  enableResizing={{
                    top: false,
                    right: false,
                    bottom: false,
                    left: false,
                    topRight: false,
                    bottomRight: true,
                    bottomLeft: false,
                    topLeft: false,
                  }}
                  resizeHandleStyles={{
                    bottomRight: {
                      width: "10px",
                      height: "10px",
                      background: "white",
                      border: "2px solid #1976d2",
                      borderRadius: "10%",
                      right: "-5px",
                      bottom: "-5px",
                      cursor: "se-resize",
                    },
                  }}
                  style={{
                    zIndex: 10,
                    border: "2px solid #1976d2",
                    display: "flex", // ✅ make content fill
                    alignItems: "stretch",
                    justifyContent: "stretch",
                  }}
                >
                  {/* ✅ Ensure the container fills RND box */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                    }}
                  >
                    {/* ✅ Make image fill fully */}
                    <Box
                      component="img"
                      src={`${selectedAIimageUrl2}`}
                      alt="AI Image"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "fill",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Close button */}
                    <IconButton
                      onClick={() => setIsAIimage2?.(false)}
                      className="no-drag"
                      sx={{
                        position: "absolute",
                        top: -7,
                        right: -7,
                        bgcolor: "black",
                        color: "white",
                        width: 22,
                        height: 22,
                        "&:hover": {
                          bgcolor: "red",
                        },
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                </Rnd>
              )}

              {selectedStickers2.map((sticker, index) => {
                const isMobile =
                  typeof window !== "undefined" && window.innerWidth < 768;

                return (
                  <Rnd
                    key={sticker.id || index}
                    size={{ width: sticker.width, height: sticker.height }}
                    position={{ x: sticker.x, y: sticker.y }}
                    bounds="parent"
                    enableUserSelectHack={false} // ✅ allows touch events
                    cancel=".non-draggable" // ✅ prevents RND drag hijack on buttons
                    onDragStop={(_, d) =>
                      updateSticker2(index, {
                        x: d.x,
                        y: d.y,
                        zIndex: sticker.zIndex,
                      })
                    }
                    onResizeStop={(_, __, ref, ___, position) =>
                      updateSticker2(index, {
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                        x: position.x,
                        y: position.y,
                        zIndex: sticker.zIndex,
                      })
                    }
                    enableResizing={{
                      bottomRight: true,
                    }}
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
                    style={{
                      zIndex: sticker.zIndex,
                      position: "absolute",
                      touchAction: "none", // ✅ allow touch drag + taps
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {/* Sticker image */}
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

                      {/* Close Button */}
                      <IconButton
                        className="non-draggable" // ✅ prevent drag capture
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSticker2(index);
                        }}
                        sx={{
                          position: "absolute",
                          top: -isMobile ? -20 : -8,
                          right: -isMobile ? -20 : -10,
                          bgcolor: "black",
                          color: "white",
                          p: isMobile ? 1.5 : 1,
                          width: isMobile ? 32 : 25,
                          height: isMobile ? 32 : 25,
                          zIndex: 9999,
                          cursor: "pointer",
                          pointerEvents: "auto",
                          touchAction: "manipulation",
                          "&:hover": { bgcolor: "red" },
                        }}
                      >
                        <Close fontSize={isMobile ? "medium" : "small"} />
                      </IconButton>

                      {/* Rotate Button */}
                      <IconButton
                        className="non-draggable"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSticker2(index, {
                            rotation: ((sticker.rotation || 0) + 15) % 360,
                          });
                        }}
                        sx={{
                          position: "absolute",
                          top: -isMobile ? -20 : -8,
                          left: -isMobile ? -20 : -5,
                          bgcolor: "black",
                          color: "white",
                          p: isMobile ? 1.5 : 1,
                          width: isMobile ? 32 : 25,
                          height: isMobile ? 32 : 25,
                          zIndex: 9999,
                          cursor: "pointer",
                          pointerEvents: "auto",
                          touchAction: "manipulation",
                          "&:hover": { bgcolor: "blue" },
                        }}
                      >
                        <Forward10 fontSize={isMobile ? "medium" : "small"} />
                      </IconButton>
                    </Box>
                  </Rnd>
                );
              })}
            </>}

        </Box>
      )
      }
    </Box >
  );
};

export default SlideSpread;
