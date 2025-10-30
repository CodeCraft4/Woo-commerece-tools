import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { USER_ROUTES } from "../../../constant/route";
import { useNavigate } from "react-router-dom";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { Drafts } from "@mui/icons-material";
import LandingButton from './../../../components/LandingButton/LandingButton';

const Navbar = () => {
  const navigate = useNavigate();
  const pathname = location.pathname.startsWith(`${USER_ROUTES.HOME}/`);

  const {
    open: isDraftModal,
    openModal: isDraftModalOpen,
    closeModal: isCloseDraftModal,
  } = useModal();

  return (
    <Box>
      <AppBar
        position="relative"
        sx={{
          bgcolor: "white",
          color: "black",
          p:0,
        }}
        elevation={2}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            sx={{ color: "blue", textDecoration: "underline",cursor:'pointer',fontWeight:'bold' }}
            onClick={isDraftModalOpen}
          >
            Exit
          </Typography>

          {pathname ? (
            <LandingButton
              title="Preview"
              onClick={() => navigate(USER_ROUTES.PREVIEW)}
            />
          ) : (
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <LandingButton
                onClick={() => navigate(-1)}
                title="Edit Design"
                variant="outlined"
              />
              <LandingButton title="Add to Basket" />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isDraftModal && (
        <ConfirmModal
          open={isDraftModal}
          onCloseModal={isCloseDraftModal}
          btnText="Draft Card"
          title="Is your card save in the draft"
          onClick={() => navigate("/")}
          icon={<Drafts/>}
        />
      )}
    </Box>
  );
};

export default Navbar;
