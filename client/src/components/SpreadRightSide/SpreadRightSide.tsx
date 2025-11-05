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
import { motion } from "framer-motion";

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
  size: { width: 200, height: 40 },
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
    setVerticalAlign3,
    setTextAlign3,
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

    lineHeight3,
    letterSpacing3
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
       fontSize:16,
      fontWeight:400,
      fontColor:"#000000",
      fontFamily:"Roboto",
      textAlign:"center",
      rotation:0,
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
              textAlign3,
              verticalAlign3,
            }
            : t
        )
      );
    }
  }, [
    fontSize3,
    fontFamily3,
    fontWeight3,
    fontColor3,
    textAlign3,
    verticalAlign3,
  ]);

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

          {
            multipleTextValue3 || showOneTextRightSideBox3 ? null : (
              <>
                {textElements3.map((textElement) => {
                  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
                  // Fallbacks to avoid undefined alignment
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

                  return (
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
                      enableResizing={{
                        bottomRight: true,
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
                          zIndex: 10,
                        },
                      }}
                      style={{
                        zIndex: textElement.zIndex,
                        display: "flex",
                        alignItems: vAlign, // ✅ vertical alignment applied here
                        justifyContent: hAlign, // ✅ horizontal alignment applied here
                        border: "1px dashed #4a7bd5",
                        touchAction: "none",
                        transition: "border 0.2s ease",
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
                    >
                      <Box
                        onDoubleClick={() =>
                          updateTextElement(textElement.id, { isEditing: true })
                        }
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: vAlign, // ✅ vertical alignment
                          justifyContent: hAlign, // ✅ horizontal alignment
                          touchAction: "manipulation",
                          cursor: textElement.isEditing ? "text" : "move",
                        }}
                      >
                        {/* Close Button */}
                        <IconButton
                          size="small"
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
                            width: isMobile ? 28 : 20,
                            height: isMobile ? 28 : 20,
                            "&:hover": { bgcolor: "#f44336" },
                            zIndex: 9999,
                            pointerEvents: "auto",
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>

                        {/* Editable Text */}
                        <TextField
                          variant="standard"
                          value={textElement.value}
                          placeholder="Add Text"
                          multiline
                          fullWidth
                          tabIndex={0}
                          autoFocus={textElement.isEditing}
                          InputProps={{
                            readOnly: !textElement.isEditing,
                            disableUnderline: true,
                            style: {
                              fontSize: textElement.fontSize,
                              fontWeight: textElement.fontWeight,
                              color: textElement.fontColor,
                              fontFamily: textElement.fontFamily,
                              // textAlign: textElement.textAlign || "top", // ✅ horizontal alignment in text
                              transform: `rotate(${textElement.rotation}deg)`,
                              padding: 0,
                              width: "100%",
                              height: "100%",
                              cursor: textElement.isEditing ? "text" : "pointer",
                              backgroundColor: "transparent",
                              display: "flex",
                              alignItems: vAlign, // ✅ vertical alignment even inside input
                              justifyContent: hAlign,
                            },
                          }}
                          onChange={(e) =>
                            updateTextElement(textElement.id, { value: e.target.value })
                          }
                          onFocus={() => updateTextElement(textElement.id, { isEditing: true })}
                          onBlur={() => updateTextElement(textElement.id, { isEditing: false })}
                          sx={{
                            "& .MuiInputBase-input": {
                              overflowY: "auto",
                              textAlign: textElement.textAlign || "center",
                            },
                            pointerEvents: "auto",
                          }}
                        />
                      </Box>
                    </Rnd>
                  );
                })}</>
            )
          }


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
                  zIndex: qrPosition3.zIndex,
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
                key={selectedVideoUrl3} // ✅ unique key triggers re-animation on change
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
                    src="/assets/images/video-qr-tips.png"
                    sx={{
                      width: "100%",
                      height: 200,
                      position: "relative",
                      pointerEvents: 'none'
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
                      url={selectedVideoUrl3}
                      size={Math.min(qrPosition3.width, qrPosition3.height)}
                    />
                  </Box>
                  <a href={`${selectedVideoUrl3}`} target="_blank">
                    <Typography
                      sx={{
                        position: "absolute",
                        top: 80,
                        right: 25,
                        zIndex: 9999,
                        color: "black",
                        fontSize: "10px",
                        width: "105px",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {`${selectedVideoUrl3.slice(0, 20)}.....`}
                    </Typography>
                  </a>
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
              </motion.div>
            </Rnd>
          )}

          {selectedAudioUrl3 && (
            <Rnd
              onDragStop={(_, d) =>
                setQrAudioPosition3((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                  zIndex: qrAudioPosition3.zIndex, // Bring to front on drag
                }))
              }
              onResizeStop={(_, __, ref, ___, position) => {
                setQrAudioPosition3((prev) => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrAudioPosition3.zIndex, // Bring to front on resize
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
                key={selectedVideoUrl3} // ✅ unique key triggers re-animation on change
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
                      pointerEvents: 'none'
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
                      url={selectedAudioUrl3}
                      size={Math.min(
                        qrAudioPosition3.width,
                        qrAudioPosition3.height
                      )}
                    />
                  </Box>
                  <a href={`${selectedAudioUrl3}`} target="_blank">
                    <Typography
                      sx={{
                        position: "absolute",
                        top: 78,
                        right: 25,
                        zIndex: 9999,
                        color: "black",
                        fontSize: "10px",
                        width: "105px",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {`${selectedAudioUrl3.slice(0, 20)}.....`}
                    </Typography>
                  </a>
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
              </motion.div>
            </Rnd>
          )}

          {draggableImages3
            .filter((img: any) => selectedImg3.includes(img.id))
            .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
            .map(({ id, src, x, y, width, height, zIndex, rotation = 0 }: any) => {
              const isMobile =
                typeof window !== "undefined" && window.innerWidth < 768;

              return (
                <Rnd
                  key={id}
                  size={{ width, height }}
                  position={{ x, y }}
                  bounds="parent"
                  enableUserSelectHack={false} // ✅ allow touches to propagate
                  cancel=".non-draggable" // ✅ prevents RND drag from hijacking taps on buttons
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
                        }}
                      />
                    </Box>

                    {/* Rotate button */}
                    <Box
                      className="non-draggable" // ✅ ensures RND doesn’t hijack
                      onClick={(e) => {
                        e.stopPropagation();
                        setDraggableImages3((prev) =>
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
                        setSelectedImage3((prev) => prev.filter((i) => i !== id));
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

          {showOneTextRightSideBox3 && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "97%",
                width: { md: "370px", sm: "370px", xs: "90%" },
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
                  alignItems:
                    textAlign3 === "start"
                      ? "flex-start"
                      : textAlign3 === "center"
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
                        lineHeight: lineHeight3,
                        letterSpacing: letterSpacing3,
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

          {multipleTextValue3 && (
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
                    justifyContent: "center",
                    display: "flex",
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
                      variant="standard"
                      value={textObj.value}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts3((prev) =>
                          prev.map((t, i) =>
                            i === index
                              ? {
                                ...t,
                                value: newValue,
                                // Ye values bhi update kar do editing ke dauraan
                                textAlign: textAlign3,
                                verticalAlign: verticalAlign3,
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
                            fontSize: textObj.fontSize3,
                            fontWeight: textObj.fontWeight3,
                            color: textObj.fontColor3,
                            fontFamily: textObj.fontFamily3,
                            textAlign: textAlign3,
                            lineHeight: lineHeight3,
                            letterSpacing: letterSpacing3
                          },
                        },
                      }}
                    />
                  ) : (
                    <Box
                      onClick={() => {
                        if (editingIndex3 !== null) {
                          setTexts3((prev) =>
                            prev.map((t, i) =>
                              i === editingIndex3
                                ? {
                                  ...t,
                                  textAlign: textAlign3,
                                  verticalAlign: verticalAlign3,
                                }
                                : t
                            )
                          );
                        }

                        // ✅ Then select new box
                        setEditingIndex3(index);
                        setFontSize3(textObj.fontSize3);
                        setFontFamily3(textObj.fontFamily3);
                        setFontWeight3(textObj.fontWeight3);
                        setFontColor3(textObj.fontColor3);
                        setTextAlign3(textObj.textAlign);
                        setVerticalAlign3(textObj.verticalAlign);
                      }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: textObj.fontSize3,
                          fontWeight: textObj.fontWeight3,
                          color: textObj.fontColor3,
                          fontFamily: textObj.fontFamily3,
                          textAlign: textObj.textAlign,
                          lineHeight: lineHeight3,
                          letterSpacing: letterSpacing3,
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
                display: "flex",
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
                  src={`${selectedAIimageUrl3}`}
                  alt="AI Image"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                    display: "block",
                    pointerEvents: 'none'
                  }}
                />

                {/* Close button */}
                <IconButton
                  onClick={() => setIsAIimage3?.(false)}
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

          {selectedStickers3.map((sticker, index) => {
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
                      removeSticker3(index);
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
                      updateSticker3(index, {
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
        </Box>
      )}
    </Box>
  );
};

export default SpreadRightSide;
