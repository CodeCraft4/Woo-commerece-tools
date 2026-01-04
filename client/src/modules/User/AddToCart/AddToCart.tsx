import { useMemo, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MainLayout from "../../../layout/MainLayout";
import { Close, EditOutlined, KeyboardArrowLeft } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { useCartStore } from "../../../stores/cartStore";
import useModal from "../../../hooks/useModal";
import ProductPopup from "../../../components/ProductPopup/ProductPopup";
import { sizeLabel } from "../../../lib/pricing";
import toast from "react-hot-toast";

const toNumberSafe = (v: any, fallback = 0) => {
  if (v == null) return fallback;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

const getItemPrice = (item: any) => {
  const display = Number(item?.displayPrice);
  if (Number.isFinite(display)) return display;

  // backward compat: if your old cart stored `price`
  if (item?.price != null) return toNumberSafe(item.price, 0);

  const size = (item?.selectedSize ?? "a4") as "a4" | "a3" | "us_letter";
  const actual = item?.prices?.actual?.[size];
  const sale = item?.prices?.sale?.[size];

  if (item?.isOnSale && toNumberSafe(sale, 0) > 0) return toNumberSafe(sale, 0);
  return toNumberSafe(actual, 0);
};

const AddToCart = () => {
  const { cart, removeFromCart, clearCart } = useCartStore();
  const navigate = useNavigate();

  const { open, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState<any>(null);

  const totalProducts = cart.length;

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + getItemPrice(item), 0);
  }, [cart]);

  const openEdit = (item: any) => {
    const isTemplate = item.type === "template";

    setSelected({
      id: item.id,
      __type: item.type,

      // popup reads these
      cardname: item.title,
      cardcategory: item.category,
      cardCategory: item.category,

      imageurl: item.img,
      poster: item.img,

      // per-size prices
      a4price: item.prices?.actual?.a4,
      a5price: item.prices?.actual?.a3,
      usletter: item.prices?.actual?.us_letter,

      salea4price: item.prices?.sale?.a4,
      salea5price: item.prices?.sale?.a3,
      saleusletter: item.prices?.sale?.us_letter,

      category: item.category,
      description: item.description,

      // ✅ editor payload
      polygonlayout: !isTemplate ? item.polygonlayout : undefined,

      // ✅ TEMPLATE: must pass full row or raw stores
      templetDesign: isTemplate ? (item.templetDesign ?? item) : undefined,
      rawStores: isTemplate
        ? (item.rawStores ??
          item.templetDesign?.raw_stores ??
          item.templetDesign?.rawStores ??
          item.templetDesign?.raw_Stores)
        : undefined,
    });

    openModal();
  };


  const handlePay = async () => {
  try {
    // optionally: ensure user logged in
    // if (!user) return toast.error("Please login first");

    const res = await fetch("http://localhost:5000/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart, // BUT only ids/types/size/price etc. (no base64)
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Checkout failed");
    }

    const { url } = await res.json();
    window.location.href = url; // ✅ redirect to Stripe
  } catch (e: any) {
    toast.error(e?.message ?? "Unable to start checkout");
  }
};
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

          <Box sx={{ width: "100%", overflowY: "auto", height: 700 }}>
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
                      key={`${item.type}:${item.id}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #ddd",
                        py: 2,
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 260 }}>
                        <Box component={"img"} src={item.img} alt={item.title} width={80} height={100} borderRadius={1} />
                        <Box>
                          <Typography>{item.title || "No title"}</Typography>
                          <Typography sx={{ fontSize: 12, color: "gray" }}>
                            {item.isOnSale ? "Sale" : "Actual"} • {sizeLabel(item.selectedSize ?? "a4")}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography fontSize={"20px"} sx={{ minWidth: 140, textAlign: "right" }}>
                        £{p.toFixed(2)}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton sx={{ border: '1px solid gray' }} onClick={() => openEdit(item)} aria-label="edit">
                          <EditOutlined />
                        </IconButton>

                        <IconButton sx={{ border: '1px solid gray' }} color="error" onClick={() => item?.id && removeFromCart(item.id, item.type)}>
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
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", mx: "auto", mb: 8 }}>
              <Box sx={{ p: 3, width: 400, height: 200, border: "1px solid #212", borderRadius: 2, mt: 2 }}>
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
                <br />
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <LandingButton title="Add To Pay" width="300px" personal onClick={handlePay} />
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
            initialPlan={cart.find((x: any) => String(x.id) === String(selected.id) && x.type === selected.__type)?.selectedSize ?? "a4"}
            isTempletDesign={selected.__type === "template"}
            salePrice={undefined}
          />
        )}
      </Box>
    </MainLayout>
  );
};

export default AddToCart;
