// src/pages/admin/AdminEditor/AdminEditor.tsx
import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import WishCard from "../../../components/WishCard/WishCard";
import { useLocation, useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../constant/route";
import {
  applyPolygonLayoutToContexts,
  buildPolygonLayout,
} from "../../../lib/polygon";
import { useSlide1 } from "../../../context/Slide1Context";
import { useSlide2 } from "../../../context/Slide2Context";
import { useSlide3 } from "../../../context/Slide3Context";
import { useSlide4 } from "../../../context/Slide4Context";

type AdminEditorNavState = {
  id?: string;
  product?: any;
  formData?: any;
  mode?: "edit" | "create" | string;
  polygonlayout?: any;
  polyganLayout?: any; // legacy key support
};

const AdminEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const slide1 = useSlide1();
  const slide2 = useSlide2();
  const slide3 = useSlide3();
  const slide4 = useSlide4();

  const navState = (location.state as AdminEditorNavState) || {};

  const { id, product, formData, mode } = navState;

  const incomingLayout = useMemo(
    () => navState.polygonlayout ?? navState.polyganLayout ?? null,
    [navState.polygonlayout, navState.polyganLayout]
  );

  useEffect(() => {
    if (!incomingLayout) return;

    requestAnimationFrame(() => {
      slide1.resetSlide1State?.();
      slide2.resetSlide2State?.();
      slide3.resetSlide3State?.();
      slide4.resetSlide4State?.();

      applyPolygonLayoutToContexts(incomingLayout, slide1, slide2, slide3, slide4);
    });
  }, [incomingLayout]);

  const handleSaveDesign = () => {
  const layoutNow = buildPolygonLayout(slide1, slide2, slide3, slide4);

  navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS, {
    state: {
      id,
      // ✅ product me bhi update kar do
      product: { ...(product ?? {}), polygonlayout: layoutNow, polyganLayout: layoutNow },

      // ✅ formData me bhi update kar do (optional but useful)
      formData: { ...(formData ?? {}), polygonlayout: layoutNow, polyganLayout: layoutNow },

      mode: mode ?? "edit",
      polygonlayout: layoutNow,
      polyganLayout: layoutNow,
    },
    replace: false,
  });
};



  return (
    <DashboardLayout title="Admin Editor" addBtn={mode ? "Update Design " : "Save Design" } onClick={handleSaveDesign}>
      <Box sx={{ height: "100%", minHeight: 0 }}>
        <WishCard adminEditor={true} />
      </Box>
    </DashboardLayout>
  );
};

export default AdminEditor;
