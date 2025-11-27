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
import { motion } from "framer-motion";

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
    setSelectedLayout,

    setImageFilter,
    setActiveFilterImageId,

    lineHeight2,
    letterSpacing2
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
            height: '100vh',
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

        </Box>
      )
      }
    </Box >
  );
};

export default SlideSpread;
