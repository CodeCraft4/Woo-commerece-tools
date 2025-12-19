import { Box } from "@mui/material";
import WishCard from "../../../components/WishCard/WishCard";
import DashboardLayout from "../../../layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../constant/route";

const AdminEditor = () => {

  const navigate = useNavigate()
  return (
    <DashboardLayout title="Admin Editor" addBtn="Save Design" onClick={() => navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS)}>
      {/* <EditorSlides /> */}
      <Box sx={{ height: "100%", minHeight: 0 }}>
        <WishCard adminEditor={true} />
      </Box>
    </DashboardLayout>
  );
};

export default AdminEditor;
