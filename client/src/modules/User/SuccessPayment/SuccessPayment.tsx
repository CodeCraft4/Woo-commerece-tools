import { useEffect } from "react";
import { Check } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { USER_ROUTES } from "../../../constant/route";
import toast from "react-hot-toast";

const SuccessPayment = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  console.log(localStorage.getItem("selectedSize"), 'size')
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    let raw = sessionStorage.getItem("slides");
    let slides = null;

    if (raw && raw !== "undefined") {
      slides = JSON.parse(raw);
    }

    if (sessionId) {
      // fetch("https://diypersonalisationserver-production.up.railway.app/send-pdf-after-success", {
      fetch("http://localhost:5000/send-pdf-after-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          cardSize: localStorage.getItem("selectedSize"),
          slides,
        }),
      })
        .then(() => {
          toast.success("Payment Successful! PDF sent to your email!");
        })
        .catch(() => toast.error("Payment succeeded but PDF could not be sent."));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(USER_ROUTES.SUBSCRIPTION);
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        m: "auto",
        bgcolor: "white",
      }}
    >
      <Box
        sx={{
          p: 2,
          border: "1px solid #c9c8c8ff",
          borderRadius: 5,
          height: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          m: "auto",
          flexDirection: "column",
          width: 500,
          boxShadow: "7px 9px 49px #cacacaff",
        }}
      >
        <IconButton sx={{ border: "1px solid #2b6b33ff" }}>
          <Check sx={{ fontSize: 60, color: "#2b6b33ff" }} />
        </IconButton>
        <Typography variant="h5">Payment Successfully</Typography>
      </Box>
    </Box>
  );
};

export default SuccessPayment;
