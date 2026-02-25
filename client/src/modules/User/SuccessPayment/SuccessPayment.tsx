import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../../supabase/supabase";
import { loadSlidesFromIdb } from "../../../lib/idbSlides";
import { API_BASE } from "../../../lib/apiBase";
import { removeWhiteBg } from "../../../lib/lib";
import {
  buildTenUpSlides,
  buildTwoUpSlides,
  buildFixedGridSlides,
  isBusinessCardPrintSize,
  isBusinessCardsCategory,
  isBusinessLeafletsCategory,
  isCandlesCategory,
  isCoastersCategory,
  isNotebooksCategory,
  isMirrorPrintCategory,
  mirrorSlides,
  isCardsCategory,
  isLeafletTwoUpSize,
  isNotebookTwoUpSize,
  isParallelCardSize,
  getLeafletTwoUpPageMm,
  getNotebookTwoUpPageMm,
  getPageMmForSize,
  isInviteTwoUpSize,
  getInviteTwoUpPageMm,
  isMugWrapSize,
  getMugWrapPageMm,
} from "../../../lib/pdfTwoUp";
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

async function getSlidesPayload() {
  try {
    const fromIdb = await loadSlidesFromIdb();
    if (fromIdb && Object.keys(fromIdb).length) return fromIdb;
  } catch {}

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

const buildPdfFileName = (category?: string, ext: "pdf" | "png" = "pdf") => {
  const trimmed = String(category ?? "").trim();
  const lower = trimmed.toLowerCase();
  let label = trimmed;
  if (lower && !lower.endsWith("ss") && lower.endsWith("s")) {
    label = trimmed.slice(0, -1);
  }
  const clean = label
    .replace(/[^a-z0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return `personalised ${clean || "design"} ${ext}`;
};

function getSelectedPlan() {
  return (
    localStorage.getItem("selectedSize") ||
    JSON.parse(localStorage.getItem("selectedVariant") || "{}")?.key ||
    null
  );
}

function getSelectedCategory() {
  try {
    if (typeof window !== "undefined") {
      const fromUrl = new URLSearchParams(window.location.search).get("category");
      if (fromUrl) return fromUrl;
    }
  } catch {}

  const direct = localStorage.getItem("selectedCategory");
  if (direct) return direct;

  try {
    const variant = JSON.parse(localStorage.getItem("selectedVariant") || "{}");
    if (variant?.category) return variant.category;
  } catch {}

  try {
    const raw = JSON.parse(localStorage.getItem("selectedProduct") || "{}");
    return raw?.category || "";
  } catch {
    return "";
  }
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

      const sentKey = `payment_email_sent_${sessionId}`;
      const sentState = sessionStorage.getItem(sentKey);
      if (sentState === "1" || sentState === "sending") {
        setStatus("success");
        setMsg("Payment successful. File sent to your email 📧");
        return;
      }
      sessionStorage.setItem(sentKey, "sending");

      const rawSlides = await getSlidesPayload();
      const cardSize = getSelectedPlan();
      const categoryName = getSelectedCategory();
      const slidesAlreadyMirrored = (() => {
        try {
          return sessionStorage.getItem("slides_mirrored") === "1";
        } catch {
          return false;
        }
      })();
      const mirrorPrint = isMirrorPrintCategory(categoryName) && !slidesAlreadyMirrored;
      const baseSlides = mirrorPrint ? await mirrorSlides(rawSlides) : rawSlides;
      if (slidesAlreadyMirrored) {
        try {
          sessionStorage.removeItem("slides_mirrored");
          sessionStorage.removeItem("slides_mirrored_category");
        } catch {}
      }
      const isTwoUpLandscape = isCardsCategory(categoryName) && isParallelCardSize(cardSize);
      const isInviteTwoUp =
        /invite/i.test(String(categoryName ?? "")) && isInviteTwoUpSize(cardSize);
      const isLeafletTwoUp =
        isBusinessLeafletsCategory(categoryName) && isLeafletTwoUpSize(cardSize);
      const isTenUpBusinessCards =
        isBusinessCardsCategory(categoryName) && isBusinessCardPrintSize(cardSize);
      const isCandlesGrid = isCandlesCategory(categoryName);
      const isCoastersGrid = isCoastersCategory(categoryName);
      const isNotebookTwoUp =
        isNotebooksCategory(categoryName) && isNotebookTwoUpSize(cardSize);
      const isMugWrap = /mug/i.test(String(categoryName ?? "")) && isMugWrapSize(cardSize);

      const isStickerForPdf = /sticker/i.test(String(categoryName ?? ""));
      const isBagOrClothingForPdf = /bag|tote|clothing|clothes|apparel/i.test(
        String(categoryName ?? "")
      );
      const isNotebookCategory = isNotebooksCategory(categoryName);
      const bgRemoveOpts =
        !isCandlesGrid && !isCoastersGrid && !isMugWrap && (isBagOrClothingForPdf || isNotebookCategory)
          ? {
              threshold: 18,
              alphaThreshold: 8,
              minBrightness: 245,
              satThreshold: 10,
              whiteMinChannel: 240,
              whiteOnly: true,
              requireWhiteBg: true,
            }
          : !isCandlesGrid && !isCoastersGrid && !isMugWrap && isStickerForPdf
          ? { threshold: 28, alphaThreshold: 8, minBrightness: 228, satThreshold: 18 }
          : null;
      const isTransparentPdf =
        isStickerForPdf ||
        isBagOrClothingForPdf ||
        isCoastersGrid ||
        isMugWrap ||
        isNotebookCategory;

      const processedCandleSlides = isCandlesGrid
        ? await (async () => {
            const entries = await Promise.all(
              Object.entries(baseSlides as Record<string, string>).map(async ([k, v]) => {
                const src = typeof v === "string" ? v : "";
                if (!src) return [k, v] as const;
                const cleaned = await removeWhiteBg(src, {
                  threshold: 24,
                  alphaThreshold: 8,
                  minBrightness: 235,
                  satThreshold: 16,
                  mode: "all",
                });
                return [k, cleaned] as const;
              })
            );
            return Object.fromEntries(entries);
          })()
        : baseSlides;

      const processedCoasterSlides = isCoastersGrid
        ? await (async () => {
            const entries = await Promise.all(
              Object.entries(baseSlides as Record<string, string>).map(async ([k, v]) => {
                const src = typeof v === "string" ? v : "";
                if (!src) return [k, v] as const;
                const cleaned = await removeWhiteBg(src, {
                  threshold: 24,
                  alphaThreshold: 8,
                  minBrightness: 235,
                  satThreshold: 16,
                  mode: "edge",
                  whiteOnly: true,
                  requireWhiteBg: true,
                });
                return [k, cleaned] as const;
              })
            );
            return Object.fromEntries(entries);
          })()
        : baseSlides;

      const processedMugSlides = isMugWrap
        ? await (async () => {
            const entries = await Promise.all(
              Object.entries(baseSlides as Record<string, string>).map(async ([k, v]) => {
                const src = typeof v === "string" ? v : "";
                if (!src) return [k, v] as const;
                const cleaned = await removeWhiteBg(src, {
                  threshold: 18,
                  alphaThreshold: 8,
                  minBrightness: 245,
                  satThreshold: 10,
                  whiteMinChannel: 240,
                  whiteOnly: true,
                  requireWhiteBg: true,
                  mode: "edge",
                });
                return [k, cleaned] as const;
              })
            );
            return Object.fromEntries(entries);
          })()
        : baseSlides;

      const processedBgSlides = bgRemoveOpts
        ? await (async () => {
            const entries = await Promise.all(
              Object.entries(baseSlides as Record<string, string>).map(async ([k, v]) => {
                const src = typeof v === "string" ? v : "";
                if (!src) return [k, v] as const;
                const cleaned = await removeWhiteBg(src, bgRemoveOpts);
                return [k, cleaned] as const;
              })
            );
            return Object.fromEntries(entries);
          })()
        : baseSlides;

      const notebookSlides = (() => {
        if (!isNotebookTwoUp) return baseSlides;
        const sourceSlides = processedBgSlides;
        const keys = Object.keys(sourceSlides).filter((k) => sourceSlides[k]);
        if (keys.length >= 2) return sourceSlides;
        if (keys.length === 1) {
          const k = keys[0];
          return { [k]: sourceSlides[k], [`${k}-copy`]: sourceSlides[k] };
        }
        return sourceSlides;
      })();

      const slides = isTenUpBusinessCards
        ? await buildTenUpSlides(baseSlides, {
            columns: 2,
            rows: 5,
            gapPx: 10,
            marginPx: 0,
            orientation: "portrait",
            fit: "cover",
            pageMm: getPageMmForSize(cardSize),
          })
        : isCandlesGrid
        ? await buildFixedGridSlides(processedCandleSlides, {
            columns: 2,
            rows: 3,
            labelMm: { w: 70, h: 70 },
            gapMm: 0,
            distribute: true,
            fit: "contain",
            pageMm: getPageMmForSize(cardSize),
          })
        : isCoastersGrid
        ? await buildFixedGridSlides(processedCoasterSlides, {
            columns: 2,
            rows: 3,
            labelMm: { w: 95, h: 95 },
            gapMm: 0,
            distribute: true,
            fit: "contain",
            pageMm: getPageMmForSize(cardSize),
            background: "transparent",
            outputFormat: "png",
          })
        : isMugWrap
        ? await buildFixedGridSlides(processedMugSlides, {
            columns: 1,
            rows: 1,
            labelMm: getMugWrapPageMm(cardSize),
            gapMm: 0,
            distribute: false,
            fit: "cover",
            pageMm: getMugWrapPageMm(cardSize),
            background: "transparent",
            outputFormat: "png",
          })
        : isInviteTwoUp
        ? await buildFixedGridSlides(baseSlides, {
            columns: 2,
            rows: 1,
            labelMm: getPageMmForSize(cardSize),
            gapMm: 0,
            distribute: false,
            fit: "contain",
            pageMm: getInviteTwoUpPageMm(cardSize),
          })
        : isNotebookTwoUp
        ? await buildTwoUpSlides(notebookSlides, {
            gapPx: 0,
            orientation: "landscape",
            fit: "contain",
            pairStrategy: "sequential",
            swapPairs: false,
            pageMm: getNotebookTwoUpPageMm(cardSize),
            background: "transparent",
            outputFormat: "png",
          })
        : isLeafletTwoUp
        ? await buildTwoUpSlides(baseSlides, {
            gapPx: 0,
            orientation: "landscape",
            fit: "cover",
            pairStrategy: "sequential",
            swapPairs: false,
            pageMm: getLeafletTwoUpPageMm(cardSize),
          })
        : isTwoUpLandscape
        ? await buildTwoUpSlides(baseSlides, {
            gapPx: 0,
            orientation: "landscape",
            fit: "cover",
            pairStrategy: "outer-inner",
            swapPairs: true,
            pageMm: getPageMmForSize(cardSize),
            pageTitle: ({ pageIndex }) => {
              if (pageIndex === 1) return "Page 1: (front) and (back)";
              if (pageIndex === 2) return "Page 2: (inside 1) and (inside 2)";
              return null;
            },
          })
        : processedBgSlides;

      if (!Object.keys(slides).length) {
        throw new Error("Slides data missing");
      }

      const outputFormat = isTransparentPdf ? "png" : "pdf";

      const res = await fetch(`${API_BASE}/send-pdf-after-success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          slides,
          cardSize,
          category: categoryName,
          fileName: buildPdfFileName(categoryName, outputFormat),
          ...(isTransparentPdf ? { outputFormat } : {}),
          ...(isTwoUpLandscape || isLeafletTwoUp || isNotebookTwoUp || isInviteTwoUp || isMugWrap
            ? { pageOrientation: "landscape" }
            : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed (${res.status})`);
      }

      sessionStorage.setItem(`payment_email_sent_${sessionId}`, "1");

      setStatus("success");
      setMsg("Payment successful. File sent to your email 📧");
      toast.success("File generated & sent to your email!");
    } catch (e: any) {
      if (sessionId) {
        sessionStorage.removeItem(`payment_email_sent_${sessionId}`);
      }
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
