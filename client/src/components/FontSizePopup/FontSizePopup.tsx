// FontSizePopup.tsx
import { Box } from "@mui/material";
import PopupWrapper from "../PopupWrapper/PopupWrapper";
import { useWishCard } from "../../context/WishCardContext";

interface FontSizePopupProps {
  onClose: () => void;
}

const fontSizeArray = [
  25, 30, 35, 40, 45, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 75, 80,
];

const FontSizePopup = ({ onClose }: FontSizePopupProps) => {
  const { setFontSize } = useWishCard();
  const increaseFontSize = (size: number) => {
    setFontSize(size);
  };
  return (
    <PopupWrapper
      title="Text Size"
      onClose={onClose}
      sx={{ width: 250, height: 600, left: "15%" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 1,
          mt: 3,
          justifyContent: "center",
        }}
      >
        {fontSizeArray.map((size) => (
          <Box
            key={size}
            onClick={() => increaseFontSize(size)}
            sx={{
              borderRadius: 2,
              border: "2px solid #212121",
              p: 2,
              textAlign: "center",
              width: "48px",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#a4ecf1ff",
              },
            }}
          >
            {size}
          </Box>
        ))}
      </Box>
    </PopupWrapper>
  );
};

export default FontSizePopup;
