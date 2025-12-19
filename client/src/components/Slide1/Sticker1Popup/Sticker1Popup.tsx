// Sticker1Popup.tsx
import { Box } from "@mui/material";
import PopupWrapper from "../../PopupWrapper/PopupWrapper";
import { STICKERS_DATA } from "../../../constant/data";
import { COLORS } from "../../../constant/color";
import { useSlide1 } from "../../../context/Slide1Context";

interface Sticker1PopupProps {
  onClose: () => void;
  activeIndex?: number;
}

const Sticker1Popup = ({ onClose, activeIndex }: Sticker1PopupProps) => {
  const { addSticker1 } = useSlide1();

  const handleSelectSticker = (stick: any) => {
    addSticker1(stick);
  };

  return (
    <PopupWrapper
      title="Sticker"
      onClose={onClose}
      sx={{
        width: { md: 300, sm: 300, xs: "95%" },
        height: { md: 600, sm: 600, xs: 450 },
        mt: { md: 0, sm: 0, xs: 4 },
        left: activeIndex === 0 ? { md: "13%", sm: "13%", xs: 0 } : "16%",
      }}
    >
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            height: "6px",
            width: "5px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: COLORS.primary,
            borderRadius: "20px",
          },
          height: 500,
        }}
      >
        {STICKERS_DATA.map((stick) => (
          <Box
            key={stick.id}
            onClick={() => handleSelectSticker(stick)}
            sx={{
              width: { md: "80px", sm: "80px", xs: "70px" },
              height: "90px",
              borderRadius: 2,
              bgcolor: "rgba(233, 232, 232, 1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              cursor: "pointer",
            }}
          >
            <Box
              component={"img"}
              src={stick.sticker}
              sx={{ width: "100%", height: "auto" }}
            />
          </Box>
        ))}
      </Box>
    </PopupWrapper>
  );
};

export default Sticker1Popup;
