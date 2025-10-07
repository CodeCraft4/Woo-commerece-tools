import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";
import LandingButton from "../LandingButton/LandingButton";

type AdvertiseTypes = {
  title: string;
  price?: string;
  poster?:string;
};
const AdvertisementCard = (props: AdvertiseTypes) => {
  const { title, price,poster } = props;

  return (
    <Box
      sx={{
        borderRadius: 4,
        width: { md: "560px", sm: "", xs: "100%" },
        height: { md: "170px", sm: "", xs: "auto" },
        display: { md: "flex", sm: "flex", xs: "block" },
      }}
    >
      <Box
        sx={{
          width: { md: "45%", sm: "", xs: "100%" },
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "start",
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
        <Typography sx={{ fontSize: { md: "19px", sm: "", xs: "20px" } }}>
          {title}
        </Typography>
        {price && <Typography sx={{fontSize:'14px',fontWeight:200}}>{price}</Typography>}
        <br />
        <LandingButton title="Shop Now" width="120px" bgblack />
      </Box>
      <Box
        sx={{
          width: { md: "55%", sm: "", xs: "100%" },
          borderRadius: "0px 20px 20px 0px",
        }}
      >
        <Box
          component={"img"}
          src={poster}
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
