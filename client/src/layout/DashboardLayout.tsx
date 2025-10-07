import React from "react";
import { Box, Typography } from "@mui/material";
import Sidebar from "./components/Sidebar/Sidebar";
import { COLORS } from "../constant/color";

type LayoutType = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: LayoutType) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9f9f9" }}>
      {/* Sidebar Container */}
      <Box
        component="aside"
        sx={{
          width: 257,
          pl: 3,
          display: "flex",
          flexDirection: "column",
          bgcolor: COLORS.primary,
          color: COLORS.white,
          height: "100vh",
          overflowY: "hidden",
        }}
      >
        <Box
          sx={{
            pt: "60px",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              fontSize: "40px",
            }}
          >
            Editor
          </Typography>

          {/* Scrollable Sidebar Content */}
          <Box
            sx={{
              mt: 5,
              textAlign: "start",
              height: "calc(100vh - 120px)",
              overflowY: "auto",
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
          p: "30px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {/* Page Content */}
        <Box sx={{ flex: 1, p: 1, }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
