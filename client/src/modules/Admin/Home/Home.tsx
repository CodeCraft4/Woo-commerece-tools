import { Box, Button } from "@mui/material";
import Applayout from "../../../layout/Applayout";

const DashboardHome = () => {

  return (
    <Applayout>
      <Box
        sx={{
          p: 2,
          height: "90vh",
        }}
      >
        <Button variant="contained" color="success" sx={{p:2,width:'200px'}}>Add Cards</Button>
      </Box>
    </Applayout>
  );
};

export default DashboardHome;
