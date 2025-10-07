import DashboardLayout from "../../../layout/DashboardLayout";
import { Typography } from "@mui/material";
import NewCardForm from "./component/NewCardsForm";
import { useLocation } from "react-router-dom";

const AddNewProducts = () => {
  const location = useLocation();
  const { id, product } =
    (location.state as { id?: number; product?: any }) || {};

  return (
    <DashboardLayout>
      <Typography sx={{ fontSize: "25px" }}>
        {id ? "Edit Product" : "Add New Product"}
      </Typography>
      <NewCardForm editProduct={product} />
    </DashboardLayout>
  );
};

export default AddNewProducts;
