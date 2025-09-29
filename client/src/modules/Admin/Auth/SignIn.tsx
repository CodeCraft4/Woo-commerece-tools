import { Box } from "@mui/material";
import AdminSigninForm from "./AdminSigninForm/AdminSigninForm";

const AdminSignIn = () => {
  return (
    <Box sx={{ height: "100vh", width: "100%", display: "flex" }}>
      <Box>
        <Box
          component={"img"}
          src="/assets/images/Wedding.jpg"
          sx={{ width: "100%", height: "100vh", objectFit: "cover" }}
        />
      </Box>
      <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',width:'50%'}}>
        <AdminSigninForm />
      </Box>
    </Box>
  );
};

export default AdminSignIn;
