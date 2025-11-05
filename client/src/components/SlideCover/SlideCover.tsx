import { useEffect, useRef, useState } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import {
  Close,
  Edit,
  Forward10,
  Forward30,
  TitleOutlined,
  UploadFileRounded,
} from "@mui/icons-material";
import QrGenerator from "../QR-code/Qrcode";
import { Rnd } from "react-rnd";
import { COLORS } from "../../constant/color";
import { useSlide1 } from "../../context/Slide1Context";
import { useLocation } from "react-router-dom";
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
  verticalAlign: defaults.verticalAlign || "center",
  rotation: defaults.rotation || 0,
  zIndex: defaults.zIndex || 1,
  position: { x: 50 + Math.random() * 50, y: 50 + Math.random() * 50 },
  size: { width: 200, height: 40 },
  isEditing: false,
});
interface SlideCoverProps {
  textAlign?: "start" | "center" | "end";
  rotation?: number;
  togglePopup: (name: string | null) => void;
  activePopup?: string | null;
  activeIndex?: number;
  addTextRight?: number;
  rightBox?: boolean;
}

const SlideCover = ({
  activeIndex,
  addTextRight,
  togglePopup,
  rightBox,
}: SlideCoverProps) => {
  const {
    images1,
    selectedImg1,
    setSelectedImage1,
    showOneTextRightSideBox1,
    oneTextValue1,
    setOneTextValue1,
    multipleTextValue1,
    texts1,
    editingIndex1,
    setEditingIndex1,
    fontSize1,
    fontWeight1,
    fontColor1,
    textAlign1,
    verticalAlign1,
    rotation1,
    setTexts1,
    setShowOneTextRightSideBox1,
    fontFamily1,
    // New individual text management
    textElements1,
    setTextElements1,
    selectedTextId1,
    setSelectedTextId1,
    setMultipleTextValue1,
    isSlideActive1,
    setFontSize1,
    setFontColor1,
    setFontWeight1,
    setFontFamily1,
    setTextAlign1,
    setVerticalAlign1,
    selectedVideoUrl1,
    setSelectedVideoUrl1,
    selectedAudioUrl1,
    setSelectedAudioUrl1,
    draggableImages1,
    setDraggableImages1,
    qrPosition1,
    setQrPosition1,
    qrAudioPosition1,
    setQrAudioPosition1,
    isAIimage,
    setIsAIimage,
    selectedAIimageUrl1,
    selectedStickers,
    updateSticker,
    removeSticker,
    aimage1,
    setAIImage1,
    layout1,
    setLayout1,

    lineHeight1,
    letterSpacing1,
  } = useSlide1();

  const location = useLocation();
  const { layout } = location.state || {};

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rightBoxRef = useRef<HTMLDivElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (layout && !layout1) {
      setLayout1(layout);
    }
  }, [layout, layout1]);

  const handleImageUploadClick = (index: number) => {
    setSelectedImageIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selectedImageIndex === null) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const newSrc = event.target?.result as string;

      setLayout1((prev: any) => {
        if (!prev?.elements) return prev;
        const updatedElements = [...prev.elements];
        updatedElements[selectedImageIndex] = {
          ...updatedElements[selectedImageIndex],
          src: newSrc,
        };
        return { ...prev, elements: updatedElements };
      });
    };

    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };


  const handleTextChange = (newText: string, index: number) => {
    setLayout1((prev: any) => {
      const updated = [...prev.textElements];
      updated[index] = {
        ...updated[index],
        text: newText,
        fontSize: fontSize1 || updated[index].fontSize,
        fontFamily: fontFamily1 || updated[index].fontFamily,
        color: fontColor1 || updated[index].color,
        fontWeight: fontWeight1 || updated[index].fontWeight,
        italic: updated[index].italic, // keep italic if applied
      };
      return { ...prev, textElements: updated };
    });
  };


  const handleTextFocus = (index: number, te: any) => {
    setEditingIndex(index);
    setFontSize1(te.fontSize ?? fontSize1);
    setFontFamily1(te.fontFamily ?? fontFamily1);
    setFontColor1(te.color ?? fontColor1);
    setFontWeight1(te.fontWeight ?? fontWeight1);
  };

  useEffect(() => {
    if (editingIndex !== null) {
      setLayout1((prev: any) => {
        const updated = [...prev.textElements];
        updated[editingIndex] = {
          ...updated[editingIndex],
          fontSize: fontSize1,
          fontFamily: fontFamily1,
          color: fontColor1,
          fontWeight: fontWeight1,
        };
        return { ...prev, textElements: updated };
      });
    }
  }, [fontSize1, fontFamily1, fontColor1, fontWeight1]);
  // Add this handler to initialize draggable state for images (omitted for brevity)
  useEffect(() => {
    if (images1.length > 0) {
      setDraggableImages1((prev: any) => {
        const existingIds = prev.map((img: any) => img.id);
        const newOnes = images1
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
          images1.some((incoming) => incoming.id === img.id)
        );

        return [...stillValid, ...newOnes];
      });
    } else {
      setDraggableImages1([]);
    }
  }, [images1, setDraggableImages1]);

  // Function to add new text element
  const addNewTextElement = () => {
    const newTextElement = createNewTextElement({
      fontSize:16,
      fontWeight:400,
      fontColor:"#000000",
      fontFamily:"Roboto",
      textAlign:"center",
      rotation:0,
      zIndex: textElements1.length + 1,
    });
    setTextElements1((prev) => [...prev, newTextElement]);
    setSelectedTextId1(newTextElement.id);
  };

  // Add Texts in screen
  useEffect(() => {
    if (addTextRight) {
      addNewTextElement();
    }
  }, [addTextRight, addTextRight]);

  // Function to update individual text element
  const updateTextElement = (id: string, updates: Partial<any>) => {
    setTextElements1((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updates } : text))
    );
  };

  // Function to delete text element
  const deleteTextElement = (id: string) => {
    setTextElements1((prev) => prev.filter((text) => text.id !== id));
    if (selectedTextId1 === id) {
      setSelectedTextId1(null);
    }
  };

  // 👇 Auto-reset multipleTextValue when all multiple texts are deleted
  useEffect(() => {
    if (multipleTextValue1 && texts1.length === 0) {
      setMultipleTextValue1(true); // hide layout
    }
  }, [texts1, multipleTextValue1]);

  // ✅ Place this useEffect HERE (below your state definitions)
  useEffect(() => {
    if (editingIndex1 !== null && editingIndex1 !== undefined) {
      setTexts1((prev) =>
        prev.map((t, i) =>
          i === editingIndex1
            ? {
              ...t,
              fontSize1,
              fontWeight1,
              fontColor1,
              fontFamily1,
              textAlign1,
              verticalAlign1,
            }
            : t
        )
      );
    }
  }, [
    fontSize1,
    fontFamily1,
    fontWeight1,
    fontColor1,
    textAlign1,
    verticalAlign1,
  ]);

  useEffect(() => {
    if (selectedVideoUrl1) {
      setQrPosition1((prev) => ({
        ...prev,
        url: selectedVideoUrl1,
      }));
    }
  }, [selectedVideoUrl1]);

  useEffect(() => {
    if (selectedAudioUrl1) {
      setQrAudioPosition1((prev) => ({
        ...prev,
        url: selectedAudioUrl1,
      }));
    }
  }, [selectedAudioUrl1]);


  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: "5px",
        position: "relative",
      }}
    >
      {activeIndex === 0 && rightBox && (
        <Box
          ref={rightBoxRef}
          sx={{
            flex: 1,
            zIndex: 10,
            p: 2,
            position: "relative",
            opacity: isSlideActive1 ? 1 : 0.6,
            pointerEvents: isSlideActive1 ? "auto" : "none",
            "&::after": !isSlideActive1
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
          {layout1 && (
            <Box sx={{ width: "100%", height: "100%" }}>
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {/* Render Images from layout1 */}
              {layout1.elements.map((el: any, index: number) => (
                <Box
                  key={el.id}
                  sx={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {/* Image */}
                  <Box
                    component="img"
                    src={el.src} // This src now comes from layout1
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                      filter: "brightness(70%)",
                    }}
                  />

                  {/* Upload Icon Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid white",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.6)",
                      },
                    }}
                    // Pass the element's index to the click handler
                    onClick={() => handleImageUploadClick(index)}
                  >
                    <UploadFileRounded sx={{ color: "white" }} />
                  </Box>
                </Box>
              ))}

              {/* Render Texts from layout1 */}
              {layout1.textElements?.map((te: any, index: number) => (
                <Box
                  key={te.id || index}
                  sx={{
                    position: "absolute",
                    left: te.x,
                    top: te.y,
                    width: te.width,
                    height: te.height,
                    display: "flex",
                    alignItems:
                      te.verticalAlign === "top"
                        ? "flex-start"
                        : te.verticalAlign === "bottom"
                          ? "flex-end"
                          : "center",  // ✅ vertical alignment
                    justifyContent:
                      te.textAlign === "left"
                        ? "flex-start"
                        : te.textAlign === "right"
                          ? "flex-end"
                          : "center", // ✅ horizontal alignment
                    outline: editingIndex === index ? "1px dashed #1976d2" : "none",
                    borderRadius: "4px",
                    backgroundColor:
                      editingIndex === index ? "rgba(25,118,210,0.1)" : "transparent",
                    cursor: "text",
                  }}
                  onClick={() => setEditingIndex(index)}
                >
                  <TextField
                    variant="standard"
                    fullWidth
                    multiline
                    value={te.text || ""}
                    onFocus={() => handleTextFocus(index, te)}
                    onChange={(e) => handleTextChange(e.target.value, index)}
                    inputProps={{
                      style: {
                        fontSize: editingIndex === index && fontSize1 ? fontSize1 : te.fontSize,
                        fontFamily: editingIndex === index && fontFamily1 ? fontFamily1 : te.fontFamily,
                        color: editingIndex === index && fontColor1 ? fontColor1 : te.color,
                        fontWeight: editingIndex === index && fontWeight1 ? fontWeight1 : te.bold,
                        fontStyle: te.italic ? "italic" : "normal",
                        textAlign: "center",
                        direction: "ltr",
                        unicodeBidi: "bidi-override",
                        padding: 0,
                        background: "transparent",
                        lineHeight: "1.2em",
                      },
                    }}
                    InputProps={{
                      disableUnderline: true,
                    }}
                    sx={{
                      width: "100%",
                      height: "100%",
                      "& .MuiInputBase-input": {
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "pre-wrap",
                      },
                    }}
                  />

                  {editingIndex === index && (
                    <Box
                      component={"div"}
                      onMouseDown={(e) => e.preventDefault()} // ✅ Prevent focus loss on click
                      onClick={() => togglePopup("text")}
                      data-keep-focus="true" // ✅ Mark as safe element to ignore blur
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "black",
                        color: "white",
                        zIndex: 88,
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#333" },
                      }}
                    >
                      <Edit fontSize="small" />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {
            multipleTextValue1 || showOneTextRightSideBox1 ? null : (
              <>
                {textElements1.map((textElement) => {
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

          {selectedVideoUrl1 && (
            <Rnd
              cancel=".no-drag"
              onDragStop={(_, d) =>
                setQrPosition1((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                }))
              }
              onResizeStop={(_, __, ref, ___, position) =>
                setQrPosition1((prev) => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                }))
              }
              bounds="parent"
              enableResizing={false}
              style={{
                padding: "10px",
                zIndex: 999
              }}
            >
              <motion.div
                key={selectedVideoUrl1} // ✅ unique key triggers re-animation on change
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
                      url={selectedVideoUrl1}
                      size={Math.min(qrPosition1.width, qrPosition1.height)}
                    />
                  </Box>
                  <a href={`${selectedVideoUrl1}`} target="_blank">
                    <Typography
                      sx={{
                        position: "absolute",
                        top: 80,
                        right: 25,
                        zIndex: 99999,
                        color: "black",
                        fontSize: "10px",
                        width: "105px",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {`${selectedVideoUrl1.slice(0, 20)}.....`}
                    </Typography>
                  </a>
                  <IconButton
                    onClick={() => setSelectedVideoUrl1(null)}
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

          {selectedAudioUrl1 && (
            <Rnd
              cancel=".no-drag"
              onDragStop={(_, d) =>
                setQrAudioPosition1((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                  zIndex: qrAudioPosition1.zIndex, // Bring to front on drag
                }))
              }
              onResizeStop={(_, __, ref, ___, position) => {
                setQrAudioPosition1((prev) => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrAudioPosition1.zIndex, // Bring to front on resize
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
                zIndex: 999
              }}
            >
              <motion.div
                key={selectedVideoUrl1} // ✅ unique key triggers re-animation on change
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
                      url={selectedAudioUrl1}
                      size={Math.min(
                        qrAudioPosition1.width,
                        qrAudioPosition1.height
                      )}
                    />
                  </Box>
                  <a href={`${selectedAudioUrl1}`} target="_blank">
                    <Typography
                      sx={{
                        position: "absolute",
                        top: 78,
                        right: 25,
                        zIndex: 99999,
                        color: "black",
                        fontSize: "10px",
                        width: "105px",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {`${selectedAudioUrl1.slice(0, 20)}.....`}
                    </Typography>
                  </a>
                  <IconButton
                    onClick={() => setSelectedAudioUrl1(null)}
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

          {draggableImages1
            .filter((img: any) => selectedImg1.includes(img.id))
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
                    setDraggableImages1((prev) =>
                      prev.map((img) =>
                        img.id === id ? { ...img, x: d.x, y: d.y } : img
                      )
                    );
                  }}
                  onResizeStop={(_, __, ref, ___, position) => {
                    const newWidth = parseInt(ref.style.width);
                    const newHeight = parseInt(ref.style.height);
                    setDraggableImages1((prev) =>
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
                        setDraggableImages1((prev) =>
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
                        setSelectedImage1((prev) => prev.filter((i) => i !== id));
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

          {showOneTextRightSideBox1 && (
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
                  setOneTextValue1("");
                  if (typeof setShowOneTextRightSideBox1 === "function") {
                    setShowOneTextRightSideBox1(false);
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
                    verticalAlign1 === "top"
                      ? "flex-start"
                      : verticalAlign1 === "center"
                        ? "center"
                        : "flex-end",
                  alignItems:
                    textAlign1 === "start"
                      ? "flex-start"
                      : textAlign1 === "center"
                        ? "center"
                        : "flex-end",
                }}
              >
                <TextField
                  variant="standard"
                  value={oneTextValue1}
                  onChange={(e) => setOneTextValue1(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      "& .MuiInputBase-input": {
                        fontSize: fontSize1,
                        fontWeight: fontWeight1,
                        color: fontColor1,
                        fontFamily: fontFamily1,
                        textAlign: textAlign1,
                        transform: `rotate(${rotation1}deg)`,
                        lineHeight: lineHeight1,
                        letterSpacing: letterSpacing1,
                        height: 400,
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

          {multipleTextValue1 && (
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
              {texts1.map((textObj, index) => (
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
                      verticalAlign1 === "top"
                        ? "flex-start"
                        : verticalAlign1 === "center"
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
                      setTexts1((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Close />
                  </IconButton>

                  {editingIndex1 === index ? (
                    <TextField
                      autoFocus
                      fullWidth
                      multiline
                      variant="standard"
                      value={textObj.value}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts1((prev) =>
                          prev.map((t, i) =>
                            i === index
                              ? {
                                ...t,
                                value: newValue,
                                textAlign: textAlign1,
                                verticalAlign: verticalAlign1,
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
                            fontSize: textObj.fontSize1,
                            fontWeight: textObj.fontWeight1,
                            color: textObj.fontColor1,
                            fontFamily: textObj.fontFamily1,
                            textAlign: textAlign1,
                            lineHeight: lineHeight1,
                            letterSpacing: letterSpacing1,
                          },
                        },
                      }}
                    />
                  ) : (
                    <Box
                      onClick={() => {
                        if (editingIndex1 !== null) {
                          setTexts1((prev) =>
                            prev.map((t, i) =>
                              i === editingIndex1
                                ? {
                                  ...t,
                                  textAlign: textAlign1,
                                  verticalAlign: verticalAlign1,
                                }
                                : t
                            )
                          );
                        }

                        // ✅ Then select new box
                        setEditingIndex1(index);
                        setFontSize1(textObj.fontSize1);
                        setFontFamily1(textObj.fontFamily1);
                        setFontWeight1(textObj.fontWeight1);
                        setFontColor1(textObj.fontColor1);
                        setTextAlign1(textObj.textAlign);
                        setVerticalAlign1(textObj.verticalAlign);
                      }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: textObj.fontSize1,
                          fontWeight: textObj.fontWeight1,
                          color: textObj.fontColor1,
                          fontFamily: textObj.fontFamily1,
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

          {isAIimage && (
            <Rnd
              cancel=".no-drag"
              size={{ width: aimage1.width, height: aimage1.height }}
              position={{ x: aimage1.x, y: aimage1.y }}
              onDragStop={(_, d) =>
                setAIImage1((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                }))
              }
              onResizeStop={(_, __, ref, ___, position) =>
                setAIImage1({
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
                border: "1px solid #1976d2",
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
                  src={`${selectedAIimageUrl1}`}
                  alt="AI Image"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "fill", // or "contain" if you prefer not to crop
                    display: "block",
                    pointerEvents: 'none'
                  }}
                />

                {/* Close button */}
                <IconButton
                  onClick={() => setIsAIimage?.(false)}
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

          {selectedStickers.map((sticker, index) => {
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
                  updateSticker(index, {
                    x: d.x,
                    y: d.y,
                    zIndex: sticker.zIndex,
                  })
                }
                onResizeStop={(_, __, ref, ___, position) =>
                  updateSticker(index, {
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
                      removeSticker(index);
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
                      updateSticker(index, {
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

export default SlideCover;
