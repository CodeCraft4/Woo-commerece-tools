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
import LOGO from "/assets/images/blackLOGO.png";
import { Close, Logout, Person, Search, Settings } from "@mui/icons-material";
import { megaMenuData, navLinks } from "../../../constant/data";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../constant/route";
import MegaMenu from "../../../components/MegaMenu/MegaMenu";
import { useCartStore } from "../../../stores";
import { Avatar, Badge, ListItemIcon, Menu, MenuItem } from "@mui/material";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { useAuth } from "../../../context/AuthContext";
import RemindersDrawer from "../../../components/RemindersDrawer/RemindersDrawer";

interface Props {
  window?: () => Window;
}

const drawerWidth = 200;
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
  const { user, signOut } = useAuth();
  const { cart } = useCartStore();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
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
    setHoveredMenuItem(null);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    signOut();
    openLogout();
  };

  // For Logout Modal
  const {
    open: isOpenLogout,
    openModal: openLogout,
    closeModal: closeLogout,
  } = useModal();

  const drawer = (
    <Box sx={{ textAlign: "center", pt: 8 }}>
      <IconButton sx={{ position: "absolute", top: 0, right: 2 }}>
        <Close onClick={handleDrawerToggle} fontSize="large" />
      </IconButton>
      <Box
        component={"img"}
        src={LOGO}
        alt="LOGO"
        sx={{ width: 200, height: 50, mb: { md: 8, sm: 8, xs: 0 } }}
      />
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
        bgcolor: COLORS.white,
        flexDirection: "column",
        position: "relative",
        pt: 1,
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: { lg: "1360px", md: "100%", sm: "100%", xs: "100%" },
          display: "flex",
          justifyContent: "center",
          m: "auto",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: "transparent",
            position: "sticky",
            // top: 20,
            width: "100%",
          }}
        >
          <Toolbar>
            <Box
              sx={{
                display: { md: "none", sm: "none", xs: "flex" },
                flexDirection: "column",
                width: "100%",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: { md: "none", sm: "none", xs: "flex" },
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, color: COLORS.black }}
                >
                  <MenuIcon fontSize="large" />
                </IconButton>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                      <Box
                        component={"img"}
                        src="/assets/icons/Account.svg"
                        sx={{
                          width: 35,
                          height: 35,
                        }}
                      />
                      <Typography fontSize={"10px"}>Accounts</Typography>
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
                      <Box
                        component={"img"}
                        src="/assets/icons/Basket.svg"
                        sx={{
                          width: 35,
                          height: 35,
                        }}
                      />
                    </Badge>
                    <Typography fontSize={"10px"}>Basket</Typography>
                  </IconButton>
                </Box>
              </Box>

              <Box
                sx={{
                  border: `2px solid ${COLORS.black}`,
                  borderRadius: 8,
                  flexGrow: 1,
                  height: "45px",
                  display: "flex",
                  // bgcolor: "lightGray",
                  // bgcolor:COLORS.gray,
                  justifyContent: "space-between",
                  alignItems: "center",
                  // py: 1,
                }}
              >
                <Box
                  component="input"
                  sx={searchInputStyle}
                  placeholder="Search for cards, gift and flowers...."
                  onChange={(e) => setSearch(e.target.value)}
                />

                <Search
                  onClick={() => navigate(`${USER_ROUTES.VIEW_ALL}/${search}`)}
                  fontSize="large"
                  sx={{ color: COLORS.black, mr: 1, cursor: "pointer" }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                display: {
                  md: "flex",
                  xs: "none",
                  sm: "block",
                },
                alignItems: "center",
              }}
            >
              <a href="/">
                <Box
                  component={"img"}
                  src={LOGO}
                  alt="LOGO"
                  width={{ lg: "450px", md: "450px", sm: "550px", xs: "100%" }}
                  height={150}
                />
              </a>
              <Box
                sx={{
                  // bgcolor: COLORS.black,
                  // border:`1px solid ${COLORS.black}`,
                  borderRadius: 2,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  height: "70px",
                }}
              >
                <Box
                  sx={{
                    border: `2px solid ${COLORS.black}`,
                    borderRadius: 8,
                    flexGrow: 1,
                    height: "45px",
                    display: "flex",
                    // bgcolor: "lightGray",
                    // bgcolor:COLORS.gray,
                    justifyContent: "space-between",
                    alignItems: "center",
                    // py: 1,
                  }}
                >
                  <Box
                    component="input"
                    sx={searchInputStyle}
                    placeholder="Search for cards, gift and flowers...."
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && search.trim() !== "") {
                        navigate(`${USER_ROUTES.VIEW_ALL}/${search}`);
                      }
                    }}
                  />

                  <Search
                    onClick={() =>
                      navigate(`${USER_ROUTES.VIEW_ALL}/${search}`)
                    }
                    fontSize="large"
                    sx={{ color: COLORS.black, mr: 1, cursor: "pointer" }}
                  />
                </Box>
                <Box
                  sx={{
                    display: {
                      md: "flex",
                      xs: "none",
                      sm: "block",
                      gap: "12px",
                    },
                  }}
                >
                  {/* reminder drawer  */}

                  <RemindersDrawer />
                  {user ? (
                    <>
                      <IconButton onClick={handleOpenMenu}>
                        <Avatar
                          sx={{
                            bgcolor: "orange",
                            width: 40,
                            height: 40,
                            border: "2px solid orange",
                          }}
                          src={user.user_metadata?.avatar_url || undefined}
                          alt={user.user_metadata?.name || user.email}
                        >
                          {/* Fallback letter if no image */}
                          {!user.user_metadata?.avatar_url &&
                            (user.user_metadata?.name
                              ?.charAt(0)
                              .toUpperCase() ||
                              user.email?.charAt(0).toUpperCase())}
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
                      <Box
                        component={"img"}
                        src="/assets/icons/Account.svg"
                        sx={{
                          width: 35,
                          height: 35,
                        }}
                      />
                      {/* <Person fontSize="large"/> */}
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
                      <Box
                        component={"img"}
                        src="/assets/icons/Basket.svg"
                        sx={{
                          width: 35,
                          height: 35,
                        }}
                      />
                      {/* <ShoppingBag fontSize="large"/> */}
                    </Badge>
                    <Typography fontSize={"12px"}>Basket</Typography>
                  </IconButton>
                </Box>
              </Box>
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
                bgcolor: COLORS.primary,
                color: COLORS.white,
              },
            }}
          >
            {drawer}
          </Drawer>
        </nav>
      </Box>
      <Box
        sx={{
          width: "100%",
          display: { md: "flex", sm: "flex", xs: "none" },
          m: "auto",
          flexDirection: "column",
          position: "relative",
          bgcolor: COLORS.primary,
          mt: "3px",
        }}
        onMouseLeave={handleMouseLeave}
      >
        <List
          sx={{
            display: "flex",
            m: "auto",
            color: "white",
            p: 3,
            width: { lg: "1360px", md: "100%", sm: "100%", xs: "auto" },
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
                "&:hover": { color: COLORS.black },
                flexGrow: 1,
                fontSize: "14px",
                display: "flex",
                width: "100%",
                justifyContent: "space-around",
                color: COLORS.black,
              }}
            >
              {item.name}
            </ListItem>
          ))}
        </List>
        <Box
          sx={{
            width: { lg: "1340px", md: "100%", sm: "", xs: "auto" },
            display: "flex",
            m: "auto",
            justifyContent: "center",
          }}
        >
          {hoveredMenuItem && megaMenuData[hoveredMenuItem] && (
            <MegaMenu
              data={megaMenuData[hoveredMenuItem]}
              onSelect={handleSelect}
            />
          )}
        </Box>
      </Box>

      {isOpenLogout && (
        <ConfirmModal open={isOpenLogout} onCloseModal={closeLogout} />
      )}
    </Box>
  );
}

const iconStyle = {
  color: COLORS.black,
  flexDirection: "column",
  "&:hover": {
    color: COLORS.primary,
    bgcolor: "transparent",
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
