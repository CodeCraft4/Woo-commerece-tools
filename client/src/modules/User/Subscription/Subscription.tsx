import { Box, Container, Grid, IconButton, Typography } from "@mui/material";
import Applayout from "../../../layout/Applayout";
import { useMemo, useState, useEffect } from "react";
import TableBgImg from "/assets/images/table.png";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { ArrowBackIos } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ REUSE SAME SizeKey TYPE AS POPUP
import { type SizeKey } from "../../../stores/cartStore";
import { pickPrice } from "../../../lib/pricing";
import { getMockupConfig } from "../../../lib/mockup";

const stripePromise = loadStripe("pk_test_51S5Pnw6w4VLajVLTFff76bJmNdN9UKKAZ2GKrXL41ZHlqaMxjXBjlCEly60J69hr3noxGXv6XL2Rj4Gp4yfPCjAy00j41t6ReK");

type SelectedVariant = {
  key: SizeKey;
  title: string;
  price: number;
  isOnSale?: boolean;
  category?: string;
};

type SelectedProduct = {
  id?: string | number;
  type?: "card" | "template";
  title?: string;
  category?: string;
  img?: string;
};

type PriceTables = { actual: any; sale: any };

type SizeDef = { key: any; title: string; sub?: string };

const hasValidPrice = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

// ✅ SAME category->sizes mapping (copy from ProductPopup)
const getSizeDefsForCategory = (categoryName?: string): SizeDef[] => {
  const name = (categoryName ?? "").trim().toLowerCase();

  if (name.includes("invite")) {
    return [
      { key: "a5", title: "A5", sub: "Prints 2 invites per A4 sheet" },
      { key: "a4", title: "A4", sub: "Prints 1 invite per A4 sheet" },
      { key: "half_us_letter", title: "Half US Letter", sub: "Prints 2 invites per US Letter sheet" },
      { key: "us_letter", title: "US Letter", sub: "Prints 1 invite per US Letter sheet" },
    ];
  }

  if (
    name.includes("clothing") ||
    name.includes("sticker") ||
    name.includes("wall art") ||
    name.includes("photo art") ||
    name.includes("bag")
  ) {
    return [
      { key: "a4", title: "A4" },
      { key: "a3", title: "A3" },
      { key: "us_letter", title: "US Letter" },
      { key: "us_tabloid", title: "US Tabloid (11 × 17 in)" },
    ];
  }

  if (name.includes("notebook")) {
    return [
      { key: "a5", title: "A5" },
      { key: "a4", title: "A4" },
      { key: "half_us_letter", title: "Half US Letter" },
      { key: "us_letter", title: "US Letter" },
    ];
  }

  if (name.includes("mug")) {
    return [{ key: "mug_wrap_11oz", title: "228mm × 88.9mm wrap (11oz mug)" }];
  }

  if (name.includes("coaster")) {
    return [{ key: "coaster_95", title: "95mm × 95mm (×2 coasters)" }];
  }

  return [
    { key: "a5", title: "A5" },
    { key: "a4", title: "A4" },
    { key: "half_us_letter", title: "Half US Letter" },
    { key: "us_letter", title: "US Letter" },
    { key: "us_tabloid", title: "US Tabloid (Folded half: 11 × 8.5 in)" },
  ];
};

// ✅ OPTIONAL: preview frame labels for UI (fallback safe)
// const previewLabelByKey: Partial<Record<any, string>> = {
//   a4: "A4",
//   a5: "A5",
//   a3: "A3",
//   us_letter: "US Letter",
//   half_us_letter: "Half US",
//   us_tabloid: "Tabloid",
//   mug_wrap_11oz: "Mug",
//   coaster_95: "Coaster",
// };

const isActivePay = {
  display: "flex",
  gap: "4px",
  justifyContent: "space-between",
  alignItems: "center",
  bgcolor: "#cdf0c06a",
  p: "3px",
  borderRadius: 2,
  boxShadow: "3px 7px 8px #eff1f1ff",
};

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<SizeKey>("a4" as SizeKey);
  const [loading, setLoading] = useState(false);

  const [variant, setVariant] = useState<SelectedVariant | null>(null);
  const [product, setProduct] = useState<SelectedProduct | null>(null);
  const [priceTables, setPriceTables] = useState<PriceTables | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const { state } = useLocation() as { state?: { slides?: Record<string, string> } };

  const slidesObj = useMemo(() => {
    // 1) state priority (fresh navigation)
    if (state?.slides) return state.slides;

    // 2) fallback localStorage
    try {
      return JSON.parse(localStorage.getItem("slides_backup") || "{}");
    } catch {
      return {};
    }
  }, [state?.slides]);

  const firstSlideUrl = slidesObj?.slide1 || "";

  console.log(firstSlideUrl, '---')

  const { user } = useAuth();
  const navigate = useNavigate();

  const mugImageSrc = useMemo(() => {
    return sessionStorage.getItem("mugImage"); // string | null
  }, []);

  // ✅ hydrate everything from localStorage (same data ProductPopup saves)
  useEffect(() => {
    try {
      const rawV = localStorage.getItem("selectedVariant");
      if (rawV) {
        const parsed = JSON.parse(rawV) as SelectedVariant;
        if (parsed?.key) {
          setVariant(parsed);
          setSelectedPlan(parsed.key);
        }
      }
    } catch { }

    try {
      const rawP = localStorage.getItem("selectedPrices");
      if (rawP) {
        const parsed = JSON.parse(rawP) as PriceTables;
        if (parsed?.actual && parsed?.sale) setPriceTables(parsed);
      }
    } catch { }

    try {
      const rawProd = localStorage.getItem("selectedProduct");
      if (rawProd) {
        const parsed = JSON.parse(rawProd) as SelectedProduct;
        setProduct(parsed);
      }
    } catch { }
  }, []);

  const categoryName = useMemo(() => {
    return variant?.category || product?.category || "default";
  }, [variant?.category, product?.category]);

  const sizeDefs = useMemo(() => getSizeDefsForCategory(categoryName), [categoryName]);

  // ✅ only sizes that exist in actual table
  const sizeOptions = useMemo(() => {
    const actual = priceTables?.actual ?? {};
    return sizeDefs.filter((d) => hasValidPrice(actual[d.key]));
  }, [sizeDefs, priceTables?.actual]);

  // ✅ if current selected size is not available, auto pick first
  useEffect(() => {
    if (!sizeOptions.length) return;
    const exists = sizeOptions.some((x) => x.key === selectedPlan);
    if (!exists) setSelectedPlan(sizeOptions[0].key);
  }, [sizeOptions, selectedPlan]);

  const useSaleForSelected = useMemo(() => {
    // follow popup behavior: use variant.isOnSale if provided, else check sale table value
    if (variant?.isOnSale === true) return true;
    if (variant?.isOnSale === false) return false;

    const v = priceTables?.sale?.[selectedPlan];
    return Number.isFinite(Number(v)) && Number(v) > 0;
  }, [variant?.isOnSale, priceTables?.sale, selectedPlan]);

  // const currentPrice = useMemo(() => {
  //   const actual = priceTables?.actual ?? {};
  //   const sale = priceTables?.sale ?? {};
  //   return pickPrice(actual, useSaleForSelected ? sale : undefined, selectedPlan);
  // }, [priceTables, useSaleForSelected, selectedPlan]);

  const plans = useMemo(() => {
    return sizeOptions.map((opt) => {
      const p = pickPrice(priceTables?.actual ?? {}, useSaleForSelected ? (priceTables?.sale ?? {}) : undefined, opt.key);
      return {
        id: opt.key,
        title: opt.title,
        sub: opt.sub,
        price: Number(p.price) || 0,
        isOnSale: p.isOnSale,
      };
    });
  }, [sizeOptions, priceTables, useSaleForSelected]);

  // const previewLabel = previewLabelByKey[selectedPlan] ?? String(selectedPlan);

  const handleStripeOrder = async (plan: { title: string; price: number }) => {
    setLoading(true);
    try {
      const res = await fetch("https://diypersonalisation.com/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: plan.title,
          price: plan.price,
          user: {
            email: user?.email,
            name: user?.user_metadata?.full_name || "User",
          },
          metadata: { variantKey: selectedPlan, category: categoryName },
        }),
      });

      if (!res.ok) throw new Error("checkout failed");
      const { id } = await res.json();

      const stripe: any = await stripePromise;
      toast.success("Navigate to Payment process");
      await stripe.redirectToCheckout({ sessionId: id });
    } catch {
      toast.error("Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = () => {
    if (!termsAccepted) {
      toast.error("Please accept Terms & Conditions first.");
      return;
    }

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) {
      toast.error("No pricing configured for this product.");
      return;
    }

    // ✅ keep localStorage in sync (same as popup)
    try {
      const newVariant: SelectedVariant = {
        key: selectedPlan,
        title: plan.title,
        price: plan.price,
        isOnSale: plan.isOnSale,
        category: categoryName,
      };
      localStorage.setItem("selectedVariant", JSON.stringify(newVariant));
      localStorage.setItem("selectedSize", String(selectedPlan));
    } catch { }

    handleStripeOrder({ title: plan.title, price: plan.price });
  };


  const categoryNameVariant = useMemo(() => {
    // ✅ fallback to selectedCategory if needed
    const lsCat = (() => {
      try { return localStorage.getItem("selectedCategory") || ""; } catch { return ""; }
    })();
    return variant?.category || product?.category || lsCat || "default";
  }, [variant?.category, product?.category]);

  const isMugsCate = categoryNameVariant === "Mugs"
  const mugPreview = useMemo(() => sessionStorage.getItem("mugImage") || "", []);

  const mock = useMemo(() => getMockupConfig(categoryNameVariant), [categoryNameVariant]);


  return (
    <Applayout>
      <Box
        sx={{
          bgcolor: "white",
          width: "100%",
          height: { md: "95vh", sm: "95vh", xs: "auto" },
          display: "flex",
          alignItems: "start",
          flexDirection: "column",
          justifyContent: "center",
          m: "auto",
        }}
      >

        <Container maxWidth="xl">
          <Typography
            sx={{
              textAlign: "start",
              fontSize: { md: "40px", sm: "30px", xs: "20px" },
              fontWeight: "bold",
            }}
          >
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIos fontSize="large" sx={{ color: "black" }} />
            </IconButton>{" "}
            Go big and upgrade your card!
          </Typography>
          <Grid container spacing={3} sx={{ height: { md: 600, sm: 600, xs: "auto" } }}>
            {/* Left Image */}
            <Grid
              size={{ md: 7, sm: 7, xs: 12 }}
              sx={{
                backgroundImage: isMugsCate ? "" : mock?.mockupSrc ? `url(${mock.mockupSrc})` : `url(${TableBgImg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: 'cover',
                borderRadius: 7,
                border: "1px solid gray",
                position: "relative",
                height: { md: 600, sm: 600, xs: 320 },
                overflow: "hidden",
              }}
            >
              {
                mugPreview ? <Box component="img" src={mugPreview} sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <>
                  {/* ✅ first slide overlay (category-wise) */}
                  {firstSlideUrl ? (
                    <Box
                      sx={{
                        position: "absolute",
                        top: mock?.overlay.top ?? "20%",
                        left: mock?.overlay.left ?? "20%",
                        width: mock?.overlay.width ?? "60%",
                        height: mock?.overlay.height ?? "60%",
                        opacity: mock?.overlay.opacity ?? 1,
                        filter: mock?.overlay.filter,
                        clipPath: mock?.overlay.clipPath,
                        WebkitClipPath: mock?.overlay.clipPath,
                        borderRadius: mock?.overlay.borderRadius ?? 0,
                        ...(mock?.overlay.sx as any),
                      }}
                    >
                      <Box
                        component="img"
                        src={firstSlideUrl || mugImageSrc}
                        alt="first slide"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: (mock?.overlay.objectFit as any) ?? "cover",
                          display: "block",
                          userSelect: "none",
                          // borderRadius: '10px',
                          pointerEvents: "none",
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(0,0,0,0.6)",
                        fontWeight: 700,
                        bgcolor: "rgba(255,255,255,0.25)", // optional
                      }}
                    >
                      No preview found
                    </Box>
                  )}</>
              }

            </Grid>


            {/* Right Side - Plans */}
            <Grid size={{ md: 5, sm: 5, xs: 12 }} sx={{ display: "flex", flexDirection: "column", gap: "25px", textAlign: "start" }}>
              <Box sx={{ p: { md: 2, sm: 2, xs: "5px" }, bgcolor: "#b7f7f4ff", borderRadius: 2 }}>
                <Typography variant="h5">🎉 We’ve saved your card design!</Typography>
              </Box>

              {/* ✅ Plans from ProductPopup logic */}
              {!plans.length ? (
                <Typography sx={{ color: "text.secondary" }}>
                  No sizes/prices configured for this product.
                </Typography>
              ) : (
                plans.map((plan) => (
                  <Box
                    key={String(plan.id)}
                    onClick={() => {
                      setSelectedPlan(plan.id);

                      // keep selectedVariant synced (so checkout + UI consistent)
                      try {
                        const newSel: SelectedVariant = {
                          key: plan.id,
                          title: plan.title,
                          price: plan.price,
                          isOnSale: plan.isOnSale,
                          category: categoryName,
                        };
                        localStorage.setItem("selectedVariant", JSON.stringify(newSel));
                        localStorage.setItem("selectedSize", String(plan.id));
                      } catch { }
                    }}
                    sx={{
                      ...isActivePay,
                      border: `3px solid ${selectedPlan === plan.id ? "#004099" : "transparent"}`,
                      cursor: "pointer",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <input
                        type="radio"
                        name="plan"
                        checked={selectedPlan === plan.id}
                        onChange={() => setSelectedPlan(plan.id)}
                        style={{ width: "30px", height: "30px" }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: { md: 900, sm: 900, xs: 700 } }}>
                          {plan.title}
                        </Typography>

                        {plan.sub ? (
                          <Typography sx={{ fontSize: 12, opacity: 0.85 }}>{plan.sub}</Typography>
                        ) : null}

                        <Typography sx={{ fontSize: { md: "auto", sm: "auto", xs: "15px" } }}>
                          £{plan.price.toFixed(2)} {plan.isOnSale ? "(Sale)" : ""}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h5">£{plan.price.toFixed(2)}</Typography>
                  </Box>
                ))
              )}

              {/* ✅ Terms */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ width: "20px", height: "20px" }}
                />
                <Typography sx={{ fontSize: "14px", color: termsAccepted ? "gray" : "#d32f2f" }}>
                  I accept the Terms & Conditions and give my consent to proceed with the order.
                </Typography>
              </Box>

              {/* Pay */}
              <LandingButton title="Add to Pay" width="100%" personal loading={loading} onClick={handlePayClick} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Applayout>
  );
};

export default Subscription;
