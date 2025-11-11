import { useRef, useState } from "react";
import {
  ImageRounded,
  FormatBold,
  FormatItalic,
  Check,
  Edit,
  Close,
  CollectionsOutlined,
  TextFieldsOutlined,
  MoodOutlined,
  CategoryOutlined,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { useCardEditor } from "../../../../../context/AdminEditorContext";
import { useNavigate } from "react-router-dom";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { ADMINS_DASHBOARD } from "../../../../../constant/route";
import { Rnd } from "react-rnd";
import { GOOGLE_FONTS, STICKERS_DATA } from "../../../../../constant/data";
import PopupWrapper from "../../../../../components/PopupWrapper/PopupWrapper";
import { COLORS } from "../../../../../constant/color";

type FirstSlideType = {
  firstSlide?: any;
};

const FirstSlide = (props: FirstSlideType) => {
  const { } = props


  const [showEmojiPopup, setShowEmojiPopup] = useState(false);

  const {
    selectedShapeImage,
    uploadedShapeImage,
    elements,
    setElements,
    textElements,
    setTextElements,
    stickerElements,
    setStickerElements,
  } = useCardEditor();

  const navigate = useNavigate();

  // Store which element's file input is currently active
  const activeElementRef = useRef<string | null>(null);
  // Separate hidden file input for adding images to canvas elements
  const canvasFileRef = useRef<HTMLInputElement>(null);
  // Currently selected element for editing (select only)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  // Selected text element id (for editing & toolbar)
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  // Dragging guard to avoid click firing after drag
  const draggingRef = useRef(false);

  // ✅ Add image box
  const handleAddImage = () => {
    const id = `el_${Date.now()}`;
    const newEl = {
      id,
      x: 60,
      y: 60,
      width: 200,
      height: 120,
      src: null,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(id);
    // Immediately trigger file upload for the new element
    activeElementRef.current = id;
    canvasFileRef.current?.click();
  };

  // ✅ Trigger upload manually for a selected element
  const uploadToSelected = (id: string) => {
    activeElementRef.current = id;
    canvasFileRef.current?.click();
  };

  // ✅ Add a text element
  const handleAddText = () => {
    const id = `txt_${Date.now()}`;
    const newEl = {
      id,
      x: 60,
      y: 60,
      width: 200,
      height: 60,
      text: "",
      bold: false,
      italic: false,
      fontSize: 20,
      fontFamily: "Arial",
      color: "#000000",
    };
    setTextElements((prev) => [...prev, newEl]);
    setSelectedTextId(id);
    setSelectedElementId(null);
  };

  // ✅ Update text element
  const updateTextElement = (
    id: string,
    patch: Partial<{
      text: string;
      bold: boolean;
      italic: boolean;
      fontSize: number;
      fontFamily: string;
      color: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  ) => {
    setTextElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  // ✅ Handle file change for canvas elements
  const handleCanvasFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeElementRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return;

      setElements((prev) =>
        prev.map((el) =>
          el.id === activeElementRef.current ? { ...el, src } : el
        )
      );
    };
    reader.readAsDataURL(file);

    e.target.value = ""; // Allow re-upload of the same file
  };

  // ✅ Add sticker to canvas
  const handleSelectSticker = (stickerPath: string) => {
    const id = `sticker_${Date.now()}`;
    const newSticker = {
      id,
      x: 80,
      y: 80,
      width: 100,
      height: 100,
      sticker: stickerPath,
      zIndex: 2 + stickerElements.length,
    };
    setStickerElements((prev) => [...prev, newSticker]);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: "25px" }}>First Slide</Typography>
        <LandingButton
          title="Save Changes"
          onClick={() => {
            navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS, {
              state: {
                formData: {
                  elements,
                  textElements,
                  selectedShapeImage,
                  uploadedShapeImage,
                },
              },
            });
          }}
        />
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* LEFT SIDE — Shape Preview or Banner */}
        <Box position={'relative'}>
          <Box
            component={"div"}
            sx={{
              width: { md: "500px", sm: "400px", xs: "100%" },
              height: { md: "700px", sm: "600px", xs: "400px" },
              borderRadius: "12px",
              boxShadow: "3px 5px 8px gray",
              display: "flex",
              alignItems: "center",
              justifyContent: 'white',
              position: "relative",
              overflow: "hidden",
              border: "1px solid lightgray",
              cursor: "pointer",
              // p: 1,
            }}
          >
            {/* Top toolbar for selected text element */}
            {selectedTextId && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  display: "flex",
                  flexDirection: "column",
                  height: { md: "60%", sm: "60%", xs: '100%' },
                  gap: 2,
                  alignItems: "center",
                  zIndex: 200,
                  bgcolor: "rgba(255,255,255)",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    updateTextElement(selectedTextId, {
                      bold: !textElements.find((t) => t.id === selectedTextId)
                        ?.bold,
                    })
                  }
                >
                  <FormatBold />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() =>
                    updateTextElement(selectedTextId, {
                      italic: !textElements.find((t) => t.id === selectedTextId)
                        ?.italic,
                    })
                  }
                >
                  <FormatItalic />
                </IconButton>

                {/* Font size input */}
                <TextField
                  size="small"
                  type="number"
                  variant="standard"
                  value={
                    textElements.find((t) => t.id === selectedTextId)
                      ?.fontSize || 20
                  }
                  onChange={(e) =>
                    updateTextElement(selectedTextId, {
                      fontSize: Number(e.target.value || 20),
                    })
                  }
                  sx={{ width: 70 }}
                  inputProps={{ min: 8, max: 200 }}
                  label="Size"
                />

                <Select
                  size="small"
                  value={
                    textElements
                      .find((t) => t.id === selectedTextId)
                      ?.fontFamily?.slice(0, 4) || "Arial"
                  }
                  onChange={(e) =>
                    updateTextElement(selectedTextId, {
                      fontFamily: String(e.target.value),
                    })
                  }
                  displayEmpty
                  sx={{ minWidth: 60 }}
                  renderValue={(v) => (v ? String(v) : "Family")}
                >
                  {/* Default / fallback option */}
                  <MenuItem value="Arial">Arial</MenuItem>

                  {/* Load Google font list */}
                  {GOOGLE_FONTS.map((f) => (
                    <MenuItem key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>

                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    bgcolor:
                      textElements.find((t) => t.id === selectedTextId)
                        ?.color || "#000000",
                    cursor: "pointer",
                    border: "2px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                  onClick={() =>
                    document.getElementById("hiddenColorInput")?.click()
                  }
                >
                  <input
                    id="hiddenColorInput"
                    type="color"
                    value={
                      textElements.find((t) => t.id === selectedTextId)
                        ?.color || "#000000"
                    }
                    onChange={(e) =>
                      updateTextElement(selectedTextId, {
                        color: e.target.value,
                      })
                    }
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: "absolute",
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }} />
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: "green",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#212121",
                    },
                  }}
                  onClick={() => {
                    setSelectedTextId(null);
                  }}
                >
                  <Check fontSize="large" />
                </IconButton>
              </Box>
            )}
            {/* File input for canvas elements */}
            <input
              type="file"
              accept="image/*"
              ref={canvasFileRef}
              style={{ display: "none" }}
              onChange={handleCanvasFileChange}
            />
            {/* Render all canvas elements as Rnd components */}
            {elements.map((el) => (
              <Rnd
                key={el.id}
                default={{
                  x: el.x,
                  y: el.y,
                  width: el.width,
                  height: el.height,
                }}
                bounds="parent"
                onDragStart={() => {
                  draggingRef.current = true;
                }}
                onDragStop={(_, d) => {
                  setElements((prev) =>
                    prev.map((p) =>
                      p.id === el.id ? { ...p, x: d.x, y: d.y } : p
                    )
                  );
                  setTimeout(() => (draggingRef.current = false), 50);
                }}
                onResizeStart={() => {
                  draggingRef.current = true;
                }}
                onResizeStop={(_, __, ref, ___, position) => {
                  setElements((prev) =>
                    prev.map((p) =>
                      p.id === el.id
                        ? {
                          ...p,
                          width: parseInt(ref.style.width, 10),
                          height: parseInt(ref.style.height, 10),
                          x: position.x,
                          y: position.y,
                        }
                        : p
                    )
                  );
                  setTimeout(() => (draggingRef.current = false), 50);
                }}
                style={{
                  borderRadius: 8,
                  backgroundColor: el.src ? "transparent" : "lightGray",
                  border:
                    selectedElementId === el.id
                      ? "2px solid #1976d2"
                      : "1px solid rgba(0,0,0,0.2)",
                  position: "absolute",
                  zIndex: selectedElementId === el.id ? 40 : 30,
                  overflow: "hidden",
                }}
                resizeHandleStyles={{
                  bottomRight: {
                    width: "15px",
                    height: "15px",
                    background: "white",
                    border: "2px solid #1976d2",
                    borderRadius: "10%",
                    right: "-5px",
                    bottom: "-5px",
                  },
                }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  if (draggingRef.current) return;
                  setSelectedElementId(el.id);
                  uploadToSelected(el.id);
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 99,
                    fontSize: 14,
                    transition: "opacity 0.2s",
                    "&:hover": {
                      opacity: 1,
                      backgroundColor: "rgba(0,0,0,0.8)",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setElements((prev) => prev.filter((p) => p.id !== el.id));
                    if (selectedElementId === el.id) {
                      setSelectedElementId(null);
                    }
                  }}
                >
                  ✕
                </Box>
                {el.src ? (
                  <Box
                    component="img"
                    src={el.src}
                    alt="uploaded"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <ImageRounded sx={{ color: "lightGray", fontSize: 40 }} />
                  </Box>
                )}
              </Rnd>
            ))}

            {/* Render text elements */}
            {textElements.map((t) => (
              <Rnd
                key={t.id}
                default={{ x: t.x, y: t.y, width: t.width, height: t.height }}
                bounds="parent"
                onDragStart={() => {
                  draggingRef.current = true;
                }}
                onDragStop={(_, d) => {
                  updateTextElement(t.id, { x: d.x, y: d.y });
                  setTimeout(() => (draggingRef.current = false), 50);
                }}
                onResizeStart={() => {
                  draggingRef.current = true;
                }}
                onResizeStop={(_, __, ref, ___, position) => {
                  updateTextElement(t.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    x: position.x,
                    y: position.y,
                  });
                  setTimeout(() => (draggingRef.current = false), 50);
                }}
                style={{
                  borderRadius: 8,
                  backgroundColor: "transparent",
                  border:
                    selectedTextId === t.id
                      ? "2px solid #1976d2"
                      : "1px solid rgba(0,0,0,0.06)",
                  position: "absolute",
                  zIndex: selectedTextId === t.id ? 50 : 30,
                  overflow: "hidden",
                }}
                resizeHandleStyles={{
                  bottomRight: {
                    width: "10px",
                    height: "10px",
                    background: "white",
                    borderRadius: "10%",
                    right: "-5px",
                    bottom: "-5px",
                  },
                }}
                onClick={() => {
                  if (draggingRef.current) return;
                  setSelectedTextId(t.id);
                  setSelectedElementId(null);
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1,
                    bgcolor: selectedTextId === t.id ? "white" : "transparent",
                  }}
                >
                  {selectedTextId === t.id ? (
                    <>
                      <TextField
                        multiline
                        value={t.text}
                        onChange={(e) =>
                          updateTextElement(t.id, { text: e.target.value })
                        }
                        variant="standard"
                        autoFocus
                        sx={{
                          width: "100%",
                          fontWeight: t.bold ? 700 : 400,
                          fontStyle: t.italic ? "italic" : "normal",
                          fontSize: t.fontSize,
                          fontFamily: t.fontFamily,
                          color: t.color,
                        }}
                        InputProps={{
                          disableUnderline: true,
                          style: {
                            fontWeight: t.bold ? 700 : 400,
                            fontStyle: t.italic ? "italic" : "normal",
                            fontSize: t.fontSize,
                            fontFamily: t.fontFamily,
                            color: t.color,
                          },
                        }}
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setTextElements((prev) =>
                            prev.filter((el) => el.id !== t.id)
                          );
                          setSelectedTextId(null);
                        }}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bgcolor: "black",
                          color: "white",
                          width: 25,
                          height: 25,
                          zIndex: 2,
                          "&:hover": {
                            bgcolor: "red",
                          },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <Typography
                      sx={{
                        fontWeight: t.bold ? 700 : 400,
                        fontStyle: t.italic ? "italic" : "normal",
                        fontSize: t.fontSize,
                        fontFamily: t.fontFamily,
                        color: t.color,
                        textAlign: "center",
                        width: "100%",
                        position: "relative",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        bgcolor: "transparent",
                      }}
                    >
                      {t.text}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextId(t.id);
                          setSelectedElementId(null);
                        }}
                        sx={{ position: "absolute", top: -15, right: -8 }}
                      >
                        <Edit color="info" />
                      </IconButton>
                    </Typography>
                  )}
                </Box>
              </Rnd>
            ))}


            {/* render Sticker */}
            {stickerElements.map((st) => (
              <Rnd
                key={st.id}
                default={{
                  x: st.x,
                  y: st.y,
                  width: st.width,
                  height: st.height,
                }}
                bounds="parent"
                onDragStop={(_, d) =>
                  setStickerElements((prev) =>
                    prev.map((s) => (s.id === st.id ? { ...s, x: d.x, y: d.y } : s))
                  )
                }
                onResizeStop={(_, __, ref, ___, pos) =>
                  setStickerElements((prev) =>
                    prev.map((s) =>
                      s.id === st.id
                        ? {
                          ...s,
                          width: parseInt(ref.style.width),
                          height: parseInt(ref.style.height),
                          x: pos.x,
                          y: pos.y,
                        }
                        : s
                    )
                  )
                }
                onClick={() => {
                  // optional: bring sticker to top when clicked
                  setStickerElements((prev) =>
                    prev.map((s) =>
                      s.id === st.id
                        ? { ...s, zIndex: prev.length + 2 }
                        : s
                    )
                  );
                }}
                style={{
                  borderRadius: 8,
                  border:
                    "2px solid #1976d2",
                  position: "absolute",
                  overflow: "hidden",
                  zIndex: st.zIndex,
                }}
                resizeHandleStyles={{
                  bottomRight: {
                    width: "15px",
                    height: "15px",
                    background: "white",
                    border: "2px solid #1976d2",
                    borderRadius: "10%",
                    right: "-5px",
                    bottom: "-5px",
                  },
                }}
              >
                <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                  <Box
                    component="img"
                    src={st.sticker}
                    alt="sticker"
                    sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                  <IconButton
                    onClick={() =>
                      setStickerElements((prev) => prev.filter((s) => s.id !== st.id))
                    }
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bgcolor: "black",
                      color: "white",
                      width: 24,
                      height: 24,
                      "&:hover": { bgcolor: "red" },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Rnd>
            ))}

          </Box>
          {/* Editor Element */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            width: 60,
            display: 'flex',
            gap: 1,
            borderBottom: '1px solid gray',
            flexDirection: 'column',
            height: '100%',
            bgcolor: 'transparent',
            right: -70,
            boxShadow: 4,
            borderRadius: 2
          }}>
            <IconButton
              // sx={editingButtonStyle}
              onClick={handleAddImage}
              aria-label="Layout"
            >
              <CollectionsOutlined fontSize="large" />
            </IconButton>
            <IconButton
              // sx={editingButtonStyle}
              onClick={handleAddText}
            >
              <TextFieldsOutlined fontSize="large" />

            </IconButton>
            <IconButton
              // sx={editingButtonStyle}
              onClick={() => setShowEmojiPopup(true)}
            >
              <MoodOutlined fontSize="large" />
            </IconButton>
            <IconButton
            // sx={editingButtonStyle}
            //  onClick={() => togglePopup("layout")}
            >
              <CategoryOutlined fontSize="large" />
            </IconButton>
          </Box>
          <Box sx={{ position: "absolute", top: 0, right: 110 }}>
            {
              showEmojiPopup && (
                <PopupWrapper
                  title="Choose Emoji"
                  open={showEmojiPopup}
                  onClose={() => setShowEmojiPopup(false)}
                  sx={{
                    height: "700px",
                    width: 200,
                  }}
                >
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        height: "6px",
                        width: "5px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "#f1f1f1",
                        borderRadius: "20px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: COLORS.primary,
                        borderRadius: "20px",
                      },
                      height: 500,
                    }}
                  >
                    {STICKERS_DATA.map((stick) => (
                      <Box
                        key={stick.id}
                        onClick={() => handleSelectSticker(stick.sticker)}
                        sx={{
                          width: { md: "70px", sm: "70px", xs: "70px" },
                          height: "70px",
                          borderRadius: 2,
                          bgcolor: "rgba(233, 232, 232, 1)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "white",
                          userSelect: "none",
                        }}
                      >
                        <Box
                          component={"img"}
                          src={stick.sticker}
                          sx={{ width: "100%", height: "auto" }}
                        />
                      </Box>
                    ))}
                  </Box>
                </PopupWrapper>
              )
            }
          </Box>

        </Box>

      </Box >

    </>
  );
};

export default FirstSlide;
