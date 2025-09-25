import { Box, TextField } from "@mui/material";
import PNGImg from "../../assets/bear.png";
import { useWishCard } from "../../context/WishCardContext";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const SlideCover = () => {
  const { title, setTitle } = useWishCard();
  const location = useLocation();
  const { poster } = location.state || {};
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
      {/* <Typography
        variant="h4"
        sx={{ fontSize: "35px", fontFamily: "cursive", p: 1 }}
      >
        HAPPY BIRTHDAY
      </Typography> */}

      <TextField
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        variant="standard"
        fullWidth
        InputProps={{
          disableUnderline: true,
          style: {
            fontSize: "30px",
            textAlign: "center",
            color: "White",
            fontWeight: "bold",
          },
          inputProps: {
            style: { textAlign: "center" },
          },
        }}
        sx={{
          backgroundColor: "transparent",
          border: "3px dashed #3e7dd4",
          p: 1.5,
          position: "absolute",
          bottom: 0,
        }}
      />
    </Box>
  );
};

export default SlideCover;
