import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  Badge,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import {
  ArrowDropDown,
  Chat,
  LogoutOutlined,
  Notifications,
  PersonOutline,
  SettingsOutlined,
} from "@mui/icons-material";
import { COLORS } from "../../../constant/color";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { useAdmin } from "../../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../constant/route";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "transparent",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  marginLeft: 0,
  width: "100%",
  flexGrow: 3 / 4,
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    flex: 1,
    fontSize:'12px',
    color: COLORS.white,
    "&::placeholder": {
      color: "#fff", // placeholder color to white
      opacity: 1, // ensures full opacity
    },
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const DNavbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  const { logout } = useAdmin();

  const handleMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const {
    open: isLogoutModal,
    openModal: openLogoutModal,
    closeModal: closeLogoutModal,
  } = useModal();

  const handleSignOut = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#160215ff", // black background
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left side - Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flex: 1 }}>
          <Box
            component={"img"}
            src="/assets/images/LOGO.png"
            sx={{
              width: 230,
              height: 50,
            }}
          />
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="   Search…"
              fullWidth
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </Box>

        {/* Right side - Admin dropdown */}
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton sx={{ color: "white" }}>
            <Chat />
          </IconButton>
          <IconButton sx={{ color: "white" }}>
            <Badge badgeContent={2} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <Avatar sx={{ bgcolor: COLORS.primary, width: 30, height: 30 }}>A</Avatar>
          <Typography sx={{ color: "#fff",fontSize:'12px' }}>
            Admin123
          </Typography>
          <IconButton onClick={handleMenu} sx={{ color: "#fff" }}>
            <ArrowDropDown />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: { mt: 1, minWidth: 150,ml:-2 },
            }}
          >
            <MenuItem onClick={() => navigate(ADMINS_DASHBOARD.SETTINGS)}>
              <PersonOutline/> Profile
            </MenuItem>
            <MenuItem onClick={() => navigate(ADMINS_DASHBOARD.SETTINGS)}>
              <SettingsOutlined/> Settings
            </MenuItem>
            <MenuItem onClick={openLogoutModal} sx={{color:'#e91d1dff'}}> <LogoutOutlined/> Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      {isLogoutModal && (
        <ConfirmModal
          open={isLogoutModal}
          onCloseModal={closeLogoutModal}
          icon={<LogoutOutlined />}
          btnText="Yes,Sure"
          title="Are you sure to logout, You are Admin"
          onClick={handleSignOut}
        />
      )}
    </AppBar>
  );
};

export default DNavbar;
