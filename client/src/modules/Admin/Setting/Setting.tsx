import { Typography } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import SettingForm from "./components/SettingsForm/SettingForm";

const Setting = () => {
  return (
    <DashboardLayout>
      <Typography sx={{ fontSize: "30px" }}>Admin Setting</Typography>
      <SettingForm />
    </DashboardLayout>
  );
};

export default Setting;
