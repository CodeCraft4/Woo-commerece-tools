import { useEffect, useRef, useState } from "react";
import { Box, TextField } from "@mui/material";
import {
  Edit,
  UploadFileRounded,
} from "@mui/icons-material";
import { useSlide1 } from "../../context/Slide1Context";
import { useLocation } from "react-router-dom";
interface SlideCoverProps {
  textAlign?: "start" | "center" | "end";
  rotation?: number;
  togglePopup: (name: string | null) => void;
  activePopup?: string | null;
  activeIndex?: number;
  addTextRight?: number;
  rightBox?: boolean;
  isCaptureMode?: boolean
}

const SlideCover = ({
  activeIndex,
  togglePopup,
  rightBox,
  isCaptureMode
}: SlideCoverProps) => {


  const coverRef = useRef<HTMLDivElement>(null);


  const {
    images1,
    multipleTextValue1,
    texts1,
    editingIndex1,
    fontSize1,
    fontWeight1,
    fontColor1,
    textAlign1,
    verticalAlign1,
    setTexts1,
    fontFamily1,
    // textElements1,
    // setTextElements1,
    isSlideActive1,
    setFontSize1,
    setFontColor1,
    setFontWeight1,
    setFontFamily1,
    selectedVideoUrl1,
    selectedAudioUrl1,
    setDraggableImages1,
    setQrPosition1,
    setQrAudioPosition1,
    layout1,
    setLayout1,
    // lineHeight1,
    // letterSpacing1,
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

  // 👇 Auto-reset multipleTextValue when all multiple texts are deleted
  useEffect(() => {
    // When user re-selects the multipleTextValue layout
    if (multipleTextValue1) {
      // If no texts currently exist, recreate the 3 default boxes
      if (texts1.length === 0) {
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
        setTexts1(defaultTexts);
      }
    }
  }, [multipleTextValue1]);

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
      ref={coverRef}
      id="slide-cover-capture"
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
            height: '100vh',
            opacity: isCaptureMode ? 1 : isSlideActive1 ? 1 : 0.6,
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
              {layout1.elements?.map((el: any, index: number) => (
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
                    src={el.src}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                      filter: "brightness(85%)",
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

              {layout1.stickers?.map((el: any) => (
                <Box
                  key={el.id}
                  sx={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,

                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {/* Image */}
                  <Box
                    component="img"
                    src={el.sticker}
                    sx={{
                      width: el.width,
                      height: el.height,
                      objectFit: "contain",
                      borderRadius: 1,
                      filter: "brightness(70%)",
                      zIndex: el.zIndex
                    }}
                  />
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
                          : "center",
                    justifyContent:
                      te.textAlign === "left"
                        ? "flex-start"
                        : te.textAlign === "right"
                          ? "flex-end"
                          : "center",
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

        </Box>
      )}
    </Box>
  );
};

export default SlideCover;
