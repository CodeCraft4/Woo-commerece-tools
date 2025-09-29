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
}

const SlideSpread = ({ togglePopup, activeIndex }: SlideSpreadProps) => {
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
    // setImageSizes,
    // setImagePositions,
    setImages,
  } = useWishCard();

  const {user} = useAuth()

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const leftBoxRef = useRef<HTMLDivElement>(null);

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

  const [layoutPosition, setLayoutPosition] = useState({
    x: 100,
    y: 100,
    width: 330,
    height: 550,
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

  // Handlers for text editing moved here for clarity
  const handleAddTextClick = (index: number) => {
    setEditingIndex(index);
  };

  const handleFinishEditing = () => {
    setEditingIndex(null);
  };

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
        {mediaUrl && (
          <Rnd
            size={{ width: qrPosition.width, height: qrPosition.height }}
            position={{ x: qrPosition.x, y: qrPosition.y }}
            onDragStop={(_, d) =>
              setQrPosition((prev) => ({ ...prev, x: d.x, y: d.y }))
            }
            onResizeStop={(_, ___, ref,__,position) => {
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
              size={{ width, height }}
              position={{ x, y }}
              // onDragStop={(e, d) =>
              //   setDraggableImages((prev) =>
              //     prev.map((img) =>
              //       img.id === id ? { ...img, x: d.x, y: d.y } : img
              //     )
              //   )
              // }
              // onResizeStop={(e, direction, ref, delta, position) => {
              //   setDraggableImages((prev) =>
              //     prev.map((img) =>
              //       img.id === id
              //         ? {
              //             ...img,
              //             width: parseInt(ref.style.width),
              //             height: parseInt(ref.style.height),
              //             x: position.x,
              //             y: position.y,
              //           }
              //         : img
              //     )
              //   );
              // }}

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
              onResizeStop={(e, _, ref,__,position) => {
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
                  background: "#3a7bd5",
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

        {showOneTextRightSideBox && (
          <Rnd
            size={{
              width: layoutPosition.width,
              height: layoutPosition.height,
            }}
            position={{ x: layoutPosition.x, y: layoutPosition.y }}
            onDragStop={(_, d) =>
              setLayoutPosition((prev) => ({ ...prev, x: d.x, y: d.y }))
            }
            onResizeStop={(_, __, ref,_delta, position) => {
              setLayoutPosition({
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                x: position.x,
                y: position.y,
                rotation: layoutPosition.rotation,
              });
            }}
          >
            <Box
              sx={{
                flex: 1,
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                border: "3px dashed #3a7bd5",
              }}
            >
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
          </Rnd>
        )}

        {multipleTextValue && (
          <Rnd
            size={{ width: "100%", height: qrPosition.height }}
            position={{ x: qrPosition.x, y: qrPosition.y }}
            onDragStop={(_, d) =>
              setQrPosition((prev) => ({ ...prev, x: d.x, y: d.y }))
            }
            onResizeStop={(e, _, ref,__, position) => {
              setQrPosition({
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                x: position.x,
                y: position.y,
                rotation: qrPosition.rotation,
              });
              console.log(e);
            }}
          >
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
              {[0, 1, 2].map((index) => (
                <Box
                  onClick={() => handleAddTextClick(index)}
                  sx={{
                    height: "100%",
                    width: "100%",
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    mb: 2,
                  }}
                  key={index}
                >
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
                        },
                      }}
                      value={texts[index]}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts((prev) => {
                          const updated = [...prev]; 
                          updated[index] = newValue; 
                          return updated;
                        });
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
                        height: "150px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        m: "auto",
                        color: "#212121",
                        border: "3px dashed #3a7bd5",
                        cursor: "pointer",
                        userSelect: "none",
                        flexDirection: "row",
                        gap: 1,
                      }}
                    >
                      <TitleOutlined />
                      <Typography component="span" sx={{ userSelect: "none" }}>
                        {texts[index] ? texts[index] : "Add Text"}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Rnd>
        )}
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
        {/* {showOneTextRightSideBox && (
          <Box
            sx={{
              flex: 1,
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              border: "3px dashed #3a7bd5",
            }}
          >
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
                  transform: `rotate(${rotation}deg)`,
                },
              }}
              autoFocus
              multiline
              rows={20}
              fullWidth
              sx={{
                height: "100%",
                p: 2,
                textAlign: textAlign,
              }}
            />
          </Box>
        )} */}

        {/* {multipleTextValue && (
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
            {[0, 1, 2].map((index) => (
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
                key={index}
              >
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
                      },
                    }}
                    value={texts[index]}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setTexts((prev) => {
                        const updated = [...prev]; // copy old array
                        updated[index] = newValue; // update only this index
                        return updated; // save back
                      });
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
                      height: "150px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      m: "auto",
                      color: "gray",
                      border: "3px dashed #3a7bd5",
                      cursor: "pointer",
                      userSelect: "none",
                      flexDirection: "row",
                      gap: 1,
                    }}
                  >
                    <TitleOutlined />
                    <Typography component="span" sx={{ userSelect: "none" }}>
                      {texts[index] ? texts[index] : "Add Text"}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )} */}
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
