import { Box, Typography, TextField } from "@mui/material";
import PNGImg from "../../assets/bear.png";
import { useWishCard } from "../../context/WishCardContext";

const SlideCover = () => {
  const { title, setTitle } = useWishCard();

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
        p: 4,
      }}
    >
      <Box component="img" src={PNGImg} alt="Cover Image" />
      <Typography
        variant="h4"
        sx={{ fontSize: "35px", fontFamily: "cursive", p: 1 }}
      >
        HAPPY BIRTHDAY
      </Typography>

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
            color: "#e17f95",
            fontFamily: "sans-serif",
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
        }}
      />
    </Box>
  );
};

export default SlideCover;
