import { useEffect, useRef } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import {
  Close,
  Forward10,
  Forward30,
  TitleOutlined,
} from "@mui/icons-material";
import QrGenerator from "../QR-code/Qrcode";
import { Rnd } from "react-rnd";
import { COLORS } from "../../constant/color";
import { useSlide2 } from "../../context/Slide2Context";

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
  size: { width: 200, height: 30 },
  isEditing: false,
});

interface SlideSpreadProps {
  textAlign?: "start" | "center" | "end";
  rotation?: number;
  togglePopup: (name: string | null) => void;
  activePopup?: string | null;
  activeIndex?: number;
  addTextRight?: number;
  rightBox?: boolean;
}

const SlideSpread = ({
  activeIndex,
  addTextRight,
  rightBox,
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
  } = useSlide2();

  const rightBoxRef = useRef<HTMLDivElement>(null);
  // Add this handler to initialize draggable state for images (omitted for brevity)
  useEffect(() => {
    if (images.length > 0) {
      setDraggableImages((prev: any) => {
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

        return [...stillValid, ...newOnes];
      });
    } else {
      setDraggableImages([]);
    }
  }, [images, setDraggableImages]);

  // Function to add new text element
  const addNewTextElement = () => {
    const newTextElement = createNewTextElement({
      fontSize,
      fontWeight,
      fontColor,
      fontFamily,
      textAlign,
      rotation,
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
    if (multipleTextValue && texts.length === 0) {
      setMultipleTextValue(true); // hide layout
    }
  }, [texts, multipleTextValue]);

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
            opacity: isSlideActive ? 1 : 0.6,
            pointerEvents: isSlideActive ? "auto" : "none",
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
          {textElements.map((textElement) => (
            <Rnd
              key={textElement.id}
              size={{
                width: textElement.size.width,
                height: textElement.size.height,
              }}
              position={{
                x: textElement.position.x,
                y: textElement.position.y,
              }}
              bounds="parent"
              // ✅ Allow dragging only when not editing
              disableDragging={!!textElement.isEditing}
              // ✅ Enable resizing only from bottom-right corner
              enableResizing={{
                bottomRight: true,
                bottom: false,
                bottomLeft: false,
                left: false,
                right: false,
                top: false,
                topLeft: false,
                topRight: false,
              }}
              // ✅ Styling for the resize handle
              resizeHandleStyles={{
                bottomRight: {
                  width: "12px",
                  height: "12px",
                  background: "white",
                  border: "2px solid #1976d2",
                  borderRadius: "3px",
                  right: "-6px",
                  bottom: "-6px",
                  cursor: "se-resize",
                  zIndex: 5,
                },
              }}
              // ✅ Update position and size on move/resize
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
              style={{
                zIndex: textElement.zIndex,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #4a7bd5",
                transition: "border 0.2s ease",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  pointerEvents: "auto",
                  display: "flex",
                  justifyContent:
                    textElement.textAlign === "top"
                      ? "flex-start"
                      : textElement.textAlign === "end"
                      ? "flex-end"
                      : "center",
                  alignItems:
                    textElement.verticalAlign === "top"
                      ? "flex-start"
                      : textElement.verticalAlign === "bottom"
                      ? "flex-end"
                      : "center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTextId(textElement.id);
                }}
              >
                {/* Close (delete) icon */}
                <IconButton
                  size="small"
                  onClick={() => deleteTextElement(textElement.id)}
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    bgcolor: "#1976d2",
                    color: "white",
                    width: 20,
                    height: 20,
                    "&:hover": { bgcolor: "#f44336" },
                    zIndex: 5,
                    display: "flex",
                    justifyContent: "center",
                    m: "auto",
                    alignItems: "center",
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>

                {/* Editable text */}
                <TextField
                  variant="standard"
                  value={textElement.value}
                  placeholder="Add Text"
                  autoFocus
                  onChange={(e) =>
                    updateTextElement(textElement.id, { value: e.target.value })
                  }
                  onFocus={() =>
                    updateTextElement(textElement.id, { isEditing: true })
                  }
                  onBlur={() =>
                    updateTextElement(textElement.id, { isEditing: false })
                  }
                  InputProps={{
                    disableUnderline: true,
                    style: {
                      fontSize: textElement.fontSize,
                      fontWeight: textElement.fontWeight,
                      color: textElement.fontColor,
                      fontFamily: textElement.fontFamily,
                      transform: `rotate(${textElement.rotation}deg)`,
                      padding: "0px",
                      width: "100%",
                      height: "100%",
                      // textAlign: textElement.textAlign || "center",
                      resize: "none",
                    },
                  }}
                  multiline
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input": {
                      textAlign: textElement.textAlign || "center",
                      overflowY: "auto",
                    },
                  }}
                />
              </Box>
            </Rnd>
          ))}

          {selectedVideoUrl && (
            <Rnd
              cancel=".no-drag"
              onDragStop={(_, d) =>
                setQrPosition((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                  zIndex: qrPosition.zIndex, // Bring to front on drag
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
              }}
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
                    width: "100%",
                    height: 200,
                    position: "relative",
                    pointerEvents: "none",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 59,
                    height: 10,
                    width: 10,
                    left: 55,
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
                      right: 25,
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
            </Rnd>
          )}

          {selectedAudioUrl && (
            <Rnd
              cancel=".no-drag"
              onDragStop={(_, d) =>
                setQrAudioPosition((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                  zIndex: qrAudioPosition.zIndex, // Bring to front on drag
                }))
              }
              onResizeStop={(_, __, ref, ___, position) => {
                setQrAudioPosition((prev) => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrAudioPosition.zIndex, // Bring to front on resize
                }));
              }}
              bounds="parent"
              enableResizing={false}
              style={{
                padding: "10px",
              }}
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
                    top: 62,
                    height: 10,
                    width: 10,
                    left: 62,
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
                      right: 25,
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
            </Rnd>
          )}

          {draggableImages
            .filter((img: any) => selectedImg.includes(img.id))
            .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
            .map(
              ({ id, src, x, y, width, height, zIndex, rotation = 0 }: any) => (
                <Rnd
                  key={id}
                  size={{ width, height }}
                  position={{ x, y }}
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
                  // Keep Rnd itself unrotated so drag/resize math remains correct
                  style={{
                    zIndex: zIndex || 1,
                    boxSizing: "border-box",
                    borderRadius: 8,
                  }}
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
                    },
                  }}
                >
                  {/* content wrapper fills the Rnd area */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      overflow: "visible", // allow rotated corners to show
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* rotated inner wrapper — rotate image visually */}
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "block",
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
                          objectFit: "fill", // or 'contain' / 'cover' depending on what you want
                          display: "block",
                        }}
                      />
                    </Box>

                    {/* rotate right button */}
                    <Box
                      onClick={() =>
                        setDraggableImages((prev) =>
                          prev.map((img) =>
                            img.id === id
                              ? { ...img, rotation: (img.rotation || 0) + 15 }
                              : img
                          )
                        )
                      }
                      sx={{
                        position: "absolute",
                        top: -20,
                        left: 0,
                        bgcolor: "black",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: "2px",
                        zIndex: 99,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#333" },
                      }}
                    >
                      <Forward30 fontSize="small" />
                    </Box>

                    {/* close / deselect */}
                    <Box
                      onClick={() =>
                        setSelectedImage((prev) => prev.filter((i) => i !== id))
                      }
                      sx={{
                        position: "absolute",
                        top: -20,
                        right: 0,
                        bgcolor: "black",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: "2px",
                        zIndex: 99,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#333" },
                      }}
                    >
                      <Close fontSize="small" />
                    </Box>
                  </Box>
                </Rnd>
              )
            )}

          {showOneTextRightSideBox && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: { md: "370px", sm: "370px", xs: "100%" },
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
                  setOneTextValue("");
                  if (typeof setShowOneTextRightSideBox === "function") {
                    setShowOneTextRightSideBox(false);
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
                        lineHeight: "35px",
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
                height: "97%",
                width: { md: "375px", sm: "375px", xs: "90%" },
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
                    height: "175px",
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
                    onClick={() =>
                      setTexts((prev) => prev.filter((_, i) => i !== index))
                    }
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
                          color: textObj.fontColor1,
                          fontFamily: textObj.fontFamily,
                          textAlign: textObj.textAlign,
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

          {selectedStickers2.map((sticker, index) => (
            <Rnd
              key={sticker.id || index + 1}
              size={{ width: sticker.width, height: sticker.height }}
              position={{ x: sticker.x, y: sticker.y }}
              onDragStop={(_, d) =>
                updateSticker2(index + 1, {
                  x: d.x,
                  y: d.y,
                  zIndex: sticker.zIndex,
                })
              }
              onResizeStop={(_, __, ref, ___, position) =>
                updateSticker2(index + 1, {
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: sticker.zIndex,
                })
              }
              bounds="parent"
              enableResizing={{
                bottomRight: true,
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
                },
              }}
              style={{
                zIndex: sticker.zIndex,
                position: "absolute",
              }}
            >
              {/* Make inner box fill Rnd */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}
              >
                {/* Sticker image fills its container */}
                <Box
                  component="img"
                  src={sticker.sticker}
                  sx={{
                    width: "100%", // ✅ dynamic with Rnd
                    height: "100%", // ✅ dynamic with Rnd
                    objectFit: "contain", // or "cover" if you want
                    transform: `rotate(${sticker.rotation || 0}deg)`,
                    transition: "transform 0.2s",
                    border: "1px solid #1976d2",
                    pointerEvents: "none",
                  }}
                />

                {/* Control buttons */}
                <IconButton
                  size="small"
                  onClick={() => removeSticker2(index + 1)}
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -10,
                    bgcolor: "black",
                    color: "white",
                    p: 1,
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

                <IconButton
                  size="small"
                  onClick={() =>
                    updateSticker2(index + 1, {
                      rotation: ((sticker.rotation || 0) + 15) % 360,
                    })
                  }
                  sx={{
                    position: "absolute",
                    top: -8,
                    left: -5,
                    bgcolor: "black",
                    color: "white",
                    p: 1,
                    width: 25,
                    height: 25,
                    zIndex: 2,
                    "&:hover": {
                      bgcolor: "blue",
                    },
                  }}
                >
                  <Forward10 fontSize="small" />
                </IconButton>
              </Box>
            </Rnd>
          ))}

          {/* default image popup */}
          {/* <Rnd
            bounds="parent"
            enableResizing={{
              bottomRight: true,
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
              },
            }}
            style={{
              position: "absolute",
            }}
            default={{
              x: 180,
              y: 400,
              width: 200,
              height: 180,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px dashed #1976d2",
              }}
            >
              <Box
                component="img"
                src="/assets/images/animated-banner.jpg"
                alt="Sticker"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "4px",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#090155ff",
                  background: "rgba(26, 26, 26, 0.14)",
                  pointerEvents: "auto",
                  zIndex: 2,
                }}
              >
                <IconButton onClick={() => togglePopup("photo")}>
                  <AddCircleOutline sx={{ color: "black", fontSize: "35px" }} />
                </IconButton>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Add Photo
                </Typography>
              </Box>
            </Box>
          </Rnd> */}
        </Box>
      )}
    </Box>
  );
};

export default SlideSpread;
