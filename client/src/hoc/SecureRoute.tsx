import { useEffect } from "react";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../constant/route";

const SecureRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate(ADMINS_DASHBOARD.SIGNIN);
    }
  }, [isAdmin, navigate]);

  return <>{isAdmin && children}</>;
};

export default SecureRoute;
