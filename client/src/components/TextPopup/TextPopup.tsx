// TextPopup.tsx
import { Box, IconButton } from "@mui/material";
import {
  TextIncreaseOutlined,
  FontDownload,
  PaletteOutlined,
  FormatAlignCenterOutlined,
  TextRotationAngleupOutlined,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Delete,
  Check,
} from "@mui/icons-material";
import PopupWrapper from "../PopupWrapper/PopupWrapper";
import { useWishCard } from "../../context/WishCardContext";

interface TextPopupProps {
  onClose: () => void;
  onShowFontSizePopup: () => void;
}

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

const textAlignOptions = ["start", "center", "end"];
const fontColors = [
  "#000000", // Black
  "#FF0000", // Red
  "#008000", // Green
  "#0000FF", // Blue
  "#FFA500", // Orange
  "#800080", // Purple
  "#00FFFF", // Cyan
  "#FFC0CB", // Pink
  "#808080", // Gray
  "#FFD700", // Gold
];

const TextPopup = ({
  onClose,
  onShowFontSizePopup,
}: TextPopupProps) => {

  const {setFontWeight,setTextAlign,setFontColor,setRotation} = useWishCard()

    const rotationSteps = [
    0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360,
  ];
  // IncreaseFontWieght
  const increaseFontWeight = () => {
    setFontWeight((prevSize) => prevSize + 100);
  };
  // Change Text Align
  const changeTextAlign = () => {
    setTextAlign((prevAlign):any => {
      const currentIndex = textAlignOptions.indexOf(prevAlign);
      const nextIndex = (currentIndex + 1) % textAlignOptions.length;
      return textAlignOptions[nextIndex];
    });
  };
  // Change TextColor
  const changeFontColor = () => {
    setFontColor((prevColor) => {
      const currentIndex = fontColors.indexOf(prevColor);
      const nextIndex = (currentIndex + 1) % fontColors.length;
      return fontColors[nextIndex];
    });
  };
  // Text Rotation
  const rotateText = () => {
    setRotation((prevRotation) => {
      const currentIndex = rotationSteps.indexOf(prevRotation);
      const nextIndex = (currentIndex + 1) % rotationSteps.length;
      return rotationSteps[nextIndex];
    });
  };


  return (
    <PopupWrapper title="" sx={{ width: 80, height: 600, left: "24%",overflowY:'auto' }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center",p:1 }}>
        <IconButton onClick={onShowFontSizePopup} sx={{ ...editingButtonStyle, color: "#212121" }}>
          <TextIncreaseOutlined fontSize="large" />
          Size
        </IconButton>
        <IconButton onClick={increaseFontWeight} sx={{ ...editingButtonStyle, color: "#212121" }}>
          <FontDownload fontSize="large" />
          Bold
        </IconButton>
        <IconButton onClick={changeFontColor} sx={{ ...editingButtonStyle, color: "#212121" }}>
          <PaletteOutlined fontSize="large" />
          Colour
        </IconButton>
        <IconButton onClick={changeTextAlign} sx={{ ...editingButtonStyle, color: "#212121" }}>
          <FormatAlignCenterOutlined fontSize="large" />
          Align
        </IconButton>
        <IconButton onClick={rotateText} sx={{ ...editingButtonStyle, color: "#212121" }}>
          <TextRotationAngleupOutlined fontSize="large" />
          Rotate
        </IconButton>
        <IconButton sx={{ ...editingButtonStyle, color: "#212121" }}>
          <KeyboardArrowUp fontSize="large" />
          To Front
        </IconButton>
        <IconButton sx={{ ...editingButtonStyle, color: "#212121" }}>
          <KeyboardArrowDown fontSize="large" />
          To Back
        </IconButton>
        <IconButton onClick={onClose} sx={{ ...editingButtonStyle, color: "#212121" }}>
          <Delete fontSize="large" />
          Delete
        </IconButton>
        <IconButton
          sx={{
            display: "flex",
            flexDirection: "column",
            fontSize: "14px",
            width: "60px",
            height: "60px",
            border: "1px solid #22863e",
            mt: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={onClose}
        >
          <Check fontSize="large" sx={{ color: "#22863e" }} />
        </IconButton>
      </Box>
    </PopupWrapper>
  );
};

export default TextPopup;