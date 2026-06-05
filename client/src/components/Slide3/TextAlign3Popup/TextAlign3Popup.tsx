import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  VerticalAlignTop,
  VerticalAlignCenter,
  VerticalAlignBottom,
} from "@mui/icons-material";
import { Box, Divider, Typography } from "@mui/material";
import { useEffect } from "react";
import { useSlide3 } from "../../../context/Slide3Context";

const verticalAlignOptions = [
  { key: "top", icon: <VerticalAlignTop />, label: "Top" },
  { key: "center", icon: <VerticalAlignCenter />, label: "Center" },
  { key: "bottom", icon: <VerticalAlignBottom />, label: "Bottom" },
];

const horizontalAlignOptions = [
  { key: "left", icon: <FormatAlignLeft />, label: "Left" },
  { key: "center", icon: <FormatAlignCenter />, label: "Center" },
  { key: "right", icon: <FormatAlignRight />, label: "Right" },
];

const normalizeVerticalAlign = (value: any) =>
  value === "top" || value === "bottom" || value === "center"
    ? value
    : "center";

const normalizeHorizontalAlign = (value: any) => {
  if (value === "left" || value === "start") return "left";
  if (value === "right" || value === "end") return "right";
  return "center";
};

const TextAlign3Popup = () => {
  const {
    verticalAlign3,
    textAlign3,
    textElements3,
    selectedTextId3,
    setTextElements3,
    setVerticalAlign3,
    setTextAlign3,
  } = useSlide3();

  const selectedTextElement = textElements3.find(
    (text) => text.id === selectedTextId3
  );
  const activeVerticalAlign = normalizeVerticalAlign(
    selectedTextElement?.verticalAlign ?? verticalAlign3
  );
  const activeHorizontalAlign = normalizeHorizontalAlign(
    selectedTextElement?.textAlign ?? textAlign3
  );

  useEffect(() => {
    if (!selectedTextId3 || !selectedTextElement) return;
    const nextVerticalAlign = normalizeVerticalAlign(selectedTextElement.verticalAlign);
    const nextHorizontalAlign = normalizeHorizontalAlign(selectedTextElement.textAlign);
    if (
      selectedTextElement.verticalAlign === nextVerticalAlign &&
      selectedTextElement.textAlign === nextHorizontalAlign
    ) {
      return;
    }

    setTextElements3((prev) =>
      prev.map((text) =>
        text.id === selectedTextId3
          ? { ...text, verticalAlign: nextVerticalAlign, textAlign: nextHorizontalAlign }
          : text
      )
    );
  }, [selectedTextElement, selectedTextId3, setTextElements3]);

  const updateTextProperty = (property: string, value: any) => {
    if (selectedTextId3) {
      setTextElements3((prev) =>
        prev.map((text) =>
          text.id === selectedTextId3 ? { ...text, [property]: value } : text
        )
      );
    } else {
      if (property === "verticalAlign") setVerticalAlign3(value);
      if (property === "textAlign") setTextAlign3(value);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        width: { md: 460, sm: 230, xs: "100%" },
        height: {md: 400,sm:400,xs:200},
        mt: {md: 4, sm: 4, xs: 0},
        textAlign: "start",
        overflowY: "auto",
      }}
    >
      {/* Vertical Alignment */}
      <Box>
        <Typography fontSize={{ md: 20, sm: 20, xs: 15 }} fontWeight={"bold"}>
          Vertical Alignment
        </Typography>
        <Divider />
        <Box sx={{ display: "flex", gap: 2, py: 2 }}>
          {verticalAlignOptions.map((opt) => (
            <Box
              key={opt.key}
              onClick={() => updateTextProperty("verticalAlign", opt.key)}
              sx={{
                p: 2,
                border: `2px solid ${
                  activeVerticalAlign === opt.key
                    ? "#3a7bd5"
                    : "lightgray"
                }`,
                borderRadius: 3,
                cursor: "pointer",
                color:
                  activeVerticalAlign === opt.key
                    ? "#3a7bd5"
                    : "inherit",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#3a7bd5" },
              }}
            >
              {opt.icon}
            </Box>
          ))}
        </Box>
      </Box>

      <br />

      {/* Horizontal Alignment */}
      <Box>
        <Typography fontSize={{ md: 20, sm: 20, xs: 15 }} fontWeight={"bold"}>
          Horizontal Alignment
        </Typography>
        <Divider />
        <Box sx={{ display: "flex", gap: 2, py: 2 }}>
          {horizontalAlignOptions.map((opt) => (
            <Box
              key={opt.key}
              onClick={() => updateTextProperty("textAlign", opt.key)}
              sx={{
                p: 2,
                border: `2px solid ${
                  activeHorizontalAlign === opt.key
                    ? "#3a7bd5"
                    : "lightgray"
                }`,
                borderRadius: 3,
                cursor: "pointer",
                color:
                  activeHorizontalAlign === opt.key
                    ? "#3a7bd5"
                    : "inherit",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#3a7bd5" },
              }}
            >
              {opt.icon}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TextAlign3Popup;
