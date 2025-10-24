import { Box, IconButton, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../constant/route";
import {
  AddShoppingCart,
  ArrowForwardIos,
  Dashboard,
  LocalMall,
  Logout,
  Settings,
} from "@mui/icons-material";
import { useAdminStore } from "../../../stores";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const { logout } = useAdminStore();

  const {
    open: isConfirmModal,
    openModal: openConfirmModal,
    closeModal: closeConfirmModal,
  } = useModal();

  const links = [
    {
      icon: <Dashboard />,
      title: "Dashboard",
      href: ADMINS_DASHBOARD.HOME,
    },
    {
      icon: <LocalMall />,
      title: "Products",
      href: ADMINS_DASHBOARD.PRODUCTS_LIST,
    },
    {
      icon: <AddShoppingCart />,
      title: "Add Products",
      href: ADMINS_DASHBOARD.ADD_NEW_CARDS,
    },
    {
      icon: <Settings />,
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
        {links.map((e) => {
          const isActive = pathname === e.href;

          return (
            <Link
              to={e.href}
              key={e.href}
              style={{
                display: "flex",
                gap: "25px",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 14px",
                borderLeft: `4px solid ${
                  isActive ? "#eb5611ff" : "transparent"
                }`,
                // borderRadius: "14px 50px 50px 14px",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                color: "black",
                backgroundColor: isActive ? "#f0f0f0ff" : "white",
                transition: "background-color 0.3s",
                marginBottom: 4,
              }}
            >
              <Box
                sx={{ display: "flex", gap: 1, alignItems: "center", flex: 1 }}
              >
                {e.icon}
                {e.title}
              </Box>

              <ArrowForwardIos fontSize="small" />
            </Link>
          );
        })}

        {/* User Profile / Logout */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mt: 35,
              justifyContent: "center",
              width: "90%",
            }}
          >
            <Box
              component={"div"}
              onClick={openConfirmModal}
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "white",
              }}
            >
              <IconButton>
                <Logout sx={{ color: "red" }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {isConfirmModal && (
        <ConfirmModal
          open={isConfirmModal}
          onCloseModal={closeConfirmModal}
          btnText="Logout"
          icon={<Logout />}
          onClick={logout}
          title="Are you Sure to logout, You are Admin"
        />
      )}
    </Box>
  );
};

export default Sidebar;
