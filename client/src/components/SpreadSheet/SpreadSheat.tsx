import { useEffect, useRef } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import { Close, Forward10, TitleOutlined } from "@mui/icons-material";
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
  size: { width: 200, height: 20 },
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
}: SlideSpreadProps) => {
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
              }
            : t
        )
      );
    }
  }, [fontSize, fontFamily, fontWeight, fontColor]);

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
                  backgroundColor: "rgba(105, 105, 105, 0.51)",
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
              onDragStop={(_, d) => {
                updateTextElement(textElement.id, {
                  position: { x: d.x, y: d.y },
                  zIndex: 2001,
                });
              }}
              onResizeStop={(_, __, ref, ___, position) => {
                updateTextElement(textElement.id, {
                  size: {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                  },
                  position: { x: position.x, y: position.y },
                  zIndex: 2001,
                });
              }}
              minWidth={100}
              minHeight={30}
              bounds="parent"
              disableDragging={!!textElement.isEditing}
              style={{
                zIndex: textElement.zIndex,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "move",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  pointerEvents: "auto",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTextId(textElement.id);
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => deleteTextElement(textElement.id)}
                  sx={{
                    position: "absolute",
                    top: -12,
                    right: -12,
                    bgcolor: COLORS.primary,
                    color: "white",
                    "&:hover": { bgcolor: "#f44336" },
                    zIndex: textElement.zIndex + 1,
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>

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
                      textAlign: "center",
                      transform: `rotate(${textElement.rotation}deg)`,
                      border: "3px dashed #3a7bd5",
                      padding: "10px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "move",
                    },
                  }}
                  multiline
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    "& .MuiInputBase-input": {
                      overflowY: "auto",
                      textAlign:'center',
                    },
                  }}
                />
              </Box>
            </Rnd>
          ))}

          {/* Existing Rnd components for QR codes and images... (omitted for brevity) */}
          {/* {selectedVideoUrl && (
            <Rnd
              size={{ width: qrPosition.width, height: qrPosition.height }}
              position={{ x: qrPosition.x, y: qrPosition.y }}
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
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrPosition.zIndex, // Bring to front on resize
                }));
              }}
              bounds="parent"
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              style={{ zIndex: qrPosition.zIndex }} // Apply zIndex from qrPosition
            >
              <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                <QrGenerator
                  url={selectedVideoUrl}
                  style={{ width: "100%", height: "100%" }} // Removed static zIndex from QrGenerator
                  size={Math.min(qrPosition.width, qrPosition.height)}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 20,
                    height: 20,
                    zIndex: 2,
                    // zIndex: qrPosition.zIndex + 1, // Higher zIndex for close button
                    bgcolor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": { bgcolor: "black", color: "white" },
                  }}
                  onClick={() => setSelectedVideoUrl(null)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Rnd>
          )}

          {selectedAudioUrl && (
            <Rnd
              size={{
                width: qrAudioPosition.width,
                height: qrAudioPosition.height,
              }}
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
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              style={{ zIndex: qrAudioPosition.zIndex }} // Apply zIndex from qrPosition
            >
              <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                <QrGenerator
                  url={selectedAudioUrl}
                  style={{ width: "100%", height: "100%" }} // Removed static zIndex from QrGenerator
                  size={Math.min(qrAudioPosition.width, qrAudioPosition.height)}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 20,
                    height: 20,
                    zIndex: 2,
                    bgcolor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": { bgcolor: "black", color: "white" },
                  }}
                  onClick={() => setSelectedAudioUrl(null)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Rnd>
          )} */}

          {selectedVideoUrl && (
            <Rnd
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
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrPosition.zIndex, // Bring to front on resize
                }));
              }}
              bounds="parent"
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
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
                  src="/assets/images/QR-tips.jpg"
                  sx={{
                    width: "100%",
                    height: 200,
                    position: "relative",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 46,
                    height: 100,
                    width: 100,
                    borderRadius: 2,
                    ml: "10px",
                    // bgcolor:'red',
                    p: 1,
                  }}
                >
                  <QrGenerator
                    url={selectedVideoUrl}
                    size={Math.min(qrPosition.width, qrPosition.height)}
                  />
                </Box>
                <IconButton
                  onClick={() => setSelectedVideoUrl(null)}
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
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
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
                  src="/assets/images/QR-tips.jpg"
                  sx={{
                    width: "100%",
                    height: 200,
                    position: "relative",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 46,
                    height: 100,
                    width: 100,
                    borderRadius: 2,
                    ml: "10px",
                    // bgcolor:'red',
                    p: 1,
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
                <IconButton
                  onClick={() => setSelectedAudioUrl(null)}
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
            .map(({ id, src, x, y, width, height, zIndex }: any) => (
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
                style={{ zIndex: zIndex || 1 }}
                onResizeStop={(_, __, ref, ___, position) => {
                  const newWidth = parseInt(ref.style.width);
                  console.log(newWidth, "-");
                  const newHeight = parseInt(ref.style.height);
                  console.log(newHeight, "-height");
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
              >
                <Box sx={{ position: "relative", m: "2px" }}>
                  <img
                    src={src}
                    alt="Uploaded"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 8,
                      pointerEvents: "none",
                      objectFit: "cover",
                    }}
                  />
                  {/* Close Button to unselect this image */}
                  <Box
                    onClick={() =>
                      setSelectedImage((prev) => prev.filter((i) => i !== id))
                    }
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
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
            ))}

          {showOneTextRightSideBox && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "370px",
                border: "3px dashed #3a7bd5",
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
                height: "100%",
                width: "375px",
                borderRadius: "6px",
                p: 1,
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
                    display: "flex",
                    justifyContent:
                      verticalAlign === "top"
                        ? "flex-start"
                        : verticalAlign === "center"
                        ? "center"
                        : "flex-end",
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
                      // rows={1}
                      variant="standard"
                      value={textObj.value}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts((prev) =>
                          prev.map((t, i) =>
                            i === index ? { ...t, value: newValue } : t
                          )
                        );
                      }}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          display: "flex",
                          // height:'40px',
                          justifyContent: "center",
                          alignItems: "center",
                          "& textarea": {
                            width: "100%",
                            resize: "none",
                            display: "flex",
                            overflow: "hidden",
                            textAlign: "center",
                            fontSize: textObj.fontSize,
                            fontWeight: textObj.fontWeight,
                            color: textObj.fontColor,
                            fontFamily: textObj.fontFamily,
                          },
                        },
                      }}
                    />
                  ) : (
                    <Box
                      onClick={() => {
                        setEditingIndex(index);
                        setFontSize(textObj.fontSize);
                        setFontFamily(textObj.fontFamily);
                        setFontWeight(textObj.fontWeight);
                        setFontColor(textObj.fontColor);
                      }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mx: "auto",
                        cursor: "pointer",
                        color: "#212121",
                        borderRadius: "6px",
                      }}
                    >
                      <TitleOutlined />
                      <Typography
                        sx={{
                          fontSize: textObj.fontSize,
                          fontWeight: textObj.fontWeight,
                          color: textObj.fontColor,
                          fontFamily: textObj.fontFamily,
                        }}
                      >
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
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              style={{
                zIndex: 10,
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Box
                  component={"img"}
                  src={`${selectedAIimageUrl2}`}
                  alt={`isAIImage${selectedAIimageUrl2}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    // objectFit:'cover'
                  }}
                />
                <IconButton
                  onClick={() => {
                    if (setIsAIimage2) {
                      setIsAIimage2(false);
                    }
                  }}
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
              key={sticker.id || index}
              size={{ width: sticker.width, height: sticker.height }}
              position={{ x: sticker.x, y: sticker.y }}
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
              bounds="parent"
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              style={{
                zIndex: sticker.zIndex,
                position: "absolute",
              }}
            >
              <Box position={"relative"} width={10} bgcolor={"red"}>
                <Box
                  key={index}
                  component="img"
                  src={sticker.sticker}
                  sx={{
                    position: "absolute",
                    width: "100px",
                    height: "auto",
                    transform: `rotate(${sticker.rotation || 0}deg)`,
                    transition: "transform 0.2s",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    position: "absolute",
                    width: "90px",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => removeSticker2(index)}
                    sx={{
                      position: "absolute",
                      top: -4,
                      right: -24,
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
                      updateSticker2(index, {
                        rotation: ((sticker.rotation || 0) + 15) % 360,
                      })
                    }
                    sx={{
                      position: "absolute",
                      top: -4,
                      left: 0,
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
              </Box>
            </Rnd>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SlideSpread;
