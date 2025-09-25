import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";
import LandingButton from "../LandingButton/LandingButton";

const Banner = () => {
  return (
    <Box
      sx={{
        height: { md: "500px", sm: "", xs: "100vh" },
        width: "100%",
        position: "relative",
        overflow: "hidden",
        mt: 10,
        borderRadius:3
      }}
    >
      {/* Video */}
      <Box
        component="video"
        src="https://www.pexels.com/download/video/3626148/"
        autoPlay
        loop
        muted
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(60%)",
        }}
      />

      {/* Black gradient overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "50%", // Adjust how much gradient covers
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.82), rgba(0,0,0,0))",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: { md: "18%", sm: "", xs: 10 },
          color: COLORS.white,
          p: 2,
          left: { md: "2%", sm: "", xs: 0 },
        }}
      >
        <Typography
          sx={{
            fontSize: {
              md: "40px",
              sm: "",
              xs: "25px",
              fontWeight: 800,
              width: "100%",
            },
          }}
        >
          Your flock deserve better!
        </Typography>
        <Typography
          sx={{
            fontSize: {
              md: "20px",
              sm: "",
              xs: "18px",
              width: "auto",
            },
          }}
        >
          Make it personal and show you give a funk!
        </Typography>

        <Box
          sx={{
            display: {md:"flex",sm:'flex',xs:'block'},
            gap: "10px",
            flexWrap: "wrap",
            width: {md:"50%",sm:'',xs:'100%'},
            mt: 5,
          }}
        >
          <LandingButton title="For Her" width="250px" personal />
          <LandingButton title="For Him" width="250px" personal />
          <LandingButton title="Kids Birthday" width="250px" personal />
          <LandingButton title="All Birthday" width="250px" personal />
        </Box>
      </Box>
    </Box>
  );
};

export default Banner;
