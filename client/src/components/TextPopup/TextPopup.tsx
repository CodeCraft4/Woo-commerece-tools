// TextPopup.tsx
import { Box, IconButton, Typography } from "@mui/material";
import {
  TextIncreaseOutlined,
  TextFields, // Changed from FontDownload to TextFields for Font Family icon
  PaletteOutlined,
  FormatAlignCenterOutlined,
  TextRotationAngleupOutlined,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Delete,
  FormatBoldOutlined,
  Title, // Use FormatBoldOutlined for Bold instead of FontDownload
} from "@mui/icons-material";
import PopupWrapper from "../PopupWrapper/PopupWrapper";
import { useWishCard } from "../../context/WishCardContext";
import { COLORS } from "../../constant/color";
import React from "react";

interface TextPopupProps {
  onClose?: () => void;
  onShowFontSizePopup: () => void;
  onShowFontColorPopup: () => void;
  onShowFontFamilyPopup: () => void;
  activeChildComponent: React.ReactNode | null;
  onAddTextToCanvas?: () => void;
}

const editingButtonStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: "13px",
  color: "#212121",
  p: 1,
  "&:hover": {
    color: COLORS.primary, // Use a primary color for hover
  },
};

const textAlignOptions = ["start", "center", "end"];

const TextPopup = ({
  onClose,
  onShowFontSizePopup,
  onShowFontColorPopup,
  onShowFontFamilyPopup,
  activeChildComponent,
  onAddTextToCanvas,
}: TextPopupProps) => {
  const { setFontWeight, setTextAlign, setRotation, fontWeight } =
    useWishCard();

  // Function to toggle Font Weight (Bold) between 400 and 700
  const toggleFontWeight = () => {
    setFontWeight((prevWeight) => (prevWeight === 700 ? 400 : 700));
  };

  // Change Text Align
  const changeTextAlign = () => {
    setTextAlign((prevAlign): any => {
      const currentIndex = textAlignOptions.indexOf(prevAlign);
      const nextIndex = (currentIndex + 1) % textAlignOptions.length;
      return textAlignOptions[nextIndex];
    });
  };

  // Text Rotation
  const rotateText = () => {
    setRotation((prevRotation) => {
      // Rotate by 30 degrees increments
      const nextRotation = (prevRotation + 30) % 360;
      return nextRotation;
    });
  };

  return (
    <PopupWrapper
      title={"Text Editing"}
      onClose={onClose}
      sx={{
        width: 500,
        height: 600,
        left: "1%",
        overflowY: "hidden",
      }}
    >
      {/* 1. MAIN ICON BAR (Visible if no child popup is active) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px", // Reduced gap
          justifyContent: "space-between", // Better spacing
          p: 1,
          width: "100%",
          overflowX: "scroll",
          // Keep the scrollbar styles for overflow
          "&::-webkit-scrollbar": { height: "6px" },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: COLORS.primary,
            borderRadius: "20px",
          },
        }}
      >
        {/* Add Text */}
        <IconButton  onClick={onAddTextToCanvas} sx={editingButtonStyle}>
          <Title fontSize="large" />
          <Typography variant="caption">Add</Typography>
        </IconButton>
        {/* Size */}
        <IconButton onClick={onShowFontSizePopup} sx={editingButtonStyle}>
          <TextIncreaseOutlined fontSize="large" />
          <Typography variant="caption">Size</Typography>
        </IconButton>

        {/* Font Family */}
        <IconButton onClick={onShowFontFamilyPopup} sx={editingButtonStyle}>
          <TextFields fontSize="large" />
          <Typography variant="caption">Font</Typography>
        </IconButton>

        {/* Bold/Font Weight Toggle */}
        <IconButton
          onClick={toggleFontWeight}
          sx={{
            ...editingButtonStyle,
            color: fontWeight === 700 ? COLORS.primary : "#212121",
          }}
        >
          <FormatBoldOutlined fontSize="large" />
          <Typography variant="caption">Bold</Typography>
        </IconButton>

        {/* Colour */}
        <IconButton onClick={onShowFontColorPopup} sx={editingButtonStyle}>
          <PaletteOutlined fontSize="large" />
          <Typography variant="caption">Colour</Typography>
        </IconButton>

        {/* Align */}
        <IconButton onClick={changeTextAlign} sx={editingButtonStyle}>
          <FormatAlignCenterOutlined fontSize="large" />
          <Typography variant="caption">Align</Typography>
        </IconButton>

        {/* Rotate */}
        <IconButton onClick={rotateText} sx={editingButtonStyle}>
          <TextRotationAngleupOutlined fontSize="large" />
          <Typography variant="caption">Rotate</Typography>
        </IconButton>

        {/* Layering and Delete - Keep for completeness */}
        <IconButton sx={editingButtonStyle}>
          <KeyboardArrowUp fontSize="large" />
          <Typography variant="caption">To Front</Typography>
        </IconButton>
        <IconButton sx={editingButtonStyle}>
          <KeyboardArrowDown fontSize="large" />
          <Typography variant="caption">To Back</Typography>
        </IconButton>
        <IconButton sx={editingButtonStyle}>
          <Delete fontSize="large" />
          <Typography variant="caption">Delete</Typography>
        </IconButton>
      </Box>

      {/* 2. CHILD COMPONENT CONTAINER (Renders the sub-popup content) */}
      <Box
        sx={{
          display: activeChildComponent ? "block" : "none",
          width: "100%",
          height: "100%",
          // The padding and margin will be managed by the child component itself (e.g., FontSizePopup)
        }}
      >
        {activeChildComponent}
      </Box>
    </PopupWrapper>
  );
};

export default TextPopup;
