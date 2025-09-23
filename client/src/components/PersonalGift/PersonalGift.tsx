import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";
import LandingButton from "../LandingButton/LandingButton";

const PersonalGift = () => {
  return (
    <Box
      sx={{ borderRadius: 4, width: "100%", height:{md:"450px",sm:'',xs:'auto'}, display: {md:"flex",sm:'flex',xs:'block'},mt:8 }}
    >
      <Box sx={{ width: {md:"50%",sm:'',xs:'100%'}, borderRadius: "20px 0px 0px 20px" }}>
        <Box
          component={"img"}
          src="https://plus.unsplash.com/premium_photo-1701984401514-a32a73eac549?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGtpZHN8ZW58MHx8MHx8fDA%3D"
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
          width: {md:"50%",sm:'',xs:'100%'},
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          color: COLORS.white,
          bgcolor: COLORS.primary,
          borderRadius: "0px 20px 20px 0px",
          textAlign: "center",
          p: 3,
        }}
      >
        <Typography variant="h2" fontWeight={800}>
          Personlized Gifts Created by You
        </Typography>
        <Typography>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. At incidunt
          officiis, quis a, atque dolores, et cupiditate ipsa pariatur hic
          numquam laudantium doloribus! Exercitationem vero optio iure
          consequuntur voluptatum alias!
        </Typography>
        <br />
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            width: "550px",
          }}
        >
          <LandingButton title="For Her" width="250px" personal />
          <LandingButton title="For Him" width="250px" personal />
          <LandingButton title="Birthday" width="250px" personal />
          <LandingButton title="Shop All Gift" width="250px" personal />
        </Box>
      </Box>
    </Box>
  );
};

export default PersonalGift;
