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
import { useSlide3 } from "../../context/Slide3Context";

// Helper function to create a new text element
const createNewTextElement3 = (defaults: any) => ({
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

interface SpreadRightSideProps {
  textAlign?: "start" | "center" | "end";
  rotation?: number;
  togglePopup: (name: string | null) => void;
  activePopup?: string | null;
  activeIndex?: number;
  addTextRight?: number;
  rightBox?: boolean;
}

const SpreadRightSide = ({
  activeIndex,
  addTextRight,
  rightBox,
}: SpreadRightSideProps) => {
  const {
    images3,
    selectedImg3,
    setSelectedImage3,
    showOneTextRightSideBox3,
    oneTextValue3,
    setOneTextValue3,
    multipleTextValue3,
    texts3,
    editingIndex3,
    setEditingIndex3,
    fontSize3,
    fontWeight3,
    fontColor3,
    textAlign3,
    verticalAlign3,
    rotation3,
    setTexts3,
    setShowOneTextRightSideBox3,
    fontFamily3,
    // New individual text management
    textElements3,
    setTextElements3,
    selectedTextId3,
    setSelectedTextId3,
    setMultipleTextValue3,
    isSlideActive3,
    setFontSize3,
    setFontColor3,
    setFontWeight3,
    setFontFamily3,
    selectedVideoUrl3,
    setSelectedVideoUrl3,
    draggableImages3,
    setDraggableImages3,
    qrPosition3,
    setQrPosition3,
    setSelectedAudioUrl3,
    selectedAudioUrl3,
    qrAudioPosition3,
    setQrAudioPosition3,
    isAIimage3,
    setIsAIimage3,
    selectedAIimageUrl3,

    selectedStickers3,
    updateSticker3,
    removeSticker3,
    aimage3,
    setAIImage3,
  } = useSlide3();

  const rightBoxRef = useRef<HTMLDivElement>(null);

  // Add this handler to initialize draggable state for images (omitted for brevity)
  useEffect(() => {
    if (images3.length > 0) {
      setDraggableImages3((prev: any) => {
        const existingIds = prev.map((img: any) => img.id);
        const newOnes = images3
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
          images3.some((incoming) => incoming.id === img.id)
        );

        return [...stillValid, ...newOnes];
      });
    } else {
      setDraggableImages3([]);
    }
  }, [images3, setDraggableImages3]);

  // Function to add new text element
  const addNewTextElement = () => {
    const newTextElement = createNewTextElement3({
      fontSize3,
      fontWeight3,
      fontColor3,
      fontFamily3,
      textAlign3,
      rotation3,
      zIndex: textElements3.length + 1,
    });
    setTextElements3((prev: any) => [...prev, newTextElement]);
    setSelectedTextId3(newTextElement.id);
  };

  // Add Texts in screen
  useEffect(() => {
    if (addTextRight) {
      addNewTextElement();
    }
  }, [addTextRight, addTextRight]);

  // Function to update individual text element
  const updateTextElement = (id: string, updates: Partial<any>) => {
    setTextElements3((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updates } : text))
    );
  };

  // Function to delete text element
  const deleteTextElement = (id: string) => {
    setTextElements3((prev) => prev.filter((text) => text.id !== id));
    if (selectedTextId3 === id) {
      setSelectedTextId3(null);
    }
  };

  // 👇 Auto-reset multipleTextValue when all multiple texts are deleted
  useEffect(() => {
    if (multipleTextValue3 && texts3.length === 0) {
      setMultipleTextValue3(true); // hide layout
    }
  }, [texts3, multipleTextValue3]);

  // ✅ Place this useEffect HERE (below your state definitions)
  useEffect(() => {
    if (editingIndex3 !== null && editingIndex3 !== undefined) {
      setTexts3((prev) =>
        prev.map((t, i) =>
          i === editingIndex3
            ? {
                ...t,
                fontSize3,
                fontWeight3,
                fontColor3,
                fontFamily3,
              }
            : t
        )
      );
    }
  }, [fontSize3, fontFamily3, fontWeight3, fontColor3]);

  useEffect(() => {
    if (selectedVideoUrl3) {
      setQrPosition3((prev) => ({
        ...prev,
        url: selectedVideoUrl3,
      }));
    }
  }, [selectedVideoUrl3]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: "5px",
        position: "relative",
      }}
    >
      {activeIndex === 2 && rightBox && (
        <Box
          ref={rightBoxRef}
          sx={{
            flex: 1,
            zIndex: 10,
            p: 2,
            position: "relative",
            opacity: isSlideActive3 ? 1 : 0.6,
            pointerEvents: isSlideActive3 ? "auto" : "none",
            "&::after": !isSlideActive3
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
          {textElements3.map((textElement) => (
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
                  zIndex: 2001, // Bring to front on drag
                });
              }}
              onResizeStop={(_, __, ref, ___, position) => {
                updateTextElement(textElement.id, {
                  size: {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                  },
                  position: { x: position.x, y: position.y },
                  zIndex: 2001, // Bring to front on resize
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
                  setSelectedTextId3(textElement.id);
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
                      // textAlign: textElement.textAlign || "center",
                      transform: `rotate(${textElement.rotation}deg)`,
                      border:
                        selectedTextId3 === textElement.id
                          ? "3px dashed #3a7bd5"
                          : "3px dashed transparent",
                      padding: "10px",
                      width: "100%",
                      height: "100%",
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
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    "& .MuiInputBase-input": {
                      height: "100% !important",
                      overflowY: "auto",
                      textAlign: textElement.textAlign || "center",
                    },
                  }}
                />
              </Box>
            </Rnd>
          ))}

          {selectedVideoUrl3 && (
            <Rnd
              onDragStop={(_, d) =>
                setQrPosition3((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                  zIndex: qrPosition3.zIndex, // Bring to front on drag
                }))
              }
              onResizeStop={(_, __, ref, ___, position) => {
                setQrPosition3((prev) => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrPosition3.zIndex, // Bring to front on resize
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
                    url={selectedVideoUrl3}
                    size={Math.min(qrPosition3.width, qrPosition3.height)}
                  />
                </Box>
                <IconButton
                  onClick={() => setSelectedVideoUrl3(null)}
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

          {selectedAudioUrl3 && (
            <Rnd
              onDragStop={(_, d) =>
                setQrAudioPosition3((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                  zIndex: qrAudioPosition3.zIndex,
                }))
              }
              onResizeStop={(_, __, ref, ___, position) => {
                setQrAudioPosition3((prev) => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrAudioPosition3.zIndex,
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
                    url={selectedAudioUrl3}
                    size={Math.min(
                      qrAudioPosition3.width,
                      qrAudioPosition3.height
                    )}
                  />
                </Box>
                <IconButton
                  onClick={() => setSelectedAudioUrl3(null)}
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

          {draggableImages3
            .filter((img: any) => selectedImg3.includes(img.id))
            .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
            .map(
              ({ id, src, x, y, width, height, zIndex, rotation = 0 }: any) => (
                <Rnd
                  key={id}
                  size={{ width, height }}
                  position={{ x, y }}
                  onDragStop={(_, d) => {
                    setDraggableImages3((prev) =>
                      prev.map((img) =>
                        img.id === id ? { ...img, x: d.x, y: d.y } : img
                      )
                    );
                  }}
                  onResizeStop={(_, __, ref, ___, position) => {
                    const newWidth = parseInt(ref.style.width);
                    const newHeight = parseInt(ref.style.height);

                    setDraggableImages3((prev) =>
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
                        setDraggableImages3((prev) =>
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
                        setSelectedImage3((prev) =>
                          prev.filter((i) => i !== id)
                        )
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

          {showOneTextRightSideBox3 && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: { md: "370px", sm: "370px", xs: "100%" },
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
                  setOneTextValue3("");
                  if (typeof setShowOneTextRightSideBox3 === "function") {
                    setShowOneTextRightSideBox3(false);
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
                    verticalAlign3 === "top"
                      ? "flex-start"
                      : verticalAlign3 === "center"
                      ? "center"
                      : "flex-end",
                }}
              >
                <TextField
                  variant="standard"
                  value={oneTextValue3}
                  onChange={(e) => setOneTextValue3(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      "& .MuiInputBase-input": {
                        fontSize: fontSize3,
                        fontWeight: fontWeight3,
                        color: fontColor3,
                        fontFamily: fontFamily3,
                        textAlign: textAlign3,
                        transform: `rotate(${rotation3}deg)`,
                        lineHeight: "50px",
                      },
                    },
                  }}
                  autoFocus
                  multiline
                  fullWidth
                  sx={{
                    width: "100%",
                  }}
                />
              </Box>
            </Box>
          )}

          {multipleTextValue3 && (
            <Box
              sx={{
                height: "100%",
                width: { md: "375px", sm: "375px", xs: "100%" },
                borderRadius: "6px",
                p: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent:
                  verticalAlign3 === "top"
                    ? "flex-start"
                    : verticalAlign3 === "center"
                    ? "center"
                    : "flex-end",
              }}
            >
              {texts3.map((textObj, index) => (
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
                      verticalAlign3 === "top"
                        ? "flex-start"
                        : verticalAlign3 === "center"
                        ? "center"
                        : "flex-end",
                    alignItems:
                      verticalAlign3 === "top"
                        ? "flex-start"
                        : verticalAlign3 === "center"
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
                      setTexts3((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Close />
                  </IconButton>

                  {editingIndex3 === index ? (
                    <TextField
                      autoFocus
                      fullWidth
                      multiline
                      // rows={1}
                      variant="standard"
                      value={textObj.value}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts3((prev) =>
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
                            fontSize: textObj.fontSize3,
                            fontWeight: textObj.fontWeight3,
                            color: textObj.fontColor3,
                            fontFamily: textObj.fontFamily3,
                          },
                        },
                      }}
                    />
                  ) : (
                    <Box
                      onClick={() => {
                        setEditingIndex3(index);
                        setFontSize3(textObj.fontSize3);
                        setFontFamily3(textObj.fontFamily3);
                        setFontWeight3(textObj.fontWeight3);
                        setFontColor3(textObj.fontColor3);
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
                          fontSize: textObj.fontSize3,
                          fontWeight: textObj.fontWeight3,
                          color: textObj.fontColor3,
                          fontFamily: textObj.fontFamily3,
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

          {isAIimage3 && (
            <Rnd
              size={{ width: aimage3.width, height: aimage3.height }}
              position={{ x: aimage3.x, y: aimage3.y }}
              onDragStop={(_, d) =>
                setAIImage3((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                }))
              }
              onResizeStop={(_, __, ref, ___, position) =>
                setAIImage3({
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
                  src={`${selectedAIimageUrl3}`}
                  alt={`isAIImage${selectedAIimageUrl3}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    // objectFit:'cover'
                  }}
                />
                <IconButton
                  onClick={() => {
                    if (setIsAIimage3) {
                      setIsAIimage3(false);
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

          {selectedStickers3.map((sticker, index) => (
            <Rnd
              key={sticker.id || index}
              size={{ width: sticker.width, height: sticker.height }}
              position={{ x: sticker.x, y: sticker.y }}
              onDragStop={(_, d) =>
                updateSticker3(index, {
                  x: d.x,
                  y: d.y,
                  zIndex: sticker.zIndex,
                })
              }
              onResizeStop={(_, __, ref, ___, position) =>
                updateSticker3(index, {
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
                    pointerEvents: "none",
                  }}
                />

                {/* Control buttons */}
                <IconButton
                  size="small"
                  onClick={() => removeSticker3(index)}
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
                    updateSticker3(index, {
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
            </Rnd>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SpreadRightSide;
