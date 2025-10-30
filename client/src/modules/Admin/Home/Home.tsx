import { Box, Typography } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import TotalProductChart from "./components/TotalProductChart/TotalProductChart";
import OrderChart from "./components/OrderChart/OrderChart";
import SimpleAreaChart from "./components/FullAnalytics/FullAnalytics";
import AddCelebChart from "./components/AddCelebChart/AddCelebChart";

const DashboardHome = () => {
  return (
    <DashboardLayout>
      <Typography sx={{ fontSize: "25px" }}>Analytics Overview</Typography>
      <br />
      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: "block" },
          gap: 3,
          mt: 3,
          width: "100%",
        }}
      >
        <TotalProductChart />
        <OrderChart />

        {/* <TotalSalesChart /> */}
      </Box>

      <Box sx={{display:'flex',gap:2,mt:4}}>
        <SimpleAreaChart />
        <AddCelebChart />
      </Box>
    </DashboardLayout>
  );
};

export default DashboardHome;
