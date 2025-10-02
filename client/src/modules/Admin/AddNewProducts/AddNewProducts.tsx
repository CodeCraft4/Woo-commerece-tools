import DashboardLayout from "../../../layout/DashboardLayout";
import {Typography } from "@mui/material";
import NewCardForm from "./component/NewCardsForm";

const AddNewProducts = () => {
  return (
    <DashboardLayout>
      <Typography sx={{ fontSize: "25px" }}>Add New Product</Typography>
      <NewCardForm/>
    </DashboardLayout>
  );
};

export default AddNewProducts;
