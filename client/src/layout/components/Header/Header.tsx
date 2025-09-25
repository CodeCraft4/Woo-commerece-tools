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
import LOGO from "../../../assets/LOGO.png";
import {
  DateRange,
  Flag,
  Person,
  Search,
  ShoppingBag,
} from "@mui/icons-material";
import { megaMenuData, navLinks } from "../../../constant/data";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../constant/route";

interface Props {
  window?: () => Window;
}

const drawerWidth = 240;
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
  Beauty: MegaMenuItem;
  Cards: MegaMenuItem;
  Gifts: MegaMenuItem;
  "Flowers/Plants": MegaMenuItem;
  "Alcohol Gifts": MegaMenuItem;
  "Gift Vouchers": MegaMenuItem;
  "For Business": MegaMenuItem;
  "For Kids": MegaMenuItem;
}

type MegaMenuKeys = keyof MegaMenuData;

const MegaMenu = ({ data }: { data: MegaMenuItem }) => (
  <Box
    sx={{
      position: "absolute",
      top: "100%",
      left: 0,
      width: "100%",
      bgcolor: "white",
      height: 600,
      boxShadow: 3,
      zIndex: 10,
      p: 4,
      display: "flex",
      gap: 5,
      borderTop: "1px solid #ddd",
    }}
  >
    {data.categories.map((category, index: number) => (
      <Box key={index}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          {category.name}
        </Typography>
        <List sx={{ p: 0 }}>
          {category.links.map((link, linkIndex: number) => (
            <ListItemButton key={linkIndex} sx={{ py: 0.5, px: 0 }}>
              <ListItemText primary={link} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    ))}
  </Box>
);

export default function Header(props: Props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [hoveredMenuItem, setHoveredMenuItem] =
    React.useState<MegaMenuKeys | null>(null);

  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleMouseEnter = (item: MegaMenuKeys) => {
    setHoveredMenuItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredMenuItem(null);
  };

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
              <Box
                component={"img"}
                src={LOGO}
                alt="LOGO"
                width={"300px"}
                height={50}
              />
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
                  sx={{
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
                  }}
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
              <IconButton
                sx={iconStyle}
                onClick={() => navigate(USER_ROUTES.HOME)}
              >
                <Person fontSize="large" />
                <Typography fontSize={"12px"}>Accounts</Typography>
              </IconButton>
              <IconButton
                sx={iconStyle}
                onClick={() => navigate(USER_ROUTES.HOME)}
              >
                <ShoppingBag fontSize="large" />
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
      >
        <List
          sx={{
            display: "flex",
            m: "auto",
            color: "white",
            pt: 3,
            width: "100%",
            gap: "8px",
          }}
          onMouseLeave={handleMouseLeave}
        >
          {navLinks.map((item) => (
            <ListItem
              key={item.name}
              onMouseEnter={() => handleMouseEnter(item.name as MegaMenuKeys)}
              sx={{
                cursor: "pointer",
                "&:hover": { color: "orange" },
                flexGrow: 1,
              }}
            >
              {item.name}
            </ListItem>
          ))}
          <Typography
            sx={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
              color: "orange",
            }}
          >
            Deliver&nbsp;to
            <Flag />
          </Typography>
        </List>
        {hoveredMenuItem && megaMenuData[hoveredMenuItem] && (
          <MegaMenu data={megaMenuData[hoveredMenuItem]} />
        )}
      </Box>
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
