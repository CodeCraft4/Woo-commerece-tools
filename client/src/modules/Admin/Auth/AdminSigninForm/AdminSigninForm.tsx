import { Box, Typography } from "@mui/material";
import CustomInput from "../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../components/LandingButton/LandingButton";

const AdminSigninForm = () => {
  return (
    <div>
      <Box
        sx={{
          width: 500,
          p: 3,
          borderRadius: 3,
          textAlign: "start",
        }}
      >
        <Typography sx={{ fontSize: "45px", fontWeight: 700 }}>
          Sign In
        </Typography>
        <Typography sx={{ fontSize: "15px", fontWeight: 400 }}>
          This is only working for admin email & password
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
          <Box sx={{display:'flex',gap:1,fontSize:'12px',color:'gray'}}>
            <Box
             component={'input'}
             type="checkbox"
            />
            Remember me
          </Box>
          <br />
          <LandingButton title="Sign in " width="450px" personal />
        </Box>
      </Box>
    </div>
  );
};

export default AdminSigninForm;
