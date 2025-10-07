import { Box } from "@mui/material";
import PNGImg from "/assets/images/bear.png";
import { useWishCard } from "../../context/WishCardContext";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const SlideCover = () => {
  const location = useLocation();
  const { poster } = (location.state as any) || {};
  const { setPoster } = useWishCard();

  useEffect(() => {
    if (poster) {
      setPoster(poster);
    }
  }, [poster, setPoster]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "#dae7de",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        position: "relative",
        // p: 4,
      }}
    >
      <Box
        component="img"
        src={poster ? poster : PNGImg}
        alt="Cover Image"
        sx={{ width: "100%", objectFit: "cover", height: "100%" }}
      />
    </Box>
  );
};

export default SlideCover;
