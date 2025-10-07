import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useWishCard } from "../../context/WishCardContext";
import CheckIcon from "@mui/icons-material/Check";
import { GOOGLE_FONTS } from "../../constant/data";

const FontFamilyPopup = () => {
  // Assuming useWishCard provides 'fontFamily' state and 'setFontFamily' setter
  const { fontFamily, setFontFamily } = useWishCard();

  // Use local state to manage the selected font, initialized from context
  const [selectedFont, setSelectedFont] = useState<string>(
    fontFamily || GOOGLE_FONTS[0]
  );

  const handleSelectFont = (fontName: string) => {
    // 1. Update the context
    if (typeof setFontFamily === "function") {
      setFontFamily(fontName);
    }
    // 2. Update local state for visual feedback (checkmark)
    setSelectedFont(fontName);
    // 3. Optional: close the popup immediately after selection
    // onClose();
  };

  // Ensure initial context value is set/synced when the popup loads (optional)
  useEffect(() => {
    if (!fontFamily && typeof setFontFamily === "function") {
      setFontFamily(GOOGLE_FONTS[0]);
    }
  }, [fontFamily, setFontFamily]);

  return (
    // <PopupWrapper
    //   title="Font Family"
    //   onClose={onClose}
    //   sx={{  }}
    // >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        mt: 2,
        overflowY: "auto",
        width: 480,
        height: "430px",
      }}
    >
      {GOOGLE_FONTS.map((fontName) => {
        const isSelected = selectedFont === fontName;

        return (
          <Box
            key={fontName}
            onClick={() => handleSelectFont(fontName)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              px: 2,
              py: 1,
              borderRadius: 1,
              border: isSelected
                ? "2px solid #3a7bd5"
                : "1px solid transparent",
              backgroundColor: isSelected ? "#f0f8ff" : "white",
              "&:hover": {
                backgroundColor: isSelected ? "#f0f8ff" : "#f0f0f0",
              },
            }}
          >
            {/* Font Name / Preview */}
            <Typography
              variant="body1"
              sx={{
                fontFamily: fontName, // ❗ Apply the font here for preview
                fontSize: 18,
              }}
            >
              {fontName}
            </Typography>

            {/* Checkmark */}
            {isSelected && (
              <CheckIcon sx={{ fontSize: 20, color: "#3a7bd5" }} />
            )}
          </Box>
        );
      })}
    </Box>
    // </PopupWrapper>
  );
};

export default FontFamilyPopup;
