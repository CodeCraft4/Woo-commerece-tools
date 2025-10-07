import React, { useState } from "react";
import { Box } from "@mui/material";
import { useWishCard } from "../../context/WishCardContext";
import { ChromePicker } from "react-color";


const FontColorPopup = () => {
  const { setFontColor } = useWishCard();
  // Initialize state with a default color
  const initialColor = "#000000";
  // const [selected, setSelected] = useState<string>(initialColor);

  // 2. State for the custom color picker value
  const [pickerColor, setPickerColor] = useState<string>(initialColor);

  const handlePickerChangeComplete = (color: any) => {
    const hex = color.hex;
    setFontColor(hex);
    setPickerColor(hex);
  };

  React.useEffect(() => {
    setFontColor(initialColor);
  }, [setFontColor, initialColor]);

  return (
    // <PopupWrapper
    //   title="Font Colors"
    //   onClose={onClose}
    //   sx={{ }}
    // >
    <Box
      sx={{
        py: 2,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        width: 460,
        height: 420,
        mt: 4,
      }}
    >
      <ChromePicker
        color={pickerColor} // Use the pickerColor state
        onChangeComplete={handlePickerChangeComplete}
        disableAlpha={true}
        styles={{
          default: {
            picker: { boxShadow: "none", width: "95%", height: "100%" },
          },
        }}
      />
    </Box>
    // </PopupWrapper>
  );
};

export default FontColorPopup;
