import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";
import LandingButton from "../LandingButton/LandingButton";

const VIPFunky = () => {
  return (
    <Box
      sx={{
        mt: 6,
        width: "95%",
        height: { md: "400px", sm: "", xs: "auto" },
        borderRadius: 4,
        bgcolor: COLORS.primary,
        color: COLORS.white,
        display: { md: "flex", sm: "", xs: "block" },
        alignItems: "center",
        justifyContent: "space-around",
        m: "auto",
      }}
    >
      {/* <Box
        component={"img"}
        src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2FfunkyVIPs%2Ffunky.png&w=256&q=75"
        width={300}
        height={300}
      /> */}
      <Box
        component={"img"}
        src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2FfunkyVIPs%2Ffunky.png&w=256&q=75"
        sx={{
          width: { md: 300, sm: 300, xs: "100%" },
          height: { md: 300, sm: 300, xs: "100%" },
        }}
      />
      <Box
        component={"img"}
        src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2FfunkyVIPs%2Fvip-offer-text.png&w=640&q=75"
        sx={{
          width: { md: 500, sm: 300, xs: "100%" },
          height: { md: 300, sm: 300, xs: "100%" },
        }}
      />
      <Box
        component={"img"}
        src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2FfunkyVIPs%2Ffunky-vip-lanyard-straight.png&w=640&q=75"
        sx={{
          width: { md: 200, sm: 300, xs: "100%" },
          height: { md: 300, sm: 300, xs: "100%" },
        }}
      />

      <LandingButton title="Tell Me More!" personal />
    </Box>
  );
};

export default VIPFunky;
