import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";
import LandingButton from "../LandingButton/LandingButton";

const GiveFunk = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: { md: "600px", sm: "", xs: "auto" },
        borderRadius: 4,
        p: 4,
        bgcolor: COLORS.primary,
        color: COLORS.white,
      }}
    >
      <Box
        component={"img"}
        src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2FfunkyVIPs%2Fvip-offer-text.png&w=640&q=75"
        sx={{
          width: { md: 1000, sm: 400, xs: "100%" },
          height: { md: 400, sm: "", xs: "auto" },
        }}
      />
      <Box
        sx={{
          display: {md:"flex",sm:'flex',xs:'block'},
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((_) => (
          <LandingButton title="Shop App" width="300px" />
        ))}
      </Box>
    </Box>
  );
};

export default GiveFunk;
