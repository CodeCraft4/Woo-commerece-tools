import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { ADMINS_DASHBOARD } from "../constant/route";

const SecureRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdmin();

  if (loading) return <div>Loading admin session...</div>;
  if (!isAdmin) return <Navigate to={ADMINS_DASHBOARD.SIGNIN} replace />;

  return <>{children}</>;
};

export default SecureRoute;
