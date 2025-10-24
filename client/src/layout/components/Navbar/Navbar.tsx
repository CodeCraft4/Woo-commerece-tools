import { AppBar, Box, Toolbar } from "@mui/material";
import CustomButton from "../../../components/CustomButton/CustomButton";
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
          <Box
           component={'img'}
           src="/assets/images/blackLOGO.png"
           sx={{width:300,height:80}}
          />
          {pathname ? (
            <CustomButton
              title="Preview"
              onClick={() => navigate(USER_ROUTES.PREVIEW)}
            />
          ) : (
            <Box sx={{display:'flex',gap:3,alignItems:'center'}}>
              <CustomButton
              onClick={() => navigate(-1)}
                title="Edit Design"
                variant="outlined"
              />
              <CustomButton
                title="Add to Basket"
              />
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
