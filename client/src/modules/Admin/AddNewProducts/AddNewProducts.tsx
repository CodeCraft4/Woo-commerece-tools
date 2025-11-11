import DashboardLayout from "../../../layout/DashboardLayout";
import NewCardForm from "./component/NewCardsForm";
import { useLocation } from "react-router-dom";

const AddNewProducts = () => {
  const location = useLocation();
  const { id, product } =
    (location.state as { id?: number; product?: any }) || {};

  return (
    <DashboardLayout title={id ? "Edit Product" : "Add New Product"}>
      <NewCardForm editProduct={product} />
    </DashboardLayout>
  );
};

export default AddNewProducts;
