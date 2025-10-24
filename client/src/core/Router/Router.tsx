import { Route, Routes as ReactRoutes } from "react-router-dom";
import Home from "../../modules/User/Home/Home";
import Preview from "../../modules/User/Preview/Preview";
import { ADMINS_DASHBOARD, USER_ROUTES } from "../../constant/route";
import DashboardHome from "../../modules/Admin/Home/Home";
import Subscription from "../../modules/User/Subscription/Subscription";
import SuccessPayment from "../../modules/User/SuccessPayment/SuccessPayment";
import LandingHome from "../../modules/User/LandingHome/LandingHome";
import ViewAll from "../../modules/User/ViewAll/ViewAll";
import SignIn from "../../modules/User/Auth/SignIn";
import Products from "../../modules/Admin/Products/Products";
import AddNewProducts from "../../modules/Admin/AddNewProducts/AddNewProducts";
import Setting from "../../modules/Admin/Setting/Setting";
import SignUp from "../../modules/User/Auth/SignUp";
import AdminSignIn from "../../modules/Admin/Auth/SignIn";
import AddToCart from "../../modules/User/AddToCart/AddToCart";
import AdminRoute from "../../hoc/SecureRoute";
import AdminEditor from "../../modules/Admin/AdminEditor/AdminEditor";

const Router = () => {
  return (
    <ReactRoutes>
      {/* Just For User preview */}
      <Route path={"/"} element={<LandingHome />} />
      <Route path={`${USER_ROUTES.HOME}/:id`} element={<Home />} />
      <Route path={USER_ROUTES.PREVIEW} element={<Preview />} />
      <Route path={USER_ROUTES.VIEW_ALL} element={<ViewAll />} />
      <Route path={USER_ROUTES.ADD_TO_CART} element={<AddToCart />} />
      <Route path={USER_ROUTES.SUBSCRIPTION} element={<Subscription />} />
      <Route path={USER_ROUTES.SUCCESS_PAY} element={<SuccessPayment />} />
      <Route path={USER_ROUTES.SIGNIN} element={<SignIn />} />
      <Route path={USER_ROUTES.SIGNUP} element={<SignUp />} />

      {/* Just Admin dashboard Preview  */}
      <Route path={ADMINS_DASHBOARD.SIGNIN} element={<AdminSignIn />} />
      <Route
        path={ADMINS_DASHBOARD.HOME}
        element={
          <AdminRoute>
            <DashboardHome />
          </AdminRoute>
        }
      />
      <Route
        path={ADMINS_DASHBOARD.PRODUCTS_LIST}
        element={
          <AdminRoute>
            <Products />
          </AdminRoute>
        }
      />
      <Route
        path={ADMINS_DASHBOARD.ADD_NEW_CARDS}
        element={
          <AdminRoute>
            <AddNewProducts />
          </AdminRoute>
        }
      />
      <Route
        path={ADMINS_DASHBOARD.ADMIN_EDITOR}
        element={
          <AdminRoute>
            <AdminEditor />
          </AdminRoute>
        }
      />
      <Route
        path={ADMINS_DASHBOARD.SETTINGS}
        element={
          <AdminRoute>
            <Setting />
          </AdminRoute>
        }
      />
    </ReactRoutes>
  );
};

export default Router;
