import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";
import LandingButton from "../LandingButton/LandingButton";

const GiveFunk = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: { md: "700px", sm: "", xs: "auto" },
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
          height: { md: 500, sm: "", xs: "auto" },
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
          <LandingButton title="Shop App" width="400px" />
        ))}
      </Box>
    </Box>
  );
};

export default GiveFunk;
