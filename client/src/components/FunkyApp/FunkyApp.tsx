import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";

const FunkyApp = () => {
  return (
    <Box
      sx={{
        display: { md: "flex", sm: "flex", xs: "block" },
        width: "100%",
        height: { lg: 500, md: 450, sm: 300, xs: "auto" },
        bgcolor: "#f4e8fe",
        // color: COLORS.white,
        borderRadius: 4,
      }}
    >
      <Box
        sx={{
          width: { md: "50%", sm: "50%", xs: "100%" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "start",
          m: "auto",
          textAlign: { md: "start", sm: "start", xs: "center" },
          height: "100%",
          px: { md: 4, sm: 4, xs: 2 },
        }}
      >
        <Typography
          sx={{
            fontSize: { md: "35px", sm: "25px", xs: "25px" },
            fontWeight: 800,
            textAlign: { md: "start", sm: "start", xs: "center" },
          }}
        >
          The DIY Personalisation App
        </Typography>
        <Typography
          sx={{
            fontSize: { md: "16px", sm: "14px", xs: "12px" },
            width: { lg: "80%", md: "100%", sm: "100%", xs: "100%" },
            fontWeight: 300,
          }}
        >
          Now, it's easier than ever to give a DIY with the DIY Personalisation
          app! Send personalised cards, gifts and more for every occasion.
        </Typography>

        <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "block" },
            gap: "15px",
            mt: 3,
            mx: {md:0,sm:0,xs:'auto'},
          }}
        >
          <Box
            component={"button"}
            sx={{
              ...deployBtn,
              px: { lg: 8, md: 4, sm: 3, xs: 10 },
            }}
          >
              <Box
              component={"img"}
              src="/assets/icons/Apple.svg"
              sx={{ width: {md:35,sm:30,xs:30} }}
            />
            <Box>
              <Typography fontSize={{md:"12px",sm:"10px",xs:"12px"}}>Download on the</Typography>
              <Typography fontSize={{md:"18px",sm:"10px",xs:"12px"}}>App Store</Typography>
            </Box>
          </Box>

          <Box
            component={"button"}
            sx={{
              ...deployBtn,
              px: { lg: 8, md: 4, sm: 1, xs: 10 },
            }}
          >
            <Box
              component={"img"}
              src="/assets/icons/Playstore.svg"
              sx={{ width: {md:35,sm:30,xs:30} }}
            />
            <Box>
              <Typography fontSize={{ md: "12px", sm: "8px", xs: "10px" }}>
                ANDRIOD APP ON
              </Typography>
              <Typography fontSize={{ md: "18px", sm: "8px", xs: "16px" }}>
                Google Play
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: { md: "50%", sm: "50%", xs: "100%" } }}>
        <Box
          component={"img"}
          src="/assets/images/AppBanner.png"
          alt="mobile app"
          width={"100%"}
          height={"100%"}
          borderRadius={5}
        />
      </Box>
    </Box>
  );
};

export default FunkyApp;

const deployBtn = {
  height: {md:"55px",sm:40,xs:"55px"},
  borderRadius: 4,
  bgcolor: COLORS.black,
  color: COLORS.white,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  m: "auto",
  gap: 2,
  mb: { md: 0, sm: 0, xs: 2 },
};
