import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import CustomButton from "../../../components/CustomButton/CustomButton";
import { Redo, Undo } from "@mui/icons-material";
import { USER_ROUTES } from "../../../constant/route";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const pathname = location.pathname.startsWith(`${USER_ROUTES.HOME}/`)

  return (
    <Box>
      <AppBar
        position="relative"
        sx={{
          bgcolor: "white",
          color: "black",
          boxShadow: "4px 0px 8px #929292ff",
        }}
        elevation={0}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            LOGO
          </Typography>

          <Box>
            <IconButton>
              <Undo sx={{ color: "gray", cursor: "pointer" }} />
            </IconButton>
            <IconButton>
              <Redo sx={{ color: "gray", cursor: "pointer" }} />
            </IconButton>
          </Box>

          {pathname ? (
            <CustomButton
              title="Preview"
              onClick={() => navigate(USER_ROUTES.PREVIEW)}
            />
          ) : (
            <Box sx={{display:'flex',gap:3,alignItems:'center'}}>
              <CustomButton
                title="Edit Design"
                onClick={() => navigate(USER_ROUTES.HOME)}
                variant="outlined"
              />
              <CustomButton
                title="Add to Basket"
                onClick={() => navigate(USER_ROUTES.SUBSCRIPTION)}
              />
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
