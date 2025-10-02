import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { COLORS } from "../../../constant/color";
import LOGO from "/assets/images/LOGO.png";
import {
  DateRange,
  Logout,
  Person,
  Search,
  Settings,
  ShoppingBag,
} from "@mui/icons-material";
import { megaMenuData, navLinks } from "../../../constant/data";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../constant/route";
import MegaMenu from "../../../components/MegaMenu/MegaMenu";
import { useAuth } from "../../../context/AuthContext";
import { Avatar, Badge, ListItemIcon, Menu, MenuItem } from "@mui/material";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { useCart } from "../../../context/AddToCart";

interface Props {
  window?: () => Window;
}

const drawerWidth = 250;
const navItems = ["Home", "About", "Contact"];

// Define the type for a single category
interface Category {
  name: string;
  links: string[];
}

// Define the type for a single mega menu item
interface MegaMenuItem {
  title: string;
  categories: Category[];
}

// Define the type for the entire mega menu data object
interface MegaMenuData {
  Birthday: MegaMenuItem;
  Cards: MegaMenuItem;
  Gifts: MegaMenuItem;
  "Flowers & Plants": MegaMenuItem;
  "Alcohol Gifts": MegaMenuItem;
  "Gift Vouchers": MegaMenuItem;
  "For Business": MegaMenuItem;
  "For Kids": MegaMenuItem;
}

type MegaMenuKeys = keyof MegaMenuData;

export default function Header(props: Props) {
  const { window } = props;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [hoveredMenuItem, setHoveredMenuItem] =
    React.useState<MegaMenuKeys | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleMouseEnter = (item: MegaMenuKeys) => {
    setHoveredMenuItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredMenuItem(null);
  };

  const handleSelect = () => {
    setHoveredMenuItem(null); // close mega menu
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    openLogout();
  };

  // For Logout Modal
  const {
    open: isOpenLogout,
    openModal: openLogout,
    closeModal: closeLogout,
  } = useModal();

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Box component={"img"} src={LOGO} alt="LOGO" />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: COLORS.primary,
        flexDirection: "column",
        position: "relative",
        py: 1,
        width:'100%',
      }}
    >
      <Box
        sx={{
          width: "1360px",
          display: "flex",
          justifyContent: "center",
          m: "auto",
        }}
        maxWidth="xl"
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ background: "transparent", position: "sticky", top: 20 }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                flexGrow: 1,
                display: {
                  md: "flex",
                  xs: "none",
                  sm: "block",
                  alignItems: "center",
                  gap: "20px",
                  height: "40px",
                },
              }}
            >
              <a href="/">
                <Box
                  component={"img"}
                  src={LOGO}
                  alt="LOGO"
                  width={"450px"}
                  height={70}
                />
              </a>
              <Box
                sx={{
                  border: "2px solid pink",
                  borderRadius: 8,
                  flexGrow: 1.8 / 2,
                  height: "45px",
                  display: "flex",
                  bgcolor: "lightGray",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  component="input"
                  sx={searchInputStyle}
                  placeholder="Search for cards, gift and flowers...."
                />

                <Search
                  fontSize="large"
                  sx={{ color: COLORS.primary, mr: 2 }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: { md: "flex", xs: "none", sm: "block", gap: "12px" },
              }}
            >
              <IconButton sx={iconStyle}>
                <DateRange fontSize="large" />
                <Typography fontSize={"12px"}>Reminders</Typography>
              </IconButton>
              {user ? (
                <>
                  <IconButton onClick={handleOpenMenu}>
                    <Avatar sx={{ bgcolor: "orange" }}>
                      {user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem
                      onClick={() => {
                        // navigate(USER_ROUTES.ACCOUNT_SETTINGS);
                        handleCloseMenu();
                      }}
                      sx={{ width: 150 }}
                    >
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <Typography>Profile</Typography>
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        // navigate(USER_ROUTES.SETTINGS);
                        handleCloseMenu();
                      }}
                    >
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      <Typography>Settings</Typography>
                    </MenuItem>

                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: "red" }} />
                      </ListItemIcon>
                      <Typography>Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <IconButton
                  sx={iconStyle}
                  onClick={() => navigate(USER_ROUTES.SIGNIN)}
                >
                  <Person fontSize="large" />
                  <Typography fontSize="12px">Accounts</Typography>
                </IconButton>
              )}

              <IconButton
                sx={iconStyle}
                onClick={() => navigate(USER_ROUTES.ADD_TO_CART)}
              >
                {/* ✅ Add badge here */}
                <Badge
                  badgeContent={cart.length}
                  color="error"
                  overlap="circular"
                  showZero
                >
                  <ShoppingBag fontSize="large" />
                </Badge>
                <Typography fontSize={"12px"}>Basket</Typography>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <nav>
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        </nav>
      </Box>
      <Box
        sx={{
          width: "1360px",
          display: { md: "flex", sm: "flex", xs: "none" },
          m: "auto",
          flexDirection: "column",
          position: "relative",
        }}
        onMouseLeave={handleMouseLeave}
      >
        <List
          sx={{
            display: "flex",
            m: "auto",
            color: "white",
            pt: 3,
            width: "70%",
          }}
          // onMouseLeave={handleMouseLeave}
        >
          {navLinks.map((item) => (
            <ListItem
              key={item.name}
              onMouseEnter={() => handleMouseEnter(item.name as MegaMenuKeys)}
              sx={{
                m: 0,
                p: 0,
                cursor: "pointer",
                "&:hover": { color: "orange" },
                flexGrow: 1,
                fontSize: "14px",
                display: "flex",
                width: "100%",
                justifyContent: "space-around",
              }}
            >
              {item.name}
            </ListItem>
          ))}
        </List>
        {hoveredMenuItem && megaMenuData[hoveredMenuItem] && (
          <MegaMenu
            data={megaMenuData[hoveredMenuItem]}
            onSelect={handleSelect}
          />
        )}

        {/* <Typography
            sx={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
              color: "orange",
            }}
          >
            Deliver&nbsp;to
            <Flag />
          </Typography> */}
      </Box>

      {isOpenLogout && (
        <ConfirmModal open={isOpenLogout} onCloseModal={closeLogout} />
      )}
    </Box>
  );
}

const iconStyle = {
  color: COLORS.white,
  flexDirection: "column",
  "&:hover": {
    color: "orange",
  },
};

const searchInputStyle = {
  width: "100%",
  height: "42px",
  borderRadius: 8,
  bgcolor: "transparent",
  border: "none",
  outline: "none",
  ml: 1,
  "&:hover": {
    border: "none",
    outline: "none",
  },
  "&:focus": {
    border: "none",
    outline: "none",
  },
  "&:active": {
    border: "none",
    outline: "none",
  },
  "&::placeholder": {
    color: "#212121",
    fontWeight: 700,
    fontSize: "14px",
  },
};
