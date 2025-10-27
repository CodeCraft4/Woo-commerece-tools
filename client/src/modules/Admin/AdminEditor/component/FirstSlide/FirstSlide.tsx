import { useRef, useState } from "react";
import {
  Add,
  AutoFixHigh,
  ImageRounded,
  Interests,
  FormatBold,
  FormatItalic,
  Check,
  Edit,
  Close,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { useCardEditor } from "../../../../../context/AdminEditorContext";
import { useNavigate } from "react-router-dom";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { ADMINS_DASHBOARD } from "../../../../../constant/route";
import { Rnd } from "react-rnd";
import { GOOGLE_FONTS } from "../../../../../constant/data";

// 🔸 Fully Expanded shapes list (CSS clip-paths)
const shapes = [
  { id: "square", label: "Square", path: "inset(0% 0% 0% 0%)" },
  {
    id: "triangle",
    label: "Triangle",
    path: "polygon(50% 0%, 0% 100%, 100% 100%)",
  },
  {
    id: "trapezoid",
    label: "Trapezoid",
    path: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
  },
  {
    id: "parallelogram",
    label: "Parallelogram",
    path: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
  },
  {
    id: "rhombus",
    label: "Rhombus",
    path: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  },
  {
    id: "pentagon",
    label: "Pentagon",
    path: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
  },
  {
    id: "hexagon",
    label: "Hexagon",
    path: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  },
  {
    id: "heptagon",
    label: "Heptagon",
    path: "polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)",
  },
  {
    id: "octagon",
    label: "Octagon",
    path: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
  },
  {
    id: "nonagon",
    label: "Nonagon",
    path: "polygon(50% 0%, 85% 15%, 100% 45%, 90% 80%, 60% 100%, 40% 100%, 10% 80%, 0% 45%, 15% 15%)",
  },
  {
    id: "decagon",
    label: "Decagon",
    path: "polygon(50% 0%, 80% 10%, 100% 35%, 100% 65%, 80% 90%, 50% 100%, 20% 90%, 0% 65%, 0% 35%, 20% 10%)",
  },
  {
    id: "bevel",
    label: "Bevel",
    path: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)",
  },
  {
    id: "rabbet",
    label: "Rabbet",
    path: "polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)",
  },
  {
    id: "star",
    label: "Star",
    path: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  },
  {
    id: "cross",
    label: "Cross",
    path: "polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)",
  },
  {
    id: "message",
    label: "Message",
    path: "polygon(0% 0%, 100% 0%, 100% 80%, 60% 80%, 50% 100%, 40% 80%, 0% 80%)",
  },
  {
    id: "close",
    label: "Close",
    path: "polygon(20% 0%, 50% 30%, 80% 0%, 100% 20%, 70% 50%, 100% 80%, 80% 100%, 50% 70%, 20% 100%, 0% 80%, 30% 50%, 0% 20%)",
  },
  {
    id: "frame",
    label: "Frame",
    path: "polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)",
  },
  {
    id: "inset",
    label: "Inset",
    path: "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)",
  },
  {
    id: "custom-polygon",
    label: "Custom Polygon",
    path: "polygon(50% 0%, 100% 25%, 80% 100%, 20% 100%, 0% 25%)",
  },
  { id: "circle", label: "Circle", path: "circle(50% at 50% 50%)" },
  { id: "ellipse", label: "Ellipse", path: "ellipse(45% 35% at 50% 50%)" },
];

type FirstSlideType = {
  firstSlide?: any;
};

const FirstSlide = (props: FirstSlideType) => {
  const { firstSlide } = props;

  const {
    selectedShapeImage,
    uploadedShapeImage,
    setSelectedShapeImage,
    setUploadedShapeImage,
    elements,
    setElements,
    textElements,
    setTextElements,
  } = useCardEditor();

  const [activeTab, setActiveTab] = useState<"shape" | "text">("shape");
  const navigate = useNavigate();

  // Store which element's file input is currently active
  const activeElementRef = useRef<string | null>(null);
  // Separate hidden file input for adding images to canvas elements
  const canvasFileRef = useRef<HTMLInputElement>(null);
  // Currently selected element for editing (select only)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  // Selected text element id (for editing & toolbar)
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  // Dragging guard to avoid click firing after drag
  const draggingRef = useRef(false);

  // ✅ Handle file upload for shape image
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedShapeImage(reader.result as string);
      };
      reader.readAsDataURL(file); // Convert image to base64
    }
  };

  // ✅ Add image box
  const handleAddImage = () => {
    const id = `el_${Date.now()}`;
    const newEl = {
      id,
      x: 60,
      y: 60,
      width: 200,
      height: 120,
      src: null,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(id);
    // Immediately trigger file upload for the new element
    activeElementRef.current = id;
    canvasFileRef.current?.click();
  };

  // ✅ Trigger upload manually for a selected element
  const uploadToSelected = (id: string) => {
    activeElementRef.current = id;
    canvasFileRef.current?.click();
  };

  // ✅ Add a text element
  const handleAddText = () => {
    const id = `txt_${Date.now()}`;
    const newEl = {
      id,
      x: 60,
      y: 60,
      width: 200,
      height: 60,
      text: "",
      bold: false,
      italic: false,
      fontSize: 20,
      fontFamily: "Arial",
      color: "#000000",
    };
    setTextElements((prev) => [...prev, newEl]);
    setSelectedTextId(id);
    setSelectedElementId(null);
  };

  // ✅ Update text element
  const updateTextElement = (
    id: string,
    patch: Partial<{
      text: string;
      bold: boolean;
      italic: boolean;
      fontSize: number;
      fontFamily: string;
      color: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  ) => {
    setTextElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  // ✅ Handle file change for canvas elements
  const handleCanvasFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeElementRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return;

      setElements((prev) =>
        prev.map((el) =>
          el.id === activeElementRef.current ? { ...el, src } : el
        )
      );
    };
    reader.readAsDataURL(file);

    e.target.value = ""; // Allow re-upload of the same file
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: "25px" }}>First Slide</Typography>
        <LandingButton
          title="Save Changes"
          onClick={() => {
            navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS, {
              state: {
                formData: {
                  elements,
                  textElements,
                  selectedShapeImage,
                  uploadedShapeImage,
                },
              },
            });
          }}
        />
      </Box>
      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: "block" },
          gap: 2,
          alignItems: "center",
          width: "100%",
          mb: 2,
        }}
      >
        {/* LEFT SIDE — Shape Preview or Banner */}
        {activeTab === "text" ? (
          <Box
            component={"div"}
            sx={{
              width: { md: "400px", sm: "400px", xs: "100%" },
              height: { md: "600px", sm: "600px", xs: "400px" },
              borderRadius: "12px",
              boxShadow: "3px 5px 8px gray",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: activeTab === "text" ? "white" : "#e6e6e6ff",
              position: "relative",
              overflow: "hidden",
              border: "1px solid lightgray",
              cursor: "pointer",
              p: 1,
            }}
          >
            {/* Top toolbar for selected text element */}
            {selectedTextId && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  display: "flex",
                  flexDirection: "column",
                  height: {md:"60%",sm:"60%",xs:'100%'},
                  gap: 2,
                  alignItems: "center",
                  zIndex: 200,
                  bgcolor: "rgba(255,255,255)",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    updateTextElement(selectedTextId, {
                      bold: !textElements.find((t) => t.id === selectedTextId)
                        ?.bold,
                    })
                  }
                >
                  <FormatBold />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() =>
                    updateTextElement(selectedTextId, {
                      italic: !textElements.find((t) => t.id === selectedTextId)
                        ?.italic,
                    })
                  }
                >
                  <FormatItalic />
                </IconButton>

                {/* Font size input */}
                <TextField
                  size="small"
                  type="number"
                  variant="standard"
                  value={
                    textElements.find((t) => t.id === selectedTextId)
                      ?.fontSize || 20
                  }
                  onChange={(e) =>
                    updateTextElement(selectedTextId, {
                      fontSize: Number(e.target.value || 20),
                    })
                  }
                  sx={{ width: 70 }}
                  inputProps={{ min: 8, max: 200 }}
                  label="Size"
                />

                <Select
                  size="small"
                  value={
                    textElements
                      .find((t) => t.id === selectedTextId)
                      ?.fontFamily?.slice(0, 4) || "Arial"
                  }
                  onChange={(e) =>
                    updateTextElement(selectedTextId, {
                      fontFamily: String(e.target.value),
                    })
                  }
                  displayEmpty
                  sx={{ minWidth: 60 }}
                  renderValue={(v) => (v ? String(v) : "Family")}
                >
                  {/* Default / fallback option */}
                  <MenuItem value="Arial">Arial</MenuItem>

                  {/* Load Google font list */}
                  {GOOGLE_FONTS.map((f) => (
                    <MenuItem key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>

                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    bgcolor:
                      textElements.find((t) => t.id === selectedTextId)
                        ?.color || "#000000",
                    cursor: "pointer",
                    border: "2px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                  onClick={() =>
                    document.getElementById("hiddenColorInput")?.click()
                  }
                >
                  <input
                    id="hiddenColorInput"
                    type="color"
                    value={
                      textElements.find((t) => t.id === selectedTextId)
                        ?.color || "#000000"
                    }
                    onChange={(e) =>
                      updateTextElement(selectedTextId, {
                        color: e.target.value,
                      })
                    }
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: "absolute",
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }} />
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: "green",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#212121",
                    },
                  }}
                  onClick={() => {
                    setSelectedTextId(null);
                  }}
                >
                  <Check fontSize="large" />
                </IconButton>
              </Box>
            )}
            {/* File input for canvas elements */}
            <input
              type="file"
              accept="image/*"
              ref={canvasFileRef}
              style={{ display: "none" }}
              onChange={handleCanvasFileChange}
            />
            {/* Render all canvas elements as Rnd components */}
            {elements.map((el) => (
              <Rnd
                key={el.id}
                default={{
                  x: el.x,
                  y: el.y,
                  width: el.width,
                  height: el.height,
                }}
                bounds="parent"
                onDragStart={() => {
                  draggingRef.current = true;
                }}
                onDragStop={(_, d) => {
                  setElements((prev) =>
                    prev.map((p) =>
                      p.id === el.id ? { ...p, x: d.x, y: d.y } : p
                    )
                  );
                  setTimeout(() => (draggingRef.current = false), 50);
                }}
                onResizeStart={() => {
                  draggingRef.current = true;
                }}
                onResizeStop={(_, __, ref, ___, position) => {
                  setElements((prev) =>
                    prev.map((p) =>
                      p.id === el.id
                        ? {
                            ...p,
                            width: parseInt(ref.style.width, 10),
                            height: parseInt(ref.style.height, 10),
                            x: position.x,
                            y: position.y,
                          }
                        : p
                    )
                  );
                  setTimeout(() => (draggingRef.current = false), 50);
                }}
                style={{
                  borderRadius: 8,
                  backgroundColor: el.src ? "transparent" : "lightGray",
                  border:
                    selectedElementId === el.id
                      ? "2px solid #1976d2"
                      : "1px solid rgba(0,0,0,0.2)",
                  position: "absolute",
                  zIndex: selectedElementId === el.id ? 40 : 30,
                  overflow: "hidden",
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
                onClick={(e: any) => {
                  e.stopPropagation();
                  if (draggingRef.current) return;
                  setSelectedElementId(el.id);
                  uploadToSelected(el.id);
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 99,
                    fontSize: 14,
                    transition: "opacity 0.2s",
                    "&:hover": {
                      opacity: 1,
                      backgroundColor: "rgba(0,0,0,0.8)",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setElements((prev) => prev.filter((p) => p.id !== el.id));
                    if (selectedElementId === el.id) {
                      setSelectedElementId(null);
                    }
                  }}
                >
                  ✕
                </Box>
                {el.src ? (
                  <Box
                    component="img"
                    src={el.src}
                    alt="uploaded"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <ImageRounded sx={{ color: "gray", fontSize: 40 }} />
                  </Box>
                )}
              </Rnd>
            ))}

            {/* Render text elements */}
            {textElements.map((t) => (
              <Rnd
                key={t.id}
                default={{ x: t.x, y: t.y, width: t.width, height: t.height }}
                bounds="parent"
                onDragStart={() => {
                  draggingRef.current = true;
                }}
                onDragStop={(_, d) => {
                  updateTextElement(t.id, { x: d.x, y: d.y });
                  setTimeout(() => (draggingRef.current = false), 50);
                }}
                onResizeStart={() => {
                  draggingRef.current = true;
                }}
                onResizeStop={(_, __, ref, ___, position) => {
                  updateTextElement(t.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    x: position.x,
                    y: position.y,
                  });
                  setTimeout(() => (draggingRef.current = false), 50);
                }}
                style={{
                  borderRadius: 8,
                  backgroundColor: "transparent",
                  border:
                    selectedTextId === t.id
                      ? "2px solid #1976d2"
                      : "1px solid rgba(0,0,0,0.06)",
                  position: "absolute",
                  zIndex: selectedTextId === t.id ? 50 : 30,
                  overflow: "hidden",
                }}
                resizeHandleStyles={{
                  bottomRight: {
                    width: "10px",
                    height: "10px",
                    background: "white",
                    borderRadius: "10%",
                    right: "-5px",
                    bottom: "-5px",
                  },
                }}
                onClick={() => {
                  if (draggingRef.current) return;
                  setSelectedTextId(t.id);
                  setSelectedElementId(null);
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1,
                    bgcolor: selectedTextId === t.id ? "white" : "transparent",
                  }}
                >
                  {selectedTextId === t.id ? (
                    <>
                      <TextField
                        multiline
                        value={t.text}
                        onChange={(e) =>
                          updateTextElement(t.id, { text: e.target.value })
                        }
                        variant="standard"
                        autoFocus
                        sx={{
                          width: "100%",
                          fontWeight: t.bold ? 700 : 400,
                          fontStyle: t.italic ? "italic" : "normal",
                          fontSize: t.fontSize,
                          fontFamily: t.fontFamily,
                          color: t.color,
                        }}
                        InputProps={{
                          disableUnderline: true,
                          style: {
                            fontWeight: t.bold ? 700 : 400,
                            fontStyle: t.italic ? "italic" : "normal",
                            fontSize: t.fontSize,
                            fontFamily: t.fontFamily,
                            color: t.color,
                          },
                        }}
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setTextElements((prev) =>
                            prev.filter((el) => el.id !== t.id)
                          );
                          setSelectedTextId(null);
                        }}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bgcolor: "black",
                          color: "white",
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
                    </>
                  ) : (
                    <Typography
                      sx={{
                        fontWeight: t.bold ? 700 : 400,
                        fontStyle: t.italic ? "italic" : "normal",
                        fontSize: t.fontSize,
                        fontFamily: t.fontFamily,
                        color: t.color,
                        textAlign: "center",
                        width: "100%",
                        position: "relative",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        bgcolor: "transparent",
                      }}
                    >
                      {t.text}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextId(t.id);
                          setSelectedElementId(null);
                        }}
                        sx={{ position: "absolute", top: -15, right: -8 }}
                      >
                        <Edit color="info" />
                      </IconButton>
                    </Typography>
                  )}
                </Box>
              </Rnd>
            ))}
          </Box>
        ) : (
          <>
            {/* HIDDEN INPUT FIELD */}
            <input
              id="uploadInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            {/* LEFT SIDE — Shape Preview or Banner */}
            <Box
              component={"div"}
              sx={{
                width: { md: "400px", sm: "400px", xs: "100%" },
                height: { md: "600px", sm: "600px", xs: "400px" },
                borderRadius: "12px",
                boxShadow: "3px 5px 8px gray",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#e6e6e6ff",
                position: "relative",
                overflow: "hidden",
                border: "1px solid lightgray",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("uploadInput")?.click()}
            >
              {uploadedShapeImage || firstSlide?.cardImage ? (
                <Box
                  component="img"
                  src={uploadedShapeImage || firstSlide?.cardImage}
                  alt="Uploaded Preview"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    clipPath:
                      shapes.find((s) => s.path === selectedShapeImage)?.path ||
                      "none",
                    borderRadius: "12px",
                    transition: "0.3s ease",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#777",
                    textAlign: "center",
                  }}
                >
                  <Box
                    component="img"
                    src="/assets/icons/gallery.png"
                    alt="Upload"
                    sx={{
                      width: 120,
                      height: 120,
                      opacity: 0.6,
                    }}
                  />
                  <Typography sx={{ fontSize: "18px", fontWeight: 500 }}>
                    Upload Image
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "#999" }}>
                    Click to choose a file
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* RIGHT SIDE — Tabs and Content */}
        <Box
          sx={{
            width: { md: "75%", sm: "60%", xs: "100%" },
            height: { md: "600px", sm: "600px", xs: "400px" },
            borderRadius: "12px",
            border: "1px solid lightgray",
            display: "flex",
            flexDirection: "column",
            mt: { md: 0, sm: 0, xs: 3 },
          }}
        >
          {/* Tabs */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              p: 1,
              borderBottom: "1px solid gray",
            }}
          >
            <Box
              component="button"
              onClick={() => setActiveTab("shape")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Interests
                sx={{ color: activeTab === "shape" ? "orange" : "gray" }}
                fontSize="large"
              />
              <Typography
                variant="body2"
                sx={{ color: activeTab === "shape" ? "orange" : "gray" }}
              >
                Shape
              </Typography>
            </Box>

            <Box
              component="button"
              onClick={() => setActiveTab("text")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <AutoFixHigh
                sx={{ color: activeTab === "text" ? "orange" : "gray" }}
                fontSize="large"
              />
              <Typography
                variant="body2"
                sx={{ color: activeTab === "text" ? "orange" : "gray" }}
              >
                Layout
              </Typography>
            </Box>
          </Box>

          {/* Tab Content */}
          <Box
            sx={{ p: { md: 1, sm: 1, xs: "4px" }, flex: 1, overflowY: "auto" }}
          >
            {activeTab === "shape" && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {shapes.map((shape) => (
                    <Box
                      key={shape.id}
                      onClick={() => setSelectedShapeImage(shape.path)}
                      sx={{
                        width: { md: 160, sm: 160, xs: 90 },
                        height: { md: 150, sm: 150, xs: 100 },
                        border: "1px solid lightgray",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        sx={{
                          width: { md: "80px", sm: "80px", xs: "50%" },
                          height: { md: "80px", sm: "80px", xs: "50%" },
                          margin: "auto",
                          clipPath: shape.path,
                          backgroundColor:
                            selectedShapeImage === shape.path
                              ? "orange"
                              : "#9b7d7dff",
                          transition: "0.3s",
                          "&:hover": { backgroundColor: "orange" },
                        }}
                      />
                      <Typography
                        align="center"
                        sx={{
                          mt: 1,
                          fontSize: { md: "auto", sm: "auto", xs: "14px" },
                          color:
                            selectedShapeImage === shape.path
                              ? "orange"
                              : "#9b7d7dff",
                        }}
                      >
                        {shape.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {activeTab === "text" && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  width: "100%",
                  gap:{md: 2,sm: 2,xs:1},
                }}
              >
                <Box
                  onClick={handleAddImage}
                  sx={{
                    width: { md: 200, sm: 200, xs: "140px" },
                    height: 100,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid gray",
                    borderRadius: 2,
                    color: "gray",
                    cursor: "pointer",
                  }}
                >
                  <Add fontSize="large" />
                  Add Image
                </Box>
                <Box
                  onClick={handleAddText}
                  sx={{
                    width: { md: 200, sm: 200, xs: "140px" },
                    height: 100,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid gray",
                    borderRadius: 2,
                    color: "gray",
                    cursor: "pointer",
                  }}
                >
                  <Add fontSize="large" />
                  Add Text
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default FirstSlide;
