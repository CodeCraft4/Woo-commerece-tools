import { Box } from "@mui/material";
import Navbar from "./components/Navbar/Navbar";

type Props = {
  children: React.ReactNode;
};

const Applayout = ({ children }: Props) => {
  
  return (
    <Box>
      <Navbar />
      {/* {location.pathname === ADMINS_DASHBOARD.HOME && <DashboardHeader />} */}
      {children}
      {/* <Footer/> */}
    </Box>
  );
};

export default Applayout;
