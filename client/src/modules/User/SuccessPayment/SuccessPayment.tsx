import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../../supabase/supabase";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { Check, ErrorOutline, HourglassEmptyOutlined } from "@mui/icons-material";

type Status = "loading" | "success" | "error";

async function getTokenSafely() {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) return data.session.access_token;

  await new Promise((r) => setTimeout(r, 500));
  const retry = await supabase.auth.getSession();
  return retry.data?.session?.access_token || null;
}

function getSlidesPayload() {
  try {
    const raw =
      sessionStorage.getItem("slides") ||
      localStorage.getItem("slides_backup") ||
      "{}";
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getSelectedPlan() {
  return (
    localStorage.getItem("selectedSize") ||
    JSON.parse(localStorage.getItem("selectedVariant") || "{}")?.key ||
    null
  );
}

export default function PremiumSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);

  const { open, openModal, closeModal } = useModal();
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("");

  async function handlePaymentSuccess() {
    if (!sessionId) return;

    openModal();
    setStatus("loading");

    try {
      const token = await getTokenSafely();
      if (!token) throw new Error("Login required");

      const slides = getSlidesPayload();
      const cardSize = getSelectedPlan();

      if (!Object.keys(slides).length) {
        throw new Error("Slides data missing");
      }

      const res = await fetch(
        "https://diypersonalisation.com/api/send-pdf-after-success",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId,
            slides,
            cardSize,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed (${res.status})`);
      }

      setStatus("success");
      setMsg("Payment successful. PDF sent to your email 📧");
      toast.success("PDF generated & sent to your email!");
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message || "Failed");
      toast.error(e?.message || "Failed");
    }
  }

  useEffect(() => {
    handlePaymentSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const title =
    status === "loading"
      ? "Processing your payment..."
      : status === "success"
      ? "✅ Payment Successful"
      : "❌ Payment Failed";

  const icon =
    status === "loading" ? (
      <HourglassEmptyOutlined fontSize="large" />
    ) : status === "success" ? (
      <Check color="success" fontSize="large" />
    ) : (
      <ErrorOutline color="error" fontSize="large" />
    );

  const btnText =
    status === "loading"
      ? "Please wait..."
      : status === "success"
      ? "Open Gmail"
      : "Try Again";

  const onPrimary = () => {
    if (status === "success") {
      window.open("https://mail.google.com", "_blank");
      return;
    }
    handlePaymentSuccess();
  };

  const onClose = () => {
    if (status === "loading") return;
    closeModal();
    navigate("/subscription");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "white",
      }}
    >
      {open && (
        <ConfirmModal
          open={open}
          onCloseModal={onClose}
          title={title}
          icon={icon}
          btnText={btnText}
          onClick={onPrimary}
        />
      )}

      {open && status === "error" && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "#fff",
            border: "1px solid #eee",
            px: 2,
            py: 1,
            borderRadius: 2,
          }}
        >
          {msg}
        </Box>
      )}
    </Box>
  );
}
