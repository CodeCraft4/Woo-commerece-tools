import { useEffect, useRef, useState } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import { Close, Forward10, TitleOutlined, UploadFileRounded } from "@mui/icons-material";
import QrGenerator from "../QR-code/Qrcode";
import { Rnd } from "react-rnd";
import { COLORS } from "../../constant/color";
import { useSlide1 } from "../../context/Slide1Context";
import { useLocation } from "react-router-dom";

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
  rightBox,
}: SlideCoverProps) => {
  const location = useLocation();
  const { layout } = location.state || {};

  useEffect(() => {
    console.log("Layout from previous page:", layout);
  }, [layout]);

  const [layoutData, setLayoutData] = useState(layout);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const handleImageUploadClick = (index: number) => {
    setSelectedImageIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selectedImageIndex === null) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newSrc = event.target?.result as string;

      // Replace the image source in layoutData
      const updated = { ...layoutData };
      updated.elements[selectedImageIndex].src = newSrc;
      setLayoutData(updated);
    };
    reader.readAsDataURL(file);
  };

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
  } = useSlide1();

  const rightBoxRef = useRef<HTMLDivElement>(null);

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
      fontSize1,
      fontWeight1,
      fontColor1,
      fontFamily1,
      textAlign1,
      rotation1,
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
              }
            : t
        )
      );
    }
  }, [fontSize1, fontFamily1, fontWeight1, fontColor1]);

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
            {layout && (
            <Box sx={{ width: "100%", height: "100%" }}>
              {/* Render Images */}
              {layout.elements.map((el: any, index: number) => (
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
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  {/* Image */}
                  <Box
                    component="img"
                    src={el.src}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                      filter:'brightness(70%)'
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
                      border:'1px solid white',
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.6)",
                      },
                    }}
                    onClick={() => handleImageUploadClick(index)}
                  >
                    <UploadFileRounded sx={{color:'white'}}/>
                  </Box>
                </Box>
              ))}

              {/* Render Texts */}
              {layout.textElements.map((te: any) => (
                <Typography
                  key={te.id}
                  sx={{
                    position: "absolute",
                    left: te.x,
                    top: te.y,
                    fontSize: te.fontSize || 14,
                    fontFamily: te.fontFamily || "sans-serif",
                    color: te.color || "#000",
                    fontWeight: te.bold ? 700 : 400,
                    fontStyle: te.italic ? "italic" : "normal",
                    textAlign: "center",
                    width: te.width,
                    height: te.height,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {te.text}
                </Typography>
              ))}
            </Box>
          )}

          {textElements1.map((textElement) => (
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
                  setSelectedTextId1(textElement.id);
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
                      // textAlign: textElement.textAlign || "center",
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
                      textAlign: textElement.textAlign || "center",
                    },
                  }}
                />
              </Box>
            </Rnd>
          ))}

          {/* Existing Rnd components for QR codes and images... (omitted for brevity) */}

          {selectedVideoUrl1 && (
            <Rnd
              onDragStop={(_, d) =>
                setQrPosition1((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                  zIndex: qrPosition1.zIndex, // Bring to front on drag
                }))
              }
              onResizeStop={(_, __, ref, ___, position) => {
                setQrPosition1((prev) => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrPosition1.zIndex, // Bring to front on resize
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
                    bottom: 47,
                    height: 100,
                    width: 100,
                    borderRadius: 2,
                    ml: "8px",
                    // bgcolor:'red',
                    p: 1,
                  }}
                >
                  <QrGenerator
                    url={selectedVideoUrl1}
                    size={Math.min(qrPosition1.width, qrPosition1.height)}
                  />
                </Box>
                <IconButton
                  onClick={() => setSelectedVideoUrl1(null)}
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

          {selectedAudioUrl1 && (
            <Rnd
              onDragStop={(_, d) =>
                setQrAudioPosition1((prev) => ({
                  ...prev,
                  x: d.x,
                  y: d.y,
                  zIndex: qrAudioPosition1.zIndex,
                }))
              }
              onResizeStop={(_, __, ref, ___, position) => {
                setQrAudioPosition1((prev) => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                  zIndex: qrAudioPosition1.zIndex,
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
                    bottom: 47,
                    height: 100,
                    width: 100,
                    borderRadius: 2,
                    ml: "8px",
                    // bgcolor:'red',
                    p: 1,
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
                <IconButton
                  onClick={() => setSelectedAudioUrl1(null)}
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
          
          {draggableImages1
            .filter((img: any) => selectedImg1.includes(img.id))
            .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
            .map(({ id, src, x, y, width, height, zIndex }: any) => (
              <Rnd
                key={id}
                size={{ width, height }}
                position={{ x, y }}
                onDragStop={(_, d) => {
                  setDraggableImages1((prev) =>
                    prev.map((img) =>
                      img.id === id ? { ...img, x: d.x, y: d.y } : img
                    )
                  );
                }}
                style={{ zIndex: zIndex || 1 }}
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
                      setSelectedImage1((prev) => prev.filter((i) => i !== id))
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

          {showOneTextRightSideBox1 && (
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

          {multipleTextValue1 && (
            <Box
              sx={{
                height: "100%",
                width: "375px",
                borderRadius: "6px",
                p: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent:
                  verticalAlign1 === "top"
                    ? "flex-start"
                    : verticalAlign1 === "center"
                    ? "center"
                    : "flex-end",
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
                    display: "flex",
                    justifyContent:
                      verticalAlign1 === "top"
                        ? "flex-start"
                        : verticalAlign1 === "center"
                        ? "center"
                        : "flex-end",
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
                      // rows={1}
                      variant="standard"
                      value={textObj.value}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts1((prev) =>
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
                            fontSize: textObj.fontSize1,
                            fontWeight: textObj.fontWeight1,
                            color: textObj.fontColor1,
                            fontFamily: textObj.fontFamily1,
                          },
                        },
                      }}
                    />
                  ) : (
                    <Box
                      onClick={() => {
                        setEditingIndex1(index);
                        setFontSize1(textObj.fontSize1);
                        setFontFamily1(textObj.fontFamily1);
                        setFontWeight1(textObj.fontWeight1);
                        setFontColor1(textObj.fontColor1);
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
                          fontSize: textObj.fontSize1,
                          fontWeight: textObj.fontWeight1,
                          color: textObj.fontColor1,
                          fontFamily: textObj.fontFamily1,
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

          {isAIimage && (
            <Rnd
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
                  src={`${selectedAIimageUrl1}`}
                  alt={`isAIImage${selectedAIimageUrl1}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    // objectFit:'cover'
                  }}
                />
                <IconButton
                  onClick={() => {
                    if (setIsAIimage) {
                      setIsAIimage(false);
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

          {selectedStickers.map((sticker, index) => (
            <Rnd
              key={sticker.id || index}
              size={{ width: sticker.width, height: sticker.height }}
              position={{ x: sticker.x, y: sticker.y }}
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
                    onClick={() => removeSticker(index)}
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
                      updateSticker(index, {
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

export default SlideCover;
