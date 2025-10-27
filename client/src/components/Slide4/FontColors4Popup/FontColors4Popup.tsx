import React, { useState } from "react";
import { Box } from "@mui/material";
import { ChromePicker } from "react-color";
import { useSlide4 } from "../../../context/Slide4Context";

const FontColor4Popup = () => {
  const {
    setFontColor4,
    fontColor4,
    textElements4,
    setTextElements4,
    selectedTextId4,
  } = useSlide4();
  // Initialize state with a default color
  const initialColor = "#000000";
  // const [selected, setSelected] = useState<string>(initialColor);
  // Get the currently selected text element
  const selectedTextElement = textElements4.find(
    (text) => text.id === selectedTextId4
  );

  // Use individual text color or global default
  const currentFontColor = selectedTextElement?.fontColor || fontColor4;

  // 2. State for the custom color picker value
  const [pickerColor, setPickerColor] = useState<string>(initialColor);

  const handlePickerChangeComplete = (color: any) => {
    const hex = color.hex;

    // Update individual text element or global context
    if (selectedTextElement) {
      setTextElements4((prev) =>
        prev.map((text) =>
          text.id === selectedTextId4 ? { ...text, fontColor: hex } : text
        )
      );
    } else {
      setFontColor4(hex);
    }

    setPickerColor(hex);
  };

  React.useEffect(() => {
    setPickerColor(currentFontColor);
  }, [currentFontColor]);

  return (
    <Box
      sx={{
        py: 2,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        width: {md:460,sm:460,xs:'100%'},
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
  );
};

export default FontColor4Popup;
