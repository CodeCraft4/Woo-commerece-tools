import { useMemo, useState } from "react";
import { Alert, Box, IconButton, Typography } from "@mui/material";
import MainLayout from "../../../layout/MainLayout";
import { Close, EditOutlined, KeyboardArrowLeft } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { useCartStore } from "../../../stores/cartStore";
import useModal from "../../../hooks/useModal";
import ProductPopup from "../../../components/ProductPopup/ProductPopup";
import { sizeLabel } from "../../../lib/pricing";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import ZIPModal from "./components/ZIPModal";
import { USER_ROUTES } from "../../../constant/route";

const API_BASE = 'https://diypersonalisation.com/api';
// const API_BASE = 'http://localhost:5000';

const toNumberSafe = (v: any, fallback = 0) => {
  if (v == null) return fallback;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

const getItemPrice = (item: any) => {
  const display = Number(item?.displayPrice);
  if (Number.isFinite(display)) return display;

  if (item?.price != null) return toNumberSafe(item.price, 0);

  const size = (item?.selectedSize ?? "a4") as "a4" | "a3" | "us_letter";
  const actual = item?.prices?.actual?.[size];
  const sale = item?.prices?.sale?.[size];

  if (item?.isOnSale && toNumberSafe(sale, 0) > 0) return toNumberSafe(sale, 0);
  return toNumberSafe(actual, 0);
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

const normalizeCartType = (t: any): "card" | "templet" => {
  const v = String(t ?? "").toLowerCase();
  if (v === "templet" || v === "template") return "templet";
  return "card";
};


const normalizeSize = (s: any): "a4" | "a3" | "us_letter" => {
  const v = String(s ?? "a4").toLowerCase();
  if (v === "a3") return "a3";
  if (v === "us_letter") return "us_letter";
  return "a4";
};

const AddToCart = () => {
  const { cart, removeFromCart, clearCart } = useCartStore();
  const navigate = useNavigate();

  const { plan, user, session } = useAuth();

  const { open, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState<any>(null);
  const [zipStep, setZipStep] = useState(0); // 0..3
  const [zipDone, setZipDone] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);


  const [zipLoading, setZipLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const totalProducts = cart.length;
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + getItemPrice(item), 0), [cart]);

  const openEdit = (item: any) => {
    const isTemplate = normalizeCartType(item.type) === "templet";

    setSelected({
      id: item.id,
      __type: normalizeCartType(item.type),
      cardname: item.title,
      cardcategory: item.category,
      cardCategory: item.category,
      imageurl: item.img,
      poster: item.img,
      a4price: item.prices?.actual?.a4,
      a5price: item.prices?.actual?.a3,
      usletter: item.prices?.actual?.us_letter,
      salea4price: item.prices?.sale?.a4,
      salea5price: item.prices?.sale?.a3,
      saleusletter: item.prices?.sale?.us_letter,
      category: item.category,
      description: item.description,
      polygonlayout: !isTemplate ? item.polygonlayout : undefined,
      templetDesign: isTemplate ? (item.templetDesign ?? item) : undefined,
      rawStores: isTemplate
        ? item.rawStores ?? item.templetDesign?.raw_stores ?? item.templetDesign?.rawStores ?? item.templetDesign?.raw_Stores
        : undefined,
    });

    openModal();
  };


  const { open: isZipLoadingModal, closeModal: closeZiploadingModal, openModal: openZipLoadingModal } = useModal()

  const getCartItemsForZip = () =>
    cart.map((x: any) => ({
      id: x.id,
      type: normalizeCartType(x.type),
      selectedSize: normalizeSize(x.selectedSize),
    }));

  // ✅ Pro: Generate ZIP and Email (no Stripe)
  const handleGenerateZip = async () => {
    openZipLoadingModal();              // ✅ open modal first
    setZipDone(false);
    setZipError(null);
    setZipStep(0);

    try {
      if (!user) throw new Error("Please login first");
      if (!session?.access_token) throw new Error("Session missing. Please re-login.");
      if (!cart.length) throw new Error("Cart is empty");

      setZipLoading(true);

      // ✅ progress feel (fake but smooth)
      setZipStep(0); // Uploading request
      const stepTimer = window.setInterval(() => {
        setZipStep((s) => (s < 2 ? s + 1 : s)); // 0->1->2
      }, 1200);

      const res = await fetch(`${API_BASE}/cart/send-zip-by-id-svg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ items: getCartItemsForZip() }),
      });

      const data: any = await safeJson(res);

      window.clearInterval(stepTimer);

      if (!res.ok) throw new Error(data?.error || "Failed to generate ZIP");

      // ✅ last step: emailing
      setZipStep(3);
      setZipDone(true);

      toast.success(`ZIP generated & emailed ✅ (${data.count ?? 0} PDFs)`);
    } catch (e: any) {
      setZipError(e?.message || "Failed");
      toast.error(e?.message || "Failed");
    } finally {
      setZipLoading(false);
    }
  };


  // ✅ Free user: Stripe checkout only
  const handlePay = async () => {
    setCheckoutLoading(true)
    setTimeout(() => {
      navigate(USER_ROUTES.PREMIUM_PLANS)
    }, 2000);
    setCheckoutLoading(false)
  };

  const isPro = String(plan).toLowerCase() === "pro";
  const actionLoading = isPro ? zipLoading : checkoutLoading;

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          width: { lg: "1340px", md: "100%", sm: "100%", xs: "100%" },
          justifyContent: "center",
          m: "auto",
          p: { lg: 3, md: 3, sm: 3, xs: 1 },
        }}
      >
        <Box mt={10}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4 }}>
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)}>
                <KeyboardArrowLeft fontSize="large" />
              </IconButton>
              <Typography variant="h4" gutterBottom>
                🛒 Your Basket
              </Typography>
            </Box>

            <LandingButton title=" Clear Basket" onClick={clearCart} personal variant="outlined" />
          </Box>

          <Box sx={{ width: "100%", overflowY: "auto", height: 500 }}>
            {cart.length === 0 ? (
              <Typography
                sx={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  m: "auto",
                  width: "100%",
                  color: "gray",
                  fontSize: "20px",
                }}
              >
                Your basket is empty.
              </Typography>
            ) : (
              <>
                {cart.map((item: any) => {
                  const p = getItemPrice(item);
                  return (
                    <Box
                      key={`${normalizeCartType(item.type)}:${item.id}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #dad2d2",
                        py: 2,
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 260 }}>
                        <Box component={"img"} src={item.img} alt={item.title} width={80} height={100} borderRadius={1} />
                        <Box>
                          <Typography>{item.title || "No title"}</Typography>
                          <Typography sx={{ fontSize: 12, color: "gray" }}>
                            {item.isOnSale ? "Sale" : "Actual"} • {sizeLabel(normalizeSize(item.selectedSize))}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography fontSize={"20px"} sx={{ minWidth: 140, textAlign: "right" }}>
                        £{p.toFixed(2)}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton sx={{ border: "1px solid gray" }} onClick={() => openEdit(item)} aria-label="edit">
                          <EditOutlined />
                        </IconButton>

                        <IconButton
                          sx={{ border: "1px solid gray" }}
                          color="error"
                          onClick={() => removeFromCart(String(item.id), normalizeCartType(item.type))}
                        >
                          <Close />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>

          {cart.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", mx: "auto", mt: 2 }}>
              <Box sx={{ p: 3, width: 400, height: 'auto', border: "1px solid #212", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography fontSize={"22px"} fontWeight={"bold"}>
                    Total Products
                  </Typography>
                  <Typography fontSize={"15px"}>{totalProducts}</Typography>
                </Box>

                <br />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography fontSize={"22px"} fontWeight={"bold"}>
                    Total Price
                  </Typography>
                  <Typography fontSize={"15px"}>£{totalPrice.toFixed(2)}</Typography>
                </Box>

                {plan !== 'pro' && (
                  <Alert severity="info" color="warning">if You want to generate a ZIP file and email it to yourself, please ensure you are on a Pro plan.</Alert>
                )}
                <br />

                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <LandingButton
                    title={
                      isPro
                        ? actionLoading
                          ? "Generating..."
                          : "Generate ZIP & Email"
                        : actionLoading
                          ? "Processing..."
                          : "Choose you plan"
                    }
                    width="300px"
                    personal
                    onClick={isPro ? handleGenerateZip : handlePay}
                  // loading={actionLoading}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {open && selected && (
          <ProductPopup
            open={open}
            onClose={closeModal}
            cate={selected}
            mode="edit"
            initialPlan={normalizeSize(
              cart.find((x: any) => String(x.id) === String(selected.id) && normalizeCartType(x.type) === selected.__type)?.selectedSize ??
              "a4",
            )}
            isTempletDesign={selected.__type === "templet"}
            // salePrice={undefined}
          />
        )}

        {
          isZipLoadingModal && (
            <ZIPModal
              open={isZipLoadingModal}
              onCloseModal={closeZiploadingModal}
              zipLoading={zipLoading}
              zipStep={zipStep}
              zipDone={zipDone}
              zipError={zipError}
              userEmail={user?.email}
            />

          )
        }
      </Box>
    </MainLayout>
  );
};

export default AddToCart;
