import { Box, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../constant/route";
import { ArrowForwardIos } from "@mui/icons-material";

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const links = [
    {
      icon: "/assets/icons/dashbord.svg",
      title: "Dashboard",
      href: ADMINS_DASHBOARD.HOME,
    },
    {
      icon: "/assets/icons/celebrity.svg",
      title: "Products",
      href: ADMINS_DASHBOARD.PRODUCTS_LIST,
    },
    {
      icon: "/assets/icons/request.svg",
      title: "Add Products",
      href: ADMINS_DASHBOARD.ADD_NEW_CARDS,
    },
    {
      icon: "/assets/icons/setting.svg",
      title: "Settings",
      href: ADMINS_DASHBOARD.SETTINGS,
    },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Typography sx={{ fontSize: 12, color: "white", fontWeight: 600 }}>
        ADMIN
      </Typography>

      <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: "8px" }}>
        {links.map((e, i) => {
          const isActive = i === 0 && pathname === ADMINS_DASHBOARD.HOME;

          return (
            <Link
              key={e.icon}
              to={e.href}
              style={{
                display: "flex",
                gap: "25px",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 12px",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                color: "black",
                backgroundColor: isActive ? "#6C63FF" : "#f5f5f5",
                transition: "background-color 0.3s",
              }}
            >
              <Box
                sx={{ display: "flex", gap: 1, alignItems: "center", flex: 1 }}
              >
                <Box
                  component="img"
                  src={e.icon}
                  alt={`${e.title}-icon`}
                  sx={{
                    width: 20,
                    height: 20,
                    filter: isActive ? "invert(1)" : "none",
                  }}
                />
                {e.title}
              </Box>

              <ArrowForwardIos fontSize="small" />
            </Link>
          );
        })}

        {/* User Profile / Logout */}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "vh",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#aca3e6",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src="/assets/images/AuthLayoutImg.svg"
                alt="user"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#333" }}>
                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
              </Typography>
              <Typography
                sx={{ fontSize: 14, fontWeight: 300, color: "#8F95B2" }}
              >
                {user?.id ? `Id: ${user.id.slice(0, 10)}` : ""}
              </Typography>
            </Box>
          </Box>

          <Box
            component="img"
            src="/assets/icons/up-down-arrow.svg"
            alt="up-down"
            sx={{ width: 17, height: 17 }}
          />
        </Box> */}
      </Box>
    </Box>
  );
};

export default Sidebar;
