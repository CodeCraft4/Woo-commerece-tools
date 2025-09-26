import { Box, Button } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";

const DashboardHome = () => {

  return (
    <DashboardLayout>
      <Box
        sx={{
          p: 2,
          height: "90vh",
        }}
      >
        <Button variant="contained" color="success" sx={{p:2,width:'200px'}}>Add Cards</Button>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardHome;
