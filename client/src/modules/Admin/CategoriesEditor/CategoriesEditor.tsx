// src/pages/.../CategoriesEditor.tsx
import {
  Box, IconButton, Typography, TextField, Select, MenuItem, Tooltip,
  FormControl, InputLabel, Divider, Chip, Stack, useTheme, useMediaQuery, Switch
} from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import {
  CollectionsOutlined, EmojiEmotionsOutlined, TitleOutlined,
  ArrowBackIos, ArrowForwardIos, Close, FormatBoldOutlined,
  Edit, TextIncreaseOutlined,
  FormatAlignCenter, FormatAlignLeft, FormatAlignRight, // ⬅️ ADD
} from "@mui/icons-material";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { COLORS } from "../../../constant/color";
import { ADMINS_GOOGLE_FONTS, CATEGORY_CONFIG, CATEGORY_KEYS, STICKERS_DATA, type CategoryKey } from "../../../constant/data";
import PopupWrapper from "../../../components/PopupWrapper/PopupWrapper";
import LandingButton from "../../../components/LandingButton/LandingButton";
import {
  useCategoriesEditorState,
  type TextElement as CtxTextEl,
  type ImageElement as CtxImageEl,
} from "../../../context/CategoriesEditorContext";
import { useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../constant/route";

/* ----------------- Utils ----------------- */
const mmToPx = (mm: number) => (mm / 25.4) * 96;
const uuid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;

function fitCanvas(mmW: number, mmH: number, viewportW: number, viewportH: number, padding = 32) {
  const pxW = mmToPx(mmW), pxH = mmToPx(mmH);
  const maxW = Math.max(280, viewportW - padding);
  const maxH = Math.max(220, viewportH - padding);
  const scale = Math.min(maxW / pxW, maxH / pxH);
  return { width: Math.round(pxW * scale), height: Math.round(pxH * scale), scale };
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

const fetchToDataUrl = async (src: string): Promise<string> => {
  if (!src || src.startsWith("data:")) return src;
  try {
    const absolute = src.startsWith("/") ? `${window.location.origin}${src}` : src;
    const resp = await fetch(absolute, { mode: "cors" });
    const blob = await resp.blob();
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ""));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
  }
};

/* --------------- Component --------------- */
const CategoriesEditor = () => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const {
    category, setCategory, config,
    slides, setSlides,
    selectedSlide, setSelectedSlide,
    selectedTextId, setSelectedTextId,
    selectedImageId, setSelectedImageId,
    textToolOn, setTextToolOn,
    textElements, setTextElements,
    imageElements, setImageElements,
    mainScrollerRef,
    registerFirstSlideNode,
    loading, setLoading,
    getSlidesWithElements, captureFirstSlidePng,
  } = useCategoriesEditorState();

  // ====== Local UI-only state ======
  const [fontSizeInput, setFontSizeInput] = useState<string>("20");
  const [showStickerPopup, setShowStickerPopup] = useState(false);
  const [mirror, setMirror] = useState<boolean>(!!config.mirrorPrint);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isDraggingMain = useRef(false);
  const startXMain = useRef(0);
  const scrollLeftMain = useRef(0);
  const isDraggingThumb = useRef(false);
  const startXThumb = useRef(0);
  const scrollLeftThumb = useRef(0);

  // ====== Viewport-aware canvas sizing ======
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });
  useEffect(() => {
    const onResize = () => {
      const headerFooterReserve = 240;
      setViewport({ w: window.innerWidth, h: Math.max(320, window.innerHeight - headerFooterReserve) });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const canvasSize = useMemo(
    () => fitCanvas(
      config.mmWidth,
      config.mmHeight,
      viewport.w * (isTablet ? 0.95 : 0.72),
      viewport.h
    ),
    [config.mmWidth, config.mmHeight, viewport, isTablet]
  );

  // current slide id
  const currentSlideId = slides[selectedSlide]?.id ?? null;
  const colorInputRef = useRef<HTMLInputElement | null>(null);

  const openNativeColorPicker = () => {
    if (!selectedTextId) return;
    colorInputRef.current?.click();
  };

  const selectedText = useMemo(
    () => (selectedTextId ? (textElements.find(e => e.id === selectedTextId) ?? null) : null),
    [selectedTextId, textElements]
  );

  /* ---- Font size sync/control ---- */
  useEffect(() => {
    const sel = textElements.find(e => e.id === selectedTextId);
    if (sel?.fontSize != null) setFontSizeInput(String(sel.fontSize));
  }, [selectedTextId, textElements]);

  const commitFontSize = useCallback((raw: string) => {
    if (!selectedTextId) return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(6, Math.min(300, n));
    setTextElements(prev => prev.map(te => te.id === selectedTextId ? { ...te, fontSize: clamped } : te));
    setFontSizeInput(String(clamped));
  }, [selectedTextId, setTextElements]);

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => setFontSizeInput(e.target.value);

  /* ---------------- Slides ---------------- */
  const scrollToSlide = (index: number) => {
    const container = mainScrollerRef.current;
    if (!container) {
      setSelectedSlide(index);
      setSelectedTextId(null);
      setSelectedImageId(null);
      return;
    }
    const child = container.children[index] as HTMLElement | undefined;
    if (!child) return;
    const slideWidth = child.offsetWidth + 40;
    container.scrollTo({ left: slideWidth * index, behavior: "smooth" });
    setSelectedSlide(index);
    setSelectedTextId(null);
    setSelectedImageId(null);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const target = slides[index];
    if (!target) return;
    const nextSlides = slides.filter((_, i) => i !== index);
    setSlides(nextSlides);
    setTextElements(prev => prev.filter(e => e.slideId !== target.id));
    setImageElements(prev => prev.filter(e => e.slideId !== target.id));
    setSelectedSlide(Math.max(0, Math.min(index, nextSlides.length - 1)));
    setSelectedTextId(null);
    setSelectedImageId(null);
  };

  /* -------------- Elements --------------- */
  const addText = () => {
    if (currentSlideId == null) return;
    const el: CtxTextEl = {
      id: uuid("txt"),
      slideId: currentSlideId,
      x: 24, y: 24, width: 220, height: 44,
      text: "",
      bold: false, italic: false, color: "#111111",
      fontSize: 20, fontFamily: "Arial",
      // @ts-expect-error align not in type: stored dynamically
      align: "left", // why: default alignment
    };
    setTextElements(prev => [...prev, el]);
    setSelectedTextId(el.id);
    setSelectedImageId(null);
  };

  const updateText = (id: string, patch: Partial<CtxTextEl>) => {
    setTextElements(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));
  };

  const addImage = (src: string) => {
    if (currentSlideId == null) return;
    const el: CtxImageEl = {
      id: uuid("img"),
      slideId: currentSlideId,
      x: 48, y: 48, width: 160, height: 160,
      src,
    };
    setImageElements(prev => [...prev, el]);
    setSelectedImageId(el.id);
    setSelectedTextId(null);
  };

  const updateImage = (id: string, patch: Partial<CtxImageEl>) => {
    setImageElements(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));
  };

  const deleteElement = (id: string) => {
    let removed = false;
    setTextElements(prev => {
      if (prev.some(e => e.id === id)) removed = true;
      return prev.filter(e => e.id !== id);
    });
    if (!removed) setImageElements(prev => prev.filter(e => e.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
    if (selectedImageId === id) setSelectedImageId(null);
  };

  /* -------------- File input -------------- */
  const onClickPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      addImage(dataUrl);
    } finally {
      e.target.value = "";
    }
  };

  const getSlideElements = useCallback(
    (slideId: number) => {
      const texts = textElements
        .filter(e => e.slideId === slideId)
        .map(e => ({ ...e, type: "text" as const }));
      const images = imageElements
        .filter(e => e.slideId === slideId)
        .map(e => ({ ...e, type: "image" as const }));
      return [...texts, ...images];
    },
    [textElements, imageElements]
  );

  /* ---------- Drag scrolling ---------- */
  const onMainMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = mainScrollerRef.current;
    if (!el) return;
    isDraggingMain.current = true;
    startXMain.current = e.pageX - el.offsetLeft;
    scrollLeftMain.current = el.scrollLeft;
  };
  const onMainMouseUp = () => (isDraggingMain.current = false);
  const onMainMouseLeave = () => (isDraggingMain.current = false);
  const onMainMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = mainScrollerRef.current;
    if (!isDraggingMain.current || !el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - startXMain.current;
    el.scrollLeft = scrollLeftMain.current - walk;
  };
  const onThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!thumbRef.current) return;
    isDraggingThumb.current = true;
    startXThumb.current = e.pageX - thumbRef.current.offsetLeft;
    scrollLeftThumb.current = thumbRef.current.scrollLeft;
  };
  const onThumbMouseUp = () => (isDraggingThumb.current = false);
  const onThumbMouseLeave = () => (isDraggingThumb.current = false);
  const onThumbMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingThumb.current || !thumbRef.current) return;
    const x = e.pageX - thumbRef.current.offsetLeft;
    const walk = x - startXThumb.current;
    thumbRef.current.scrollLeft = scrollLeftThumb.current - walk;
  };

  const slideScrollLeft = () => thumbRef.current && (thumbRef.current.scrollLeft -= 120);
  const slideScrollRight = () => thumbRef.current && (thumbRef.current.scrollLeft += 120);

  // ====== Align helpers ======
  type TextAlignVal = "left" | "center" | "right";
  const cycleAlign = (curr?: TextAlignVal): TextAlignVal =>
    curr === "left" ? "center" : curr === "center" ? "right" : "left";

  const currentAlign: TextAlignVal = (selectedText as any)?.align ?? "left";
  const AlignIcon = currentAlign === "left" ? FormatAlignLeft : currentAlign === "center" ? FormatAlignCenter : FormatAlignRight;

  // ====== Toolbar (responsive)
  const Toolbar = (
    <Box
      sx={{
        position: { xs: "static", md: "absolute" },
        left: { md: 0 }, top: 0,
        display: "flex",
        flexDirection: { xs: "row", md: "column" },
        alignItems: { xs: "center", md: "stretch" },
        gap: 0.75,
        p: 1,
        bgcolor: "#fff",
        boxShadow: 3,
        borderRadius: 2,
        zIndex: 5,
        height: { md: canvasSize.height, xs: "auto" },
        overflowX: { xs: "auto", md: "hidden" },
        overflowY: { xs: "hidden", md: "auto" },
        maxWidth: { xs: "100%", md: "none" },
        "&::-webkit-scrollbar": { height: 6 },
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {config.features.text && (
        <Tooltip title="Toggle Text Tool">
          <IconButton sx={{ ...toolBtn, color: textToolOn ? "#1976d2" : "#212121" }} onClick={() => setTextToolOn((s) => !s)}>
            <TitleOutlined fontSize="large" />
            Text
          </IconButton>
        </Tooltip>
      )}
      {config.features.photo && (
        <Tooltip title="Add Photo">
          <IconButton sx={toolBtn} onClick={onClickPhoto}>
            <CollectionsOutlined fontSize="large" />
            Photo
          </IconButton>
        </Tooltip>
      )}
      {config.features.sticker && (
        <Tooltip title="Add Sticker">
          <IconButton
            sx={toolBtn}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowStickerPopup(true); }}
          >
            <EmojiEmotionsOutlined fontSize="large" />
            Sticker
          </IconButton>
        </Tooltip>
      )}

      {textToolOn && (
        <>
          <Divider flexItem sx={{ my: 0.5 }} />
          <Tooltip title="Add text">
            <IconButton sx={toolBtn} onClick={addText}>
              <TextIncreaseOutlined fontSize="large" />
              Add
            </IconButton>
          </Tooltip>

          {/* Font size */}
          <Box sx={{ ...toolBtn, alignItems: "center", gap: 0.5 }}>
            <TextField
              type="text"
              variant="outlined"
              value={fontSizeInput}
              onChange={handleFontSizeChange}
              onBlur={() => commitFontSize(fontSizeInput)}
              onKeyDown={(e) => e.key === "Enter" && commitFontSize(fontSizeInput)}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              sx={{
                width: 60,
                "& .MuiInputBase-root": { p: 0, textAlign: "center" },
                "& input": { textAlign: "center", fontSize: 14, fontWeight: 500, p: "8px" },
              }}
            />
          </Box>

          <Tooltip title="Bold">
            <IconButton
              sx={{ ...toolBtn, color: selectedText?.bold ? "#1976d2" : "#212121" }}
              onClick={() => selectedText && updateText(selectedText.id, { bold: !selectedText.bold })}
              disabled={!selectedTextId}
            >
              <FormatBoldOutlined fontSize="large" />
              Bold
            </IconButton>
          </Tooltip>

          {/* Font family */}
          <Box sx={{ ...toolBtn, alignItems: "center", gap: 0.5 }}>
            <Select
              value={selectedText?.fontFamily || "Arial"}
              onChange={(e) => selectedText && updateText(selectedText.id, { fontFamily: String(e.target.value) })}
              variant="standard"
              inputProps={{ disableUnderline: true }}
              renderValue={(val) => (
                <Box sx={{ fontFamily: String(val || "Arial"), fontSize: 12, textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {String(val || "Arial")}
                </Box>
              )}
              MenuProps={{ PaperProps: { sx: { maxHeight: 'auto' } } }}
              sx={{
                maxWidth: 60,
                textAlign: "center",
                "& .MuiSelect-select": { px: 0.5, py: 0.25, width: "60px", display: "flex", alignItems: "center", justifyContent: "center" },
                "& .MuiInputBase-root": { p: 0 },
                "& .MuiInput-underline:before": { borderBottom: "none" },
                "& .MuiInput-underline:after": { borderBottom: "none" },
              }}
            >
              <MenuItem value="Arial" sx={{ fontFamily: "Arial" }}>Arial</MenuItem>
              {ADMINS_GOOGLE_FONTS.map((font) => (
                <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                  {font}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Align: cycles left → center → right */}
          <Tooltip title={`Align: ${currentAlign}`}>
            <span>
              <IconButton
                sx={{ ...toolBtn, color: "#212121" }}
                disabled={!selectedTextId}
                onClick={() => {
                  if (!selectedTextId) return;
                  const next = cycleAlign(currentAlign);
                  // @ts-expect-error align not in type: stored dynamically
                  updateText(selectedTextId, { align: next });
                }}
              >
                <AlignIcon fontSize="large" />
                Align
              </IconButton>
            </span>
          </Tooltip>

          {/* Color */}
          <Stack direction="row" spacing={0.5} sx={{ px: 1, flexWrap: "wrap", maxWidth: 220 }}>
            <IconButton
              onClick={openNativeColorPicker}
              disabled={!selectedTextId}
              aria-label="Pick text color"
              sx={{
                width: 36, height: 36, borderRadius: "50%",
                border: "2px solid #e0e0e0", p: 0, overflow: "hidden",
                opacity: selectedTextId ? 1 : 0.5, cursor: selectedTextId ? "pointer" : "not-allowed",
              }}
            >
              <Box sx={{ width: "100%", height: "100%", bgcolor: selectedText?.color || "#000000", borderRadius: "50%" }} />
            </IconButton>
            <input
              ref={colorInputRef}
              type="color"
              value={selectedText?.color || "#000000"}
              onChange={(e) => { if (!selectedTextId) return; updateText(selectedTextId, { color: e.target.value }); }}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
              aria-hidden
            />
          </Stack>
        </>
      )}

      <Divider flexItem sx={{ my: 0.5 }} />
    </Box>
  );

  const navigate = useNavigate();
  const goNextWithFirstSlide = async () => {
    setLoading(true);
    try {
      const firstSlide = getSlidesWithElements()[0] ?? null;
      const imgUrl = await captureFirstSlidePng();
      navigate(ADMINS_DASHBOARD.ADD_NEW_TEMPLETS_CARDS, {
        state: { firstSlide, imgUrl: imgUrl ?? "" },
      });
    } catch (e) {
      console.error(e);
      alert("Could not prepare preview");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout title="Categories Wise Editor">
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileSelected} />

      {/* Header (unchanged) */}
      <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1, px: 2, flexWrap: "wrap" }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="cat-label">Category</InputLabel>
            <Select
              labelId="cat-label"
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value as CategoryKey)}
            >
              {CATEGORY_KEYS.map((k) => (
                <MenuItem key={k} value={k}>{CATEGORY_CONFIG[k].label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip label={`${config.mmWidth}×${config.mmHeight} mm`} size="small" />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption">Mirror</Typography>
            <Switch size="small" checked={mirror} onChange={(e) => setMirror(e.target.checked)} />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1}>
          <LandingButton personal title="Save Design" width="150px" onClick={goNextWithFirstSlide} loading={loading} />
        </Stack>
      </Box>

      {/* MAIN SLIDE SCROLLER */}
      <Box
        ref={mainScrollerRef}
        onMouseDown={onMainMouseDown}
        onMouseUp={onMainMouseUp}
        onMouseLeave={onMainMouseLeave}
        onMouseMove={onMainMouseMove}
        sx={{
          display: "flex", overflowX: "auto", gap: "76px", width: "100%", px: { xs: 2, md: 8 },
          justifyContent: "center", scrollBehavior: "smooth", userSelect: "none",
          "&::-webkit-scrollbar": { display: "none" }, pb: 1, p: 1,
        }}
      >
        {slides.map((slide, index) => {
          const isInactive = index !== selectedSlide;
          const elements = getSlideElements(slide.id);

          return (
            <Box
              key={slide.id}
              ref={index === 0 ? registerFirstSlideNode : undefined}
              sx={{
                flex: "0 0 auto", width: canvasSize.width, height: canvasSize.height,
                bgcolor: isInactive ? "#b6b0b06b" : "#fff",
                borderRadius: 2,
                boxShadow: index === selectedSlide ? 8 : 2,
                position: "relative",
                outline: index === selectedSlide ? "2px solid #1976d2" : "1px solid rgba(0,0,0,0.08)",
                transition: "box-shadow .2s ease, outline .2s ease, filter .2s ease, opacity .2s ease, background-color .2s ease",
                opacity: isInactive ? 0.55 : 1,
                filter: isInactive ? "grayscale(0.4)" : "none",
              }}
              onClick={() => { setSelectedTextId(null); setSelectedImageId(null); }}
            >
              {/* Toolbar */}
              {index === selectedSlide && (
                <Box sx={{ position: { xs: "static", md: "absolute" }, left: { md: -90 }, top: 0, mb: { xs: 1, md: 0 } }}>
                  {Toolbar}
                </Box>
              )}

              {/* Elements */}
              <Box
                sx={{
                  width: "100%", height: "100%",
                  pointerEvents: isInactive ? "none" : "auto",
                  transform: mirror ? "scaleX(-1)" : "none",
                  transformOrigin: "center",
                }}
              >
                {elements.map((el) => {
                  const isSelected = selectedTextId === el.id || selectedImageId === el.id;

                  const common = {
                    key: el.id,
                    position: { x: el.x, y: el.y },
                    size: { width: el.width, height: el.height },
                    bounds: "parent" as const,
                    dragCancel: ".no-drag",
                    onDragStop: (_: any, d: any) => {
                      if (el.type === "text") updateText(el.id, { x: d.x, y: d.y });
                      if (el.type === "image") updateImage(el.id, { x: d.x, y: d.y });
                    },
                    onResizeStop: (_: any, __: any, ref: any, ___: any, position: any) => {
                      const patch = {
                        width: parseInt(ref.style.width, 10),
                        height: parseInt(ref.style.height, 10),
                        x: position.x, y: position.y
                      };
                      if (el.type === "text") updateText(el.id, patch);
                      if (el.type === "image") updateImage(el.id, patch);
                    },
                    style: {
                      borderRadius: 4,
                      position: "absolute" as const,
                      overflow: "visible",
                      zIndex: isSelected ? 50 : 30,
                      border: isSelected ? "1px solid #1976d2" : "1px solid rgba(0,0,0,0.06)",
                      background: "transparent",
                      cursor: "move",
                    },
                    resizeHandleStyles: {
                      bottomRight: {
                        width: "14px", height: "14px",
                        background: "white", border: "1px solid #1976d2",
                        borderRadius: "3px", right: "-7px", bottom: "-7px",
                        cursor: "nwse-resize", boxShadow: "0 1px 2px rgba(0,0,0,.15)",
                      },
                    },
                    disableDragging: isInactive,
                    enableResizing: isInactive
                      ? false
                      : { top: false, right: false, left: false, bottom: false, bottomRight: true },
                  };

                  if ((el as any).type === "image") {
                    return (
                      <Rnd
                        {...common}
                        onClick={(e: any) => { e.stopPropagation(); if (!isInactive) { setSelectedImageId(el.id); setSelectedTextId(null); } }}
                      >
                        <Box sx={{ width: "100%", height: "100%", position: "relative", transform: mirror ? "scaleX(-1)" : "none" }}>
                          <img
                            src={(el as any).src} alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 4 }}
                            draggable={false}
                          />
                          {!isInactive && (
                            <IconButton
                              className="no-drag"
                              onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                              sx={{ position: "absolute", top: -8, right: -8, bgcolor: "black", color: "white", width: 22, height: 22, zIndex: 2, "&:hover": { bgcolor: "#c62828" } }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Rnd>
                    );
                  }

                  // TEXT element
                  const align: TextAlignVal = ((el as any).align ?? "left") as TextAlignVal;
                  const justify = align === "left" ? "flex-start" : align === "center" ? "center" : "flex-end";

                  return (
                    <Rnd
                      {...common}
                      onClick={(e: any) => { e.stopPropagation(); if (!isInactive) { setSelectedTextId(el.id); setSelectedImageId(null); } }}
                    >
                      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: justify, p: 1 }}>
                        {selectedTextId === el.id && !isInactive ? (
                          <>
                            <TextField
                              className="no-drag"
                              multiline
                              value={(el as any).text}
                              onChange={(e) => updateText(el.id, { text: e.target.value })}
                              variant="standard"
                              placeholder="Add Text"
                              autoFocus
                              sx={{ width: "100%" }}
                              InputProps={{ disableUnderline: true }}
                              inputProps={{
                                style: {
                                  fontWeight: (el as any).bold ? 700 : 400,
                                  fontStyle: (el as any).italic ? "italic" : "normal",
                                  fontSize: (el as any).fontSize ?? 20,
                                  fontFamily: (el as any).fontFamily ?? "Arial",
                                  color: (el as any).color ?? "#111111",
                                  lineHeight: 1.2,
                                  textAlign: align, // ⬅️ respect align while editing
                                },
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <IconButton
                              className="no-drag"
                              onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                              sx={{ position: "absolute", top: -8, right: -8, bgcolor: "black", color: "white", width: 22, height: 22, zIndex: 2, "&:hover": { bgcolor: "#c62828" } }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <Typography
                            sx={{
                              fontWeight: (el as any).bold ? 700 : 400,
                              fontStyle: (el as any).italic ? "italic" : "normal",
                              fontSize: (el as any).fontSize ?? 20,
                              fontFamily: (el as any).fontFamily ?? "Arial",
                              color: (el as any).color ?? "#111111",
                              textAlign: align, 
                              width: "100%", height: "100%",
                              alignItems: "center", display: "flex",
                              userSelect: "none", pointerEvents: "none",
                              justifyContent:align
                            }}
                          >
                            {(el as any).text}
                            {!isInactive && (
                              <Box sx={{ position: "absolute", top: -15, right: -8, pointerEvents: "auto" }}>
                                <IconButton className="no-drag" onClick={(e) => { e.stopPropagation(); setSelectedTextId(el.id); setSelectedImageId(null); }}>
                                  <Edit color="info" />
                                </IconButton>
                              </Box>
                            )}
                          </Typography>
                        )}
                      </Box>
                    </Rnd>
                  );
                })}

                {/* Sticker popup (active only) */}
                {!isInactive && (
                  <Box onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                    {showStickerPopup && (
                      <PopupWrapper title="Choose Sticker" open={showStickerPopup} onClose={() => setShowStickerPopup(false)} sx={{ height: "auto", width: 320, left: { xs: "0", md: "22%" }, top: 0 }}>
                        <Box
                          sx={{
                            mt: 2, display: "flex", flexWrap: "wrap", gap: 1, overflowY: "auto",
                            "&::-webkit-scrollbar": { height: "6px", width: "5px" },
                            "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1", borderRadius: "20px" },
                            "&::-webkit-scrollbar-thumb": { backgroundColor: COLORS.primary, borderRadius: "20px" },
                            height: 460,
                          }}
                        >
                          {STICKERS_DATA.map((stick) => (
                            <Box
                              key={stick.id}
                              onClick={async () => {
                                const b64 = await fetchToDataUrl(stick.sticker);
                                addImage(b64);
                                setShowStickerPopup(false);
                              }}
                              sx={{
                                width: { md: "86px", sm: "76px", xs: "74px" }, height: "80px",
                                borderRadius: 2, bgcolor: "rgba(233, 232, 232, 1)",
                                display: "flex", justifyContent: "center", alignItems: "center",
                                userSelect: "none", cursor: "pointer", transition: ".15s",
                                "&:hover": { boxShadow: 3 },
                              }}
                            >
                              <Box component={"img"} src={stick.sticker} sx={{ width: "100%", height: "auto" }} />
                            </Box>
                          ))}
                        </Box>
                      </PopupWrapper>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Thumbnails (unchanged) */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, width: { xs: "96%", md: "46%" }, justifyContent: "center", m: "16px auto 0" }}>
        <IconButton onClick={slideScrollLeft}><ArrowBackIos /></IconButton>
        <Box
          ref={thumbRef}
          onMouseDown={onThumbMouseDown}
          onMouseUp={onThumbMouseUp}
          onMouseLeave={onThumbMouseLeave}
          onMouseMove={onThumbMouseMove}
          sx={{ display: "flex", overflowX: "auto", gap: 1, width: "64%", "&::-webkit-scrollbar": { display: "none" }, cursor: "grab", justifyContent: "center" }}
        >
          {slides.map((s, index) => (
            <Box
              key={s.id}
              sx={{
                px: 1.5, height: 40, minWidth: 60,
                bgcolor: index === selectedSlide ? "#1976d2" : "#eceff1",
                color: index === selectedSlide ? "white" : "#263238",
                borderRadius: 2, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                fontWeight: 600, flexShrink: 0, cursor: "pointer", transition: ".2s", position: "relative",
                boxShadow: index === selectedSlide ? 4 : 0,
              }}
              onClick={() => scrollToSlide(index)}
            >
              <Typography variant="body2">{config.slideLabels?.[index] ?? `Slide ${index + 1}`}</Typography>
              {slides.length > 1 && (
                <IconButton
                  onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
                  sx={{ position: "absolute", top: 0, right: -8, width: 18, height: 18, bgcolor: "#263238", color: "white", borderRadius: "50%", "&:hover": { bgcolor: "#c62828" }, zIndex: 5 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
        <IconButton onClick={slideScrollRight}><ArrowForwardIos /></IconButton>
      </Box>
    </DashboardLayout>
  );
};

export default CategoriesEditor;

const toolBtn = {
  display: "flex",
  flexDirection: "column" as const,
  fontSize: "12px",
  color: "#212121",
  "&:hover": { color: "#3a7bd5" },
};
