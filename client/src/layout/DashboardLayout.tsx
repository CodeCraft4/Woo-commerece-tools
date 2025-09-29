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
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          width: 257,
          p: 3,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #E6E8F0",
          bgcolor: COLORS.primary,
          color: COLORS.white,
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

          {/* Sidebar links */}
          <Box sx={{ mt: 5, textAlign: "start" }}>
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
          bgcolor: "#f9f9f9",
        }}
      >
        {/* Header */}
        {/* <Header /> */}

        {/* Page Content */}
        <Box sx={{ flex: 1, overflowY: "auto", mt: "60px" }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
