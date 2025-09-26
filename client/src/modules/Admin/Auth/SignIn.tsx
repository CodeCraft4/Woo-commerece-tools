import { Box, IconButton, Typography } from "@mui/material";
import CustomInput from "../../../components/CustomInput/CustomInput";
import LandingButton from "../../../components/LandingButton/LandingButton";

const SignIn = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <Box
        component={"img"}
        src="/assets/images/animated-banner.jpg"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          filter: "brightness(60%)",
        }}
      />

      {/* Centered form */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: 450,
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "35px", fontWeight: 700 }}>
            Sign In
          </Typography>
          {/* Your inputs & buttons go here */}
          <Box mt={5} component={"form"}>
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              type="email"
            />
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              type="password"
            />
            <LandingButton title="Sign in " width="400px" />

            <Typography sx={{ fontSize: "13px", textAlign: "start", mt: 3 }}>
              I have no account{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color: "rgba(44, 5, 44, 1)",
                  textDecoration: "underline",
                }}
              >
                Sign Up
              </span>
              .
            </Typography>

            <IconButton>
                <Box
                component={'img'}
                 src="/assets/images/google.png"
                 sx={{width:'40px',height:'40px'}}
                />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn;
