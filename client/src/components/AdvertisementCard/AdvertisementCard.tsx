import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";
import LandingButton from "../LandingButton/LandingButton";

type AdvertiseTypes = {
  title: string;
};
const AdvertisementCard = (props: AdvertiseTypes) => {
  const { title } = props;

  return (
    <Box
      sx={{
        borderRadius: 4,
        width: { md: "560px", sm: "", xs: "100%" },
        height: { md: "190px", sm: "", xs: "auto" },
        display: { md: "flex", sm: "flex", xs: "block" },
      }}
    >
      <Box
        sx={{
          width: { md: "40%", sm: "", xs: "100%" },
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          color: COLORS.white,
          bgcolor: COLORS.primary,
          borderRadius: {
            md: "20px 0px 0px 20px",
            sm: "20px 0px 0px 20px",
            xs: 0,
          },
          p: 3,
        }}
      >
        <Typography sx={{ fontSize: { md: "20px", sm: "", xs: "20px" } }}>
          {title}
        </Typography>
        <br />
        <LandingButton title="Shop Now" />
      </Box>
      <Box
        sx={{
          width: { md: "60%", sm: "", xs: "100%" },
          borderRadius: "0px 20px 20px 0px",
        }}
      >
        <Box
          component={"img"}
          src="https://plus.unsplash.com/premium_photo-1701984401514-a32a73eac549?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGtpZHN8ZW58MHx8MHx8fDA%3D"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: { md: "0px 20px 20px 0px", sm: "", xs: 0 },
          }}
        />
      </Box>
    </Box>
  );
};

export default AdvertisementCard;
