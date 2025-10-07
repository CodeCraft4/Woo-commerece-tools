import { Box, Typography } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import TotalProductChart from "./components/TotalProductChart/TotalProductChart";
import OrderChart from "./components/OrderChart/OrderChart";

const DashboardHome = () => {
  return (
    <DashboardLayout>
      <Typography sx={{ fontSize: "25px" }}>Analytics Overview</Typography>
      <br />
      <Box sx={{ display: "flex", gap: 3, mt: 3, width: "100%" }}>
        <TotalProductChart />
        <OrderChart />
        <OrderChart />
        {/* <TotalSalesChart /> */}
      </Box>
    </DashboardLayout>
  );
};

export default DashboardHome;
