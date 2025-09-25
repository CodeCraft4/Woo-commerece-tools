import { Route, Routes as ReactRoutes } from "react-router-dom";
import Home from "../../modules/User/Home/Home";
import Preview from "../../modules/User/Preview/Preview";
import { ADMINS_DASHBOARD, USER_ROUTES } from "../../constant/route";
import DashboardHome from "../../modules/Admin/Home/Home";
import Subscription from "../../modules/User/Subscription/Subscription";
import SuccessPayment from "../../modules/User/SuccessPayment/SuccessPayment";
import LandingHome from "../../modules/User/LandingHome/LandingHome";
import ViewAll from "../../modules/User/ViewAll/ViewAll";

const Router = () => {
  return (
    <ReactRoutes>
      {/* Just For User preview */}
      <Route path={"/"} element={<LandingHome />} />
      <Route path={`${USER_ROUTES.HOME}/:id`} element={<Home />} />
      <Route path={USER_ROUTES.PREVIEW} element={<Preview />} />
      <Route path={USER_ROUTES.VIEW_ALL} element={<ViewAll />} />
      <Route path={USER_ROUTES.SUBSCRIPTION} element={<Subscription />} />
      <Route path={USER_ROUTES.SUCCESS_PAY} element={<SuccessPayment />} />
      {/* Just Admin dashboard Preview  */}
      <Route path={ADMINS_DASHBOARD.HOME} element={<DashboardHome />} />
    </ReactRoutes>
  );
};

export default Router;
