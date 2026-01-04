import { useEffect, useMemo, useState } from "react";
import { Check, ErrorOutline, HourglassEmptyOutlined } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";

const EMPTY_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

const isNonEmptySlide = (s: any) => {
  if (!s) return false;

  if (typeof s === "string") {
    const str = s.trim();
    if (!str) return false;
    if (str === EMPTY_1PX) return false;
    if (str.length < 200) return false;
    return true;
  }

  if (typeof s === "object") {
    const img = (s.image ?? s.src ?? s.png ?? s.dataUrl ?? "").trim?.() || "";
    if (!img) return false;
    if (img === EMPTY_1PX) return false;
    if (img.length < 200) return false;
    return true;
  }

  return false;
};

type PdfStatus = "idle" | "loading" | "success" | "error";

const SuccessPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { open: isPDFModal, openModal: openPDFModal, closeModal: closePDFModal } = useModal();

  const [status, setStatus] = useState<PdfStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);

  const getCleanedSlides = () => {
    let slides: any = null;
    const raw = sessionStorage.getItem("slides");

    if (raw && raw !== "undefined") {
      try {
        slides = JSON.parse(raw);
      } catch {
        slides = null;
      }
    }

    const cleanedSlides = Array.isArray(slides) ? slides.filter(isNonEmptySlide) : [];
    return cleanedSlides;
  };

  const sendPdf = async () => {
    if (!sessionId) return;

    openPDFModal();
    setStatus("loading");
    setErrorMsg("");

    const cleanedSlides = getCleanedSlides();

    // ✅ if no slides => don't call API
    if (!cleanedSlides.length) {
      setStatus("error");
      setErrorMsg("No valid slides were found, so the PDF could not be generated.");
      toast.error("PDF not generated: No valid slides found.");
      return;
    }

    try {
      const res = await fetch(
        // ✅ use your deployed backend in prod, localhost in dev
        "https://diypersonalisation.com/api/send-pdf-after-success",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            cardSize: localStorage.getItem("selectedSize"),
            slides: cleanedSlides,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed (HTTP ${res.status})`);
      }

      await res.json();
      setStatus("success");
      toast.success("Payment successful! PDF has been emailed to you.");
    } catch (e: any) {
      const msg =
        e?.message ||
        "We couldn't generate your PDF right now. Please try again.";

      setStatus("error");
      setErrorMsg(msg);
      toast.error(`PDF could not be sent: ${msg}`);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    sendPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const openGmail = () => {
    window.open("https://mail.google.com/mail/u/0/#inbox", "_blank", "noopener,noreferrer");
  };

  const handleCloseModal = () => {
    // ✅ block close only while loading
    if (status === "loading") return;
    closePDFModal();
    navigate(-3);
  };

  const modalTitle =
    status === "loading"
      ? "Generating your PDF…"
      : status === "success"
      ? "✅ PDF generated & sent to your email"
      : "❌ PDF was not generated";

  const modalIcon =
    status === "loading" ? (
      <HourglassEmptyOutlined fontSize="large" />
    ) : status === "success" ? (
      <Check color="success" fontSize="large" />
    ) : (
      <ErrorOutline color="error" fontSize="large" />
    );

  const modalBtnText =
    status === "loading"
      ? "Please wait…"
      : status === "success"
      ? "Open Gmail"
      : "Try Again";

  const handlePrimaryClick = () => {
    if (status === "success") openGmail();
    if (status === "error") sendPdf();
  };

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
      {isPDFModal && (
        <ConfirmModal
          open={isPDFModal}
          onCloseModal={handleCloseModal}
          title={modalTitle}
          icon={modalIcon}
          btnText={modalBtnText}
          onClick={handlePrimaryClick}
          // ✅ if your ConfirmModal supports "description" prop, use it
          // description={status === "error" ? errorMsg : undefined}
        />
      )}

      {/* ✅ If ConfirmModal doesn't have description prop, show message outside it */}
      {isPDFModal && status === "error" && (
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
            maxWidth: 520,
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            fontSize: 14,
          }}
        >
          {errorMsg || "We couldn't generate your PDF. Please try again."}
        </Box>
      )}
    </Box>
  );
};

export default SuccessPayment;
