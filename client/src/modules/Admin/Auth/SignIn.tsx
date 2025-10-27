import { Box } from "@mui/material";
import AdminSigninForm from "./AdminSigninForm/AdminSigninForm";

const AdminSignIn = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: { md: "flex", sm: "flex", xs: "100%" },
      }}
    >
      <Box>
        <Box
          component={"img"}
          src="/assets/images/animated-banner.jpg"
          sx={{
            width: "100%",
            height: { md: "100vh", sm: "100vh", xs: "auto" },
            objectFit: "cover",
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: { md: "100vh", sm: "100vh", xs: "auto" },
          width: { md: "50%", sm: "50%", xs: "100%" },
        }}
      >
        <AdminSigninForm />
      </Box>
    </Box>
  );
};

export default AdminSignIn;
