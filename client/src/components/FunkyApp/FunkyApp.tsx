import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";
import { Apple } from "@mui/icons-material";

const FunkyApp = () => {
  return (
    <Box
      sx={{
        display: { md: "flex", sm: "flex", xs: "block" },
        width: "100%",
        height: { lg: 550, md: 450, sm: 650, xs: "auto" },
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
            fontSize: { md: "35px", sm: "", xs: "25px" },
            fontWeight: 800,
            textAlign: { md: "start", sm: "start", xs: "center" },
          }}
        >
          The DIY Personalization App
        </Typography>
        <Typography
          sx={{
            fontSize: { md: "16px", sm: "", xs: "12px" },
            width: { lg: "80%", md: "100%", sm: "", xs: "100%" },
            fontWeight: 300,
          }}
        >
          Now, it's easier than ever to give a DIY with the DIY Personalization
          app! Send personalised cards, gifts and more for every occasion.
        </Typography>

        <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "block" },
            gap: "15px",
            mt: 3,
            mx: "auto",
          }}
        >
          <Box
            component={"button"}
            sx={{
              ...deployBtn,
              px: { lg: 8, md: 4, sm: 3, xs: 10 },
            }}
          >
            <Apple fontSize="large" />
            <Box>
              <Typography fontSize={"12px"}>Download on the</Typography>
              <Typography variant="h6">App Store</Typography>
            </Box>
          </Box>

          <Box
            component={"button"}
            sx={{
              ...deployBtn,
              px: { lg: 8, md: 4, sm: 3, xs: 10 },
            }}
          >
            <Box
              component={"img"}
              src="/assets/icons/playstore.png"
              sx={{ width: 35 }}
            />
            <Box>
              <Typography fontSize={{ md: "12px", sm: "12px", xs: "10px" }}>
                ANDRIOD APP ON
              </Typography>
              <Typography fontSize={{ md: "18px", sm: "18px", xs: "16px" }}>
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
  height: "55px",
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
