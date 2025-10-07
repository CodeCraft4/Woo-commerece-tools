"use client";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import {
  AutoAwesomeMosaicOutlined,
  CollectionsOutlined,
  EmojiEmotionsOutlined,
  SlideshowOutlined,
  AudiotrackOutlined,
  TitleOutlined,
  BlurOn,
  Close,
} from "@mui/icons-material";
import QrGenerator from "../QR-code/Qrcode";
import { useEffect, useRef, useState } from "react";
import {
  fetchAudioLatestMedia,
  fetchVideoLatestMedia,
} from "../../source/source";
import { Rnd } from "react-rnd";
import { useWishCard } from "../../context/WishCardContext";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constant/color";

interface DraggableItem {
  id: number | string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface SlideSpreadProps {
  textAlign?: "start" | "center" | "end";
  rotation?: number;
  togglePopup: (name: string | null) => void;
  activePopup?: string | null;
  activeIndex?: number;
  addText?: boolean;
}

const SlideSpread = ({
  togglePopup,
  activeIndex,
  addText,
}: SlideSpreadProps) => {
  const {
    images,
    selectedImg,
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
    rotation,
    tips,
    setTips,
    setTexts,
    setShowOneTextRightSideBox,
    fontFamily,
    setImages,
  } = useWishCard();

  const { user } = useAuth();

  
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const leftBoxRef = useRef<HTMLDivElement>(null);

  const [draggableText, setDraggableText] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    value: string;
  } | null>(null);

  const [draggableImages, setDraggableImages] = useState<DraggableItem[]>([]);
  const selectedImageObj = draggableImages.find(
    (img) => img.id === selectedImg
  );

  // Example for QR code draggable state
  const [qrPosition, setQrPosition] = useState({
    x: 0,
    y: 0,
    width: 150,
    height: 150,
    rotation: 0,
  });

  const [audioQrPosition, setAudioQrPosition] = useState({
    x: 0,
    y: 0,
    width: 150,
    height: 150,
    rotation: 0,
  });
  console.log(setAudioQrPosition);

  // Just Video fetching
  useEffect(() => {
    if (user) {
      fetchVideoLatestMedia(user.id, setMediaUrl);
    }
  }, [user]);

  // Just Audio fetching
  useEffect(() => {
    fetchAudioLatestMedia(setAudioUrl);
  }, []);

  // Inside SlideSpread component
  useEffect(() => {
    if (addText && !draggableText) {
      setDraggableText({
        x: 100,
        y: 100,
        width: 250,
        height: 100,
        value: "",
      });
    }
  }, [addText, draggableText]);

  // Handlers for text editing moved here for clarity
  const handleAddTextClick = (index: number) => {
    setEditingIndex(index);
  };

  const handleFinishEditing = () => {
    setEditingIndex(null);
  };

  // Add this handler to initialize draggable state for images (omitted for brevity)
  useEffect(() => {
    if (images.length > 0) {
      setDraggableImages((prev) => {
        // 1. Add new ones
        const existingIds = prev.map((img) => img.id);
        const newOnes = images
          .filter((img) => !existingIds.includes(img.id))
          .map((img) => ({
            ...img,
            x: 50,
            y: 50,
            width: 150,
            height: 150,
            rotation: 0,
          }));

        // 2. Remove deleted ones
        const stillValid = prev.filter((img) =>
          images.some((incoming) => incoming.id === img.id)
        );

        return [...stillValid, ...newOnes];
      });
    } else {
      // If images array is empty, clear draggableImages
      setDraggableImages([]);
    }
  }, [images]);
  // Add this handler to initialize draggable state for images
  useEffect(() => {
    if (images.length > 0) {
      setDraggableImages((prev) => {
        // 1. Add new ones
        const existingIds = prev.map((img) => img.id);
        const newOnes = images
          .filter((img) => !existingIds.includes(img.id))
          .map((img) => ({
            ...img,
            x: 50,
            y: 50,
            width: 150,
            height: 150,
            rotation: 0,
          }));

        // 2. Remove deleted ones
        const stillValid = prev.filter((img) =>
          images.some((incoming) => incoming.id === img.id)
        );

        return [...stillValid, ...newOnes];
      });
    } else {
      // If images array is empty, clear draggableImages
      setDraggableImages([]);
    }
  }, [images]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: "5px",
        bgcolor: "white",
        position: "relative",
      }}
    >
      {/* Left Side */}
      <Box
        ref={leftBoxRef}
        sx={{ flex: 1, zIndex: 10, p: 2, position: "relative" }}
      >
        {draggableText && (
          <Rnd
            size={{ width: draggableText.width, height: draggableText.height }}
            position={{ x: draggableText.x, y: draggableText.y }}
            onDragStop={(_, d) => {
              setDraggableText((prev) =>
                prev ? { ...prev, x: d.x, y: d.y } : null
              );
            }}
            onResizeStop={(_, __, ref, ___, position) => {
              setDraggableText((prev) =>
                prev
                  ? {
                      ...prev,
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                      x: position.x,
                      y: position.y,
                    }
                  : null
              );
            }}
            minWidth={100}
            minHeight={30}
            bounds="parent"
            style={{
              zIndex: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {addText && (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  pointerEvents: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Icon: Deletes the Text Box */}
                <IconButton
                  size="small"
                  onClick={() => setDraggableText(null)}
                  sx={{
                    position: "absolute",
                    top: -12,
                    right: -12,
                    bgcolor: COLORS.primary,
                    color: "white",
                    "&:hover": { bgcolor: "#f44336" },
                    zIndex: 20,
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>

                {/* Text Field for content */}
                <TextField
                  variant="standard"
                  value={draggableText.value}
                  onChange={(e) =>
                    setDraggableText((prev) =>
                      prev ? { ...prev, value: e.target.value } : null
                    )
                  }
                  InputProps={{
                    disableUnderline: true,
                    style: {
                      fontSize: fontSize,
                      fontWeight: 600,
                      textAlign: "center",
                      border: "3px dashed #3639d3ff",
                      padding: "10px",
                    },
                  }}
                  autoFocus
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
                    },
                  }}
                />
              </Box>
            )}
          </Rnd>
        )}

        {/* Existing Rnd components for QR codes and images... (omitted for brevity) */}
        {mediaUrl && (
          <Rnd
            /* ... (props for video QR code) */
            size={{ width: qrPosition.width, height: qrPosition.height }}
            position={{ x: qrPosition.x, y: qrPosition.y }}
            onDragStop={(_, d) =>
              setQrPosition((prev) => ({ ...prev, x: d.x, y: d.y }))
            }
            onResizeStop={(_, ___, ref, __, position) => {
              setQrPosition({
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                x: position.x,
                y: position.y,
                rotation: qrPosition.rotation,
              });
            }}
          >
            <QrGenerator url={mediaUrl} />
          </Rnd>
        )}

        {audioUrl && (
          <Rnd
            size={{
              width: audioQrPosition.width,
              height: audioQrPosition.height,
            }}
            position={{ x: audioQrPosition.x, y: audioQrPosition.y }}
            onDragStop={(_, d) =>
              setQrPosition((prev) => ({ ...prev, x: d.x, y: d.y }))
            }
            onResizeStop={(e, _, ref, position) => {
              setQrPosition({
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                x: position.height,
                y: position.height,
                rotation: qrPosition.rotation,
              });
              console.log(e);
            }}
          >
            <QrGenerator url={audioUrl} />
          </Rnd>
        )}

        {selectedImageObj &&
          draggableImages.map(({ id, src, x, y, width, height, rotation }) => (
            <Rnd
              key={id}
              /* ... (props for draggable images) ... */
              size={{ width, height }}
              position={{ x, y }}
              onDragStop={(_, d) => {
                setDraggableImages((prev) =>
                  prev.map((img) =>
                    img.id === id ? { ...img, x: d.x, y: d.y } : img
                  )
                );

                setImages((prev) =>
                  prev.map((img) =>
                    img.id === id ? { ...img, x: d.x, y: d.y } : img
                  )
                );
              }}
              onResizeStop={(e, _, ref, __, position) => {
                const newWidth = parseInt(ref.style.width);
                const newHeight = parseInt(ref.style.height);
                console.log(e);
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

                setImages((prev) =>
                  prev.map((img) =>
                    img.id === id
                      ? {
                          ...img,
                          width: newWidth,
                          height: newHeight,
                          // x: position.x,
                          // y: position.y,
                        }
                      : img
                  )
                );
              }}
              resizeHandleStyles={{
                bottomRight: {
                  width: "12px",
                  height: "12px",
                  background: "#000000ff",
                  borderRadius: "50%",
                  right: "-6px",
                  bottom: "-6px",
                },
                topLeft: {
                  width: "12px",
                  height: "12px",
                  background: "#3a7bd5",
                  borderRadius: "50%",
                  left: "-6px",
                  top: "-6px",
                },
              }}
              style={{
                border:
                  selectedImg === id
                    ? "2px solid #3a7bd5"
                    : "2px solid transparent",
                borderRadius: 8,
                transform: `rotate(${rotation}deg)`,
                cursor: "move",
                position: "absolute",
                background: "white",
                overflow: "hidden",
              }}

              // onClick={() => setSelectedImage()}
            >
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
            </Rnd>
          ))}
      </Box>

      {/* Right Side */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          fontWeight: "bold",
          boxShadow: "3px 8px 23px gray",
          p: 2,
        }}
      >
        {showOneTextRightSideBox && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              border: "3px dashed #3a7bd5",
              position: "relative",
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
                setOneTextValue(""); // clear text
                // ✅ hide layout box too
                if (typeof setShowOneTextRightSideBox === "function") {
                  setShowOneTextRightSideBox(false);
                }
              }}
            >
              <Close />
            </IconButton>

            <TextField
              variant="standard"
              value={oneTextValue}
              onChange={(e) => setOneTextValue(e.target.value)}
              InputProps={{
                disableUnderline: true,
                style: {
                  fontSize: fontSize,
                  fontWeight: fontWeight,
                  color: fontColor,
                  fontFamily: fontFamily,
                  transform: `rotate(${rotation}deg)`,
                },
              }}
              autoFocus
              multiline
              rows={20}
              fullWidth
              sx={{
                height: "100%",
                px: 2,
                textAlign: textAlign,
              }}
            />
          </Box>
        )}

        {multipleTextValue && (
          <Box
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: "6px",
              p: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {texts.map((text, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  height: "150px",
                  width: "100%",
                  mb: 2,
                }}
              >
                {/* Delete icon */}
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

                {/* Editable text box */}
                {editingIndex === index ? (
                  <TextField
                    autoFocus
                    multiline
                    fullWidth
                    rows={4}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      style: {
                        fontSize: fontSize,
                        fontWeight: fontWeight,
                        color: fontColor,
                        transform: `rotate(${rotation}deg)`,
                        border: "3px dashed #3a7bd5",
                        padding: "10px",
                        fontFamily: fontFamily,
                      },
                    }}
                    value={text}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setTexts((prev) =>
                        prev.map((t, i) => (i === index ? newValue : t))
                      );
                    }}
                    onBlur={handleFinishEditing}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleFinishEditing();
                      }
                    }}
                  />
                ) : (
                  <Box
                    onClick={() => handleAddTextClick(index)}
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "3px dashed #3a7bd5",
                      color: "#212121",
                      cursor: "pointer",
                      borderRadius: "6px",
                    }}
                  >
                    <TitleOutlined />
                    <Typography>{text || "Add Text"}</Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Editing Toolbar */}
      {activeIndex === 1 && (
        <Box
          sx={{
            height: "100%",
            bgcolor: "white",
            borderRadius: "4px",
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
            boxShadow: "3px 4px 12px #f0f0f0ff",
          }}
        >
          <IconButton
            sx={editingButtonStyle}
            onClick={() => togglePopup("layout")}
            aria-label="Layout"
          >
            <AutoAwesomeMosaicOutlined fontSize="large" />
            Layout
          </IconButton>
          <IconButton
            sx={editingButtonStyle}
            onClick={() => togglePopup("text")}
            aria-label="Text"
          >
            <TitleOutlined fontSize="large" />
            Text
          </IconButton>
          <IconButton
            sx={editingButtonStyle}
            onClick={() => togglePopup("photo")}
            aria-label="Photo"
          >
            <CollectionsOutlined fontSize="large" />
            Photo
          </IconButton>
          <IconButton
            sx={editingButtonStyle}
            onClick={() => togglePopup("sticker")}
            aria-label="Sticker"
          >
            <EmojiEmotionsOutlined fontSize="large" />
            Sticker
          </IconButton>
          <IconButton
            onClick={() => {
              togglePopup("video");
              setTips(!tips);
            }}
            sx={editingButtonStyle}
          >
            <SlideshowOutlined fontSize="large" />
            Video
          </IconButton>
          <IconButton
            onClick={() => {
              togglePopup("audio");
              setTips(!tips);
            }}
            sx={editingButtonStyle}
          >
            <AudiotrackOutlined fontSize="large" />
            Audio
          </IconButton>
          <IconButton
            onClick={() => {
              togglePopup("geneAi");
              setTips(!tips);
            }}
            sx={editingButtonStyle}
          >
            <BlurOn fontSize="large" />
            GenAI
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default SlideSpread;

const editingButtonStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: "13px",
  color: "#212121",
  "&:hover": {
    color: "#3a7bd5",
  },
};
