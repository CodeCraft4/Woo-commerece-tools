import { Box, Typography } from "@mui/material";

const MainSlide = () => {
  return (
    <Box>
      <Typography sx={{ fontSize: "25px" }}>Main Slide</Typography>
      <Box sx={{ display: "flex", p: 2, width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            bgcolor: "lightgray",
            height: "700px",
            border: "1px solid gray",
            boxShadow: "3px 4px 9px lightgray",
            borderRadius: "12px",
          }}
        >
          fadfadsfa
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            bgcolor: "lightgray",
            height: "700px",
            border: "1px solid gray",
            boxShadow: "3px 4px 9px lightgray",
            borderRadius: "12px",
          }}
        >
          fasdf
        </Box>
      </Box>
    </Box>
  );
};

export default MainSlide;
