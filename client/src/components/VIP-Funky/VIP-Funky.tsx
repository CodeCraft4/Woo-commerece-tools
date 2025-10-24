import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";

const VIPFunky = () => {
  return (
    <Box
      sx={{
        mt: 8,
        width: "100%",
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
      <Box
        component={"img"}
        src="/assets/images/banner2.jpg"
        sx={{
          width: { md: "100%", sm: 300, xs: "100%" },
          height: { md: 400, sm: 300, xs: '100%' },
          borderRadius: 3,
          objectFit: "cover",
        }}
      />
      {/* <Box
        component={"img"}
        src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2FfunkyVIPs%2Fvip-offer-text.png&w=640&q=75"
        sx={{
          width: { md: 400, sm: 300, xs: "100%" },
          height: { md: 250, sm: 300, xs: "100%" },
        }}
      />
      <Box
        component={"img"}
        src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2FfunkyVIPs%2Ffunky-vip-lanyard-straight.png&w=640&q=75"
        sx={{
          width: { md: 150, sm: 300, xs: "100%" },
          height: { md: 250, sm: 300, xs: "100%" },
        }}
      /> */}

      {/* <LandingButton title="Tell Me More!" personal width="300px" /> */}
    </Box>
  );
};

export default VIPFunky;
