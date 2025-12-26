import { useEffect, useState } from "react";
import { Check, HourglassEmptyOutlined } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";

const EMPTY_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

// ✅ Works for: string slides (dataURL), or object slides (image/src/png)
const isNonEmptySlide = (s: any) => {
  if (!s) return false;

  // slides stored as base64 string
  if (typeof s === "string") {
    const str = s.trim();
    if (!str) return false;
    if (str === EMPTY_1PX) return false;
    // mostly empty/invalid base64 strings are very short
    if (str.length < 200) return false;
    return true;
  }

  // slides stored as object
  if (typeof s === "object") {
    const img = (s.image ?? s.src ?? s.png ?? s.dataUrl ?? "").trim?.() || "";
    if (!img) return false;
    if (img === EMPTY_1PX) return false;
    if (img.length < 200) return false;
    return true;
  }

  return false;
};

const SuccessPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { open: isPDFModal, openModal: openPDFModal, closeModal: closePDFModal } = useModal();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    let slides: any = null;
    const raw = sessionStorage.getItem("slides");

    if (raw && raw !== "undefined") {
      try {
        slides = JSON.parse(raw);
      } catch {
        slides = null;
      }
    }

    // ✅ IMPORTANT: remove blank slides
    const cleanedSlides = Array.isArray(slides) ? slides.filter(isNonEmptySlide) : slides;

    const run = async () => {
      openPDFModal();
      setLoading(true);

      try {
        const res = await fetch("https://diypersonalisation.com/api/send-pdf-after-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            cardSize: localStorage.getItem("selectedSize"),
            slides: cleanedSlides, // ✅ send only non-empty slides
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `HTTP ${res.status}`);
        }

        await res.json();
        toast.success("Payment Successful! PDF sent to your Email!");
      } catch (e: any) {
        toast.error(`PDF could not be sent: ${e?.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openGmail = () => {
    window.open("https://mail.google.com/mail/u/0/#inbox", "_blank", "noopener,noreferrer");
  };

  const handleCloseModal = () => {
    if (loading) return;
    closePDFModal();
    navigate(-3);
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
      {/* <Box
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
        <LandingButton title="Return to Card" personal width="200px" onClick={() => navigate(-3)} />
      </Box> */}

      {isPDFModal && (
        <ConfirmModal
          open={isPDFModal}
          onCloseModal={handleCloseModal}
          title={loading ? "Generating your PDF..." : "✅ PDF generated & sent to your Email"}
          icon={loading ? <HourglassEmptyOutlined fontSize="large" /> : <Check color="success" fontSize="large" />}
          btnText={loading ? "Please wait..." : "Open Gmail"}

          onClick={() => {
            if (!loading) openGmail();
          }}
        />
      )}
    </Box>
  );
};

export default SuccessPayment;
