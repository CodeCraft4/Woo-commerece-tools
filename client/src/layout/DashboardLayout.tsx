import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "./components/Sidebar/Sidebar";
import { COLORS } from "../constant/color";

type LayoutType = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: LayoutType) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9f9f9" }}>
      {/* Sidebar Container */}
      <Box
        component="aside"
        sx={{
          width: { md: 257, sm: 257, xs: sidebarOpen ? 240 : 0 },
          transition: "width 0.3s ease",
          bgcolor: COLORS.primary,
          color: COLORS.white,
          height: "100vh",
          overflowY: "auto",
          position: { xs: "fixed", sm: "relative" },
          zIndex: 1200,
          top: 0,
          left: 0,
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            pt: "20px",
            textAlign: "center",
            display: sidebarOpen || { md: "block" } ? "block" : "none",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              fontSize: { md: "40px", sm: "40px", xs: "20px" },
            }}
          >
            Editor
          </Typography>

          <Box
            sx={{
              mt: 3,
              textAlign: "start",
              height: "calc(100vh - 100px)",
              overflowY: "auto",
              px: 2,
            }}
          >
            <Sidebar />
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: { md: "30px", sm: "30px", xs: "10px" },
          overflowY: "auto",
          height: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        {/* Mobile Toggle Button */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            justifyContent: "flex-start",
            alignItems: "center",
            p: 1,
            bgcolor: COLORS.black,
            color: COLORS.white,
          }}
        >
          <IconButton onClick={toggleSidebar} sx={{ color: COLORS.white }}>
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography sx={{ ml: 1, fontWeight: 700 }}>Menu</Typography>
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: 1 }}>{children}</Box>
      </Box>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <Box
          onClick={toggleSidebar}
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
          }}
        />
      )}
    </Box>
  );
};

export default DashboardLayout;
