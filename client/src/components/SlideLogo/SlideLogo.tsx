// SlideLogo.tsx
import { Box, Typography } from "@mui/material";

const SlideLogo = () => {
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        fontWeight: "bold",
        color: "black",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Box
       component={'img'}
       src="/assets/images/blackLOGO.png"
       sx={{width:300}}
      />
      <Typography sx={{ maxWidth: 400, textAlign: "center" }}>
        I accept the Terms & Conditions and give my consent to proceed with the order.
      </Typography>
    </Box>
  );
};

export default SlideLogo;