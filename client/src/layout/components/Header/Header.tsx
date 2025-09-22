import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import { COLORS } from "../../../constant/color";
import {
  Close,
  DateRange,
  Person,
  Search,
  ShoppingBag,
} from "@mui/icons-material";
import { useState } from "react";

const Header = () => {
  const [isSearch, setIsSearch] = useState(false);

  return (
    <Box>
      <Box sx={{ bgcolor: COLORS.primary, p: 1 }}>
        <Container maxWidth="xl">
          <AppBar
            position="static"
            sx={{ bgcolor: "transparent", color: COLORS.white }}
            elevation={0}
          >
            <Toolbar
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: COLORS.primary,
                color: COLORS.white,
              }}
            >
              {/* Logo */}
              <Typography variant="h4">Logo</Typography>
              {/* Search Bar */}
              <Box
                sx={{
                  width: "650px",
                  display: {md:"flex",sm:'',xs:'none'},
                  alignItems: "center",
                  bgcolor: COLORS.white,
                  borderRadius: 2,
                  p: "3px",
                }}
              >
                <Box
                  component={"div"}
                  onClick={() => setIsSearch(!isSearch)}
                  sx={{
                    border: "1px solid #666",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    borderRadius: 2,
                  }}
                >
                  <TextField
                    placeholder="I'm looking for..."
                    variant="outlined"
                    fullWidth
                    sx={serachStyle}
                  />
                  <Button
                    sx={{
                      bgcolor: isSearch ? COLORS.white : "#75d27d",
                      height: "60px",
                      borderRadius: 0,
                    }}
                  >
                    {isSearch ? (
                      <Close
                        onClick={() => setIsSearch(false)}
                        fontSize="large"
                        sx={{ color: COLORS.primary }}
                      />
                    ) : (
                      <Search fontSize="large" sx={{ color: COLORS.white }} />
                    )}
                  </Button>
                </Box>
              </Box>
              {/* Icon */}
              <Box sx={{ display: {md:"flex",sm:'',xs:'none'}, gap: 1, alignItems: "center" }}>
                <IconButton sx={iconStyle}>
                  <DateRange fontSize="large" />
                  Reminder
                </IconButton>
                <IconButton sx={iconStyle}>
                  <Person fontSize="large" />
                  Account
                </IconButton>
                <IconButton sx={iconStyle}>
                  <ShoppingBag fontSize="large" />
                  Basket
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
        </Container>
      </Box>

      {/* Toggle Menue */}
      {isSearch && (
        <Box
          sx={{
            width: "100%",
            height: "90vh",
            position: "absolute",
            top: 85,
            bgcolor:'cyan',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            m:'auto'
          }}
        >
          <Typography variant="h1">Menu List</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Header;

const iconStyle = {
  color: COLORS.white,
  display: "flex",
  flexDirection: "column",
  fontSize: "13px",
  "&:hover": {
    color: "orange",
  },
};

const serachStyle = {
  borderRadius: 2,
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none", // remove border
    },
    "&:hover fieldset": {
      border: "none", // remove on hover
    },
    "&.Mui-focused fieldset": {
      border: "none", // remove on focus
    },
    "& input::placeholder": {
      color: COLORS.primary,
      fontSize: "20px", // placeholder color
      opacity: 1, // ensure it's not faded
    },
  },
};
