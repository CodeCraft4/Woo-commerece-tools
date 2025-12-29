// File: AdminEditor.tsx
import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import WishCard from "../../../components/WishCard/WishCard";
import { useLocation, useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../constant/route";
import { useSlide1 } from "../../../context/Slide1Context";
import { useSlide2 } from "../../../context/Slide2Context";
import { useSlide3 } from "../../../context/Slide3Context";
import { useSlide4 } from "../../../context/Slide4Context";
import { applyPolygonLayoutToContexts, pickPolygonLayout, isMeaningfulPolygonLayout } from "../../../lib/polygon";

type AdminEditorNavState = {
  id?: string;
  design?: any;
  mode?: "edit" | "create" | string;
  polygonlayout?: any;
  polyganLayout?: any;
};

const safeParse = (v: any) => {
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const getDesignLayout = (design: any) => {
  if (!design) return null;

  return safeParse(design);
};

const AdminEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const slide1 = useSlide1();
  const slide2 = useSlide2();
  const slide3 = useSlide3();
  const slide4 = useSlide4();

  const navState = (location.state as AdminEditorNavState) || {};
  const { id, design, mode } = navState;

  const isEditMode = mode === "edit" || Boolean(id);

  const incomingLayout = useMemo(() => {
    const fromRoot = pickPolygonLayout(navState.design);
    const fromDesign = getDesignLayout(design);
    return fromRoot ?? fromDesign;
  }, [navState.design, design]);

  useEffect(() => {
    if (!isMeaningfulPolygonLayout(incomingLayout)) return;

    requestAnimationFrame(() => {
      slide1.resetSlide1State?.();
      slide2.resetSlide2State?.();
      slide3.resetSlide3State?.();
      slide4.resetSlide4State?.();

      applyPolygonLayoutToContexts(incomingLayout, slide1, slide2, slide3, slide4);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingLayout]);

  const handleSaveDesign = () => {
    navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS);
  };

  return (
    <DashboardLayout
      title="Admin Editor"
      addBtn={isEditMode ? "Update Design" : "Save Design"}
      onClick={handleSaveDesign}
    >
      <Box sx={{ height: "100%", minHeight: 0 }}>
        <WishCard adminEditor={true} />
      </Box>
    </DashboardLayout>
  );
};

export default AdminEditor;
