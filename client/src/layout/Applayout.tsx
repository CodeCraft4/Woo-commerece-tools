import { Box } from "@mui/material";
import Navbar from "./components/Navbar/Navbar";
import { useLocation } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../constant/route";
import DashboardHeader from "./components/DashboardHeader/DashboardHeader";

type Props = {
  children: React.ReactNode;
};

const Applayout = ({ children }: Props) => {

  const location = useLocation();
  
  return (
    <Box>
      <Navbar />
      {location.pathname === ADMINS_DASHBOARD.HOME && <DashboardHeader />}
      {children}
      {/* <Footer/> */}
    </Box>
  );
};

export default Applayout;
