import { Add } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import CardModal from "../../../components/CardModal/CardModal";

const DashboardHeader = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #c5c5c5ff",
        }}
      >
        <Typography sx={{ fontSize: "30px", fontFamily: "cursive" }}>
          DashboardHeader
        </Typography>
        <Button
          variant="contained"
          color="success"
          sx={{ p: 1, display: "flex", alignItems: "center", gap: "4px" }}
          onClick={() => setOpenModal(!openModal)}
        >
          Add Cards <Add />
        </Button>
      </Box>
      {openModal && (
        <CardModal open={openModal} onCloseModal={() => setOpenModal(false)} />
      )}
    </>
  );
};

export default DashboardHeader;
