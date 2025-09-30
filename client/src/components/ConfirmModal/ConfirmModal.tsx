import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Backdrop, CircularProgress, IconButton } from "@mui/material";
import { Close, LogoutOutlined } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LandingButton from "../LandingButton/LandingButton";
import { useState } from "react";
import toast from "react-hot-toast";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  p: 3,
  //   height: 600,
  textAlign: "center",
  overflowY: "auto",
};

type ModalType = {
  open: boolean;
  onCloseModal: () => void;
};

const ConfirmModal = (props: ModalType) => {
  const { open, onCloseModal } = props || {};

  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success("Logout Successfully");
      navigate("/");
    } catch (err) {
      toast.error("NOT logout");
    } finally {
      setLoading(false);
      onCloseModal();
    }
  };

  return (
    <>
      {/* Fullscreen loader */}
      <Backdrop open={loading} sx={{ zIndex: 2000, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Modal
        open={open}
        onClose={onCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={onCloseModal}>
              <Close />
            </IconButton>
          </Box>

          {/* Header */}
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 50,
              border: "1px solid red",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: "auto",
            }}
          >
            <LogoutOutlined sx={{ fontSize: 30, color: "red" }} />
          </Box>
          <Typography variant="body1" mt={2} mb={2}>
            Are you Sure to Logout on the app
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              justifyContent: "center",
              m: "auto",
              width: "100%",
            }}
          >
            <LandingButton
              title="Cancel"
              personal
              variant="outlined"
              width="200px"
            />
            <LandingButton
              title="Logout"
              personal
              width="200px"
              onClick={handleLogout}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ConfirmModal;
