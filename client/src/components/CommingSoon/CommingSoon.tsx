import { Box, Typography } from "@mui/material";
import LandingButton from "../LandingButton/LandingButton";
import { COLORS } from "../../constant/color";

const CommingSoonOffers = () => {
  return (
    <Box
      sx={{
        borderRadius: 4,
        width: "95%",
        height: { md: "450px", sm: "", xs: "auto" },
        display: { md: "flex", sm: "", xs: "block" },
        // mt: 8,
        bgcolor: COLORS.primary,
        justifyContent: "center",
        color: COLORS.white,
        m: "auto",
      }}
    >
      <Box
        sx={{
          width: { md: "40%", sm: "", xs: "100%" },
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "20px 0px 0px 20px",
          textAlign: "center",
          p: { md: 3, sm: 2, xs: 1 },
        }}
      >
        <Typography
          sx={{
            fontSize: {
              md: "35px",
              sm: "",
              xs: "23px",
              textAlign: { md: "start", sm: "start", xs: "center" },
              fontWeight: 800,
            },
          }}
        >
          Show You Give a <br /> Funk This Christmas!
        </Typography>
        <Typography
          sx={{ py: 2, fontSize: { md: "auto", sm: "auto", xs: "14px" } }}
        >
          The festive countdown is on! From Christmas classics to new
          personalised stockings and more coming soon, get Christmas sorted now
          and avoid the stress.
        </Typography>
        <br />
        <LandingButton
          title="Shop Christmas Card & Gift"
          width="300px"
          personal
          />
          </Box>

      <Box sx={{ width: { md: "60%", sm: "60%", xs: "100%" } }}>
        <Box
          component={"img"}
          src="https://plus.unsplash.com/premium_photo-1701984401514-a32a73eac549?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGtpZHN8ZW58MHx8MHx8fDA%3D"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius:{md: "0px 15px 15px 0px",sm: "0px 15px 15px 0px",xs:'15px'},
          }}
        />
      </Box>
    </Box>
  );
};

export default CommingSoonOffers;
