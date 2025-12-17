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
      fetch("https://diypersonalisation.com/api/send-pdf-after-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          cardSize: localStorage.getItem("selectedSize"),
          slides,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then(() => toast.success(`Payment Successful! PDF sent to your Email!`))
        .catch((e) => toast.error(`PDF could not be sent: ${e.message}`));
    }
  }, []);

  // clear storage after 4s, then navigate
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(USER_ROUTES.SUBSCRIPTION, { replace: true });
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
