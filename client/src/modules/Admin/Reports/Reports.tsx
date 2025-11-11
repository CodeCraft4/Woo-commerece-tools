import DashboardLayout from "../../../layout/DashboardLayout";
import PurposeChart from "./components/PurposeChart/PurposeChart";
import UsersChart from "./components/UsersChart/UsersChart";

const Reports = () => {
  return <DashboardLayout title="Analytics & Reports">
    <UsersChart />
    <PurposeChart />
  </DashboardLayout>;
};

export default Reports;
