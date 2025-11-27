import { Box } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import TotalProductChart from "./components/TotalProductChart/TotalProductChart";
import OrderChart from "./components/OrderChart/OrderChart";
// import SimpleAreaChart from "./components/FullAnalytics/FullAnalytics";
import VisitorMiniChart from "./components/VisitorBarChart/VisitorBarChart";
// import AddCelebChart from "./components/AddCelebChart/AddCelebChart";

const DashboardHome = () => {
  return (
    <DashboardLayout title="Analytice Overview">
      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: "block" },
          // flexWrap: "wrap",
          gap: 3,
          mt: 3,
          width: "100%",
        }}
      >
        <TotalProductChart />
        <OrderChart />
        <VisitorMiniChart />
        {/* <SimpleAreaChart /> */}
        {/* <AddCelebChart /> */}
      </Box>

    </DashboardLayout>
  );
};

export default DashboardHome;
