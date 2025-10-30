import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";

const VIPFunky = () => {
  return (
    <Box
      sx={{
        mt: 8,
        width: "100%",
        height: { md: "400px", sm: "300px", xs: "auto" },
        borderRadius: 4,
        bgcolor: COLORS.primary,
        color: COLORS.white,
        display: { md: "flex", sm: "flex", xs: "block" },
        alignItems: "center",
        justifyContent: "space-around",
        m: "auto",
      }}
    >
      <Box
        component={"img"}
        src="/assets/images/banner2.jpg"
        sx={{
          width: { md: "100%", sm: '100%', xs: "100%" },
          height: { md: 400, sm: 300, xs: '100%' },
          borderRadius: 3,
          objectFit: "cover",
        }}
      />
    </Box>
  );
};

export default VIPFunky;
