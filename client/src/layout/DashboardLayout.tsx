import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "./components/Sidebar/Sidebar";
import { COLORS } from "../constant/color";
import DNavbar from "./components/DNavbar/DNavbar";

type LayoutType = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: LayoutType) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Box sx={{height: "100vh", bgcolor: "#f9f9f9",overflow:'hidden' }}>
      <DNavbar />
      <Box display={"flex"} width={"100%"}>
        {/* Sidebar Container */}
        <Box
          component="aside"
          sx={{
            width: { md: 260, sm: 260, xs: sidebarOpen ? 240 : 0 },
            transition: "width 0.3s ease",
            bgcolor: COLORS.black,
            color: COLORS.white,
            height: "100vh",
            overflowY: "auto",
            position: { xs: "fixed", sm: "relative" },
            top: 0,
            left: 0,
            zIndex:{md:0,sm:0,xs:9999}
          }}
        >
          {/* Sidebar Header */}
          <Box
            sx={{
              textAlign: "center",
              display: sidebarOpen || { md: "block" } ? "block" : "none",
            }}
          >
            <Box
              sx={{
                mt: 3,
                textAlign: "start",
                height: "calc(100vh - 100px)",
                overflowY: "auto",
                p: 2,
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
            p: { md: "20px", sm: "20px", xs: "10px" },
            overflowY: "auto",
            height: "100vh",
            width: "100%",
            overflowX: "hidden",
            msOverflowY:'scroll'
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
          <Box sx={{ flex: 1, p: 1,mb:10 }}>{children}</Box>
        </Box>
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
