import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";
import { Apple } from "@mui/icons-material";

const FunkyApp = () => {
  return (
    <Box
      sx={{
        display: {md:"flex",sm:'flex',xs:'block'},
        width: "100%",
        height: {md:650,sm:650,xs:'auto'},
        bgcolor: "#f4e8fe",
        // color: COLORS.white,
        borderRadius: 4,
      }}
    >
      <Box
        sx={{
          width: {md:"50%",sm:'50%',xs:'100%'},
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          m: "auto",
          textAlign: "start",
          height: "100%",
        }}
      >
        <Typography sx={{fontSize:{md:'40px',sm:'',xs:'25px'},fontWeight:800}}>
          The Funky Pigeon App
        </Typography>
        <Typography sx={{fontSize:{md:'18px',sm:'',xs:'auto'},width:{md:'80%',sm:'',xs:'100%'}}}>
          Now, it's easier than ever to give a funk with the Funky Pigeon app!
          Send personalised cards, gifts and more for every occasion.
        </Typography>

        <Box sx={{display:{md:'flex',sm:'flex',xs:'block'},gap:'15px',mt:5}}>
          <Box
            sx={{
              height: "70px",
              borderRadius: 4,
              bgcolor: COLORS.primary,
              color: COLORS.white,
              px: 5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: "auto",
              gap:2,
              mb:{md:0,sm:0,xs:2}
            }}
          >
            <Apple fontSize="large" />
            <Box>
              <Typography fontSize={'12px'}>Download on the</Typography>
              <Typography variant="h5">App Store</Typography>
            </Box>
          </Box>
       <Box
            sx={{
              height: "70px",
              borderRadius: 4,
              bgcolor: COLORS.primary,
              color: COLORS.white,
              px: 5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: "auto",
              gap:2
            }}
          >
            <Apple fontSize="large"/>
            <Box>
              <Typography fontSize={'12px'}>ANDRIOD APP ON</Typography>
              <Typography variant="h5">Google Play</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: {md:"50%",sm:'50%',xs:'100%'} }}>
        <Box
         component={'img'}
         src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Fhomepage%2Fapp-image.jpg&w=1200&q=62"
         alt="mobile app"
         width={'100%'}
         height={'100%'}
        borderRadius={5}
        />
      </Box>
    </Box>
  );
};

export default FunkyApp;
