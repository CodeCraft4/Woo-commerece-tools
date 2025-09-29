// StickerPopup.tsx
import { Box} from "@mui/material";
import PopupWrapper from "../PopupWrapper/PopupWrapper";

interface StickerPopupProps {
  onClose: () => void;
}

const StickerPopup = ({ onClose }: StickerPopupProps) => {
  return (
    <PopupWrapper title="Sticker" onClose={onClose} sx={{ width: 300, height: 600, left: "12%" }}>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          overflowY: "auto",
          height: 500,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: "75px",
              height: "90px",
              borderRadius: 2,
              bgcolor: "rgba(139, 139, 139, 1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              userSelect: "none",
            }}
          >
            Sticker {i + 1}
          </Box>
        ))}
      </Box>
    </PopupWrapper>
  );
};

export default StickerPopup;