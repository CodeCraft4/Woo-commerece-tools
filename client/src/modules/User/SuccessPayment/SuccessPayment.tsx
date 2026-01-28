import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../../supabase/supabase";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { Check, ErrorOutline, HourglassEmptyOutlined } from "@mui/icons-material";

type Status = "loading" | "success" | "error";

export default function PremiumSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);

  const { open, openModal, closeModal } = useModal();
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("");

  async function confirmSubscription() {
    if (!sessionId) return;

    openModal();
    setStatus("loading");

    try {
      const s = await supabase.auth.getSession();
      const token = s.data?.session?.access_token;
      if (!token) throw new Error("Login required");

      const res = await fetch("https://diypersonalisation.com/api/subscription/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed (${res.status})`);
      }

      const data = await res.json();
      setStatus("success");
      setMsg(`Plan activated: ${data.planCode}`);
      toast.success("Subscription activated!");
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message || "Failed");
      toast.error(e?.message || "Failed");
    }
  }

  useEffect(() => {
    confirmSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const title =
    status === "loading"
      ? "Activating your plan..."
      : status === "success"
      ? "✅ Subscription Activated"
      : "❌ Activation Failed";

  const icon =
    status === "loading" ? (
      <HourglassEmptyOutlined fontSize="large" />
    ) : status === "success" ? (
      <Check color="success" fontSize="large" />
    ) : (
      <ErrorOutline color="error" fontSize="large" />
    );

  const btnText = status === "loading" ? "Please wait..." : status === "success" ? "Continue" : "Try Again";

  const onPrimary = () => {
    if (status === "success") {
      closeModal();
      navigate("/"); // or your editor/dashboard route
      return;
    }
    confirmSubscription();
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "white" }}>
      {open && (
        <ConfirmModal
          open={open}
          onCloseModal={() => (status === "loading" ? null : closeModal())}
          title={title}
          icon={icon}
          btnText={btnText}
          onClick={onPrimary}
        />
      )}

      {open && status === "error" && (
        <Box sx={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", bgcolor: "#fff", border: "1px solid #eee", px: 2, py: 1, borderRadius: 2 }}>
          {msg}
        </Box>
      )}
    </Box>
  );
}
