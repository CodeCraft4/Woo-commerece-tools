import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";
import LandingButton from "../LandingButton/LandingButton";

const PersonalGift = () => {
  return (
    <Box
      sx={{
        borderRadius: 4,
        width: "100%",
        height: { md: "450px", sm: "", xs: "auto" },
        display: { md: "flex", sm: "flex", xs: "block" },
      }}
    >
      <Box
        sx={{
          width: { md: "60%", sm: "", xs: "100%" },
          borderRadius: "20px 0px 0px 20px",
        }}
      >
        <Box
          component={"img"}
          src="/assets/images/personlised.jpg"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "20px 0px 0px 20px",
          }}
        />
      </Box>
      <Box
        sx={{
          width: { md: "40%", sm: "", xs: "100%" },
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "start",
          color: COLORS.white,
          bgcolor: COLORS.primary,
          borderRadius: "0px 20px 20px 0px",
          textAlign:'start',
          p: 5,
        }}
      >
        <Typography sx={{fontSize:'35px',fontWeight:700}}>
          Personlized Gifts <br /> Created by You
        </Typography>
        <Typography sx={{fontSize:'14px',fontWeight:300}}>
          Go above and beyond to show how well you know them with personalised gifts, created by you just for them to make their day!
        </Typography>
        <br />
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            width: "500px",
            mt:2
          }}
        >
          <LandingButton title="For Her" width="225px" personal bgblack/>
          <LandingButton title="For Him" width="225px" personal bgblack/>
          <LandingButton title="Birthday" width="225px" personal bgblack/>
          <LandingButton title="Shop All Gift" width="225px" personal bgblack/>
        </Box>
      </Box>
    </Box>
  );
};

export default PersonalGift;
