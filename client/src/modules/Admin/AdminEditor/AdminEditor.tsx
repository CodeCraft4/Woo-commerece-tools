import { Typography } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import EditorSlides from "./component/EditorSlides";

const AdminEditor = () => {

  return (
    <DashboardLayout>
      <Typography sx={{ fontSize: "35px" }}>Admin Editor</Typography>
      <br />
      <EditorSlides />
    </DashboardLayout>
  );
};

export default AdminEditor;
