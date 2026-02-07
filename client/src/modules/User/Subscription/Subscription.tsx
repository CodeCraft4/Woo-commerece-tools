// Subscription.tsx (FULL UPDATED COMPONENT)
// ✅ Shows EXACT sizes for category (no hiding)
// ✅ Uses ONLY actual prices (no sale)
// ✅ Still keeps your bundle/pro/free rules the same
// ✅ Handles BOTH legacy lowercase keys (a4/us_letter/...) + uppercase keys (A4/US_LETTER/...)
// ✅ Selected plan auto-picks first available (else first item)

import { Box, Container, Grid, Typography, Chip, Button } from "@mui/material";
import { useMemo, useState, useEffect, useCallback } from "react";
import TableBgImg from "/assets/images/table.png";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { CardGiftcard, EmojiEvents } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { type SizeKey } from "../../../stores/cartStore";
import { getMockupConfig } from "../../../lib/mockup";
import { supabase } from "../../../supabase/supabase";
import { USER_ROUTES } from "../../../constant/route";
import MainLayout from "../../../layout/MainLayout";
import { COLORS } from "../../../constant/color";

// ------------------ ENV ------------------
const API_BASE = "https://diypersonalisation.com/api";
// const API_BASE = "http://localhost:5000";
const STRIPE_PK =
  "pk_test_51S5Pnw6w4VLajVLTFff76bJmNdN9UKKAZ2GKrXL41ZHlqaMxjXBjlCEly60J69hr3noxGXv6XL2Rj4Gp4yfPCjAy00j41t6ReK";
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : Promise.resolve(null);

// ------------------ Types ------------------
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
  accessplan?: string;
  accessPlan?: string;
};

type PriceTables = { actual: any; sale: any };
type SizeDef = { key: any; title: string; sub?: string };

type UserPlan = {
  plan_code: "free" | "bundle" | "pro" | string;
  isPremium: boolean;
  premium_expires_at: string | null;
  email?: string | null;
};

const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());

const getItemAccessPlan = (p: any): "free" | "bundle" | "pro" => {
  const v = lc(p?.accessplan ?? p?.accessPlan ?? p?.plan ?? p?.plan_code ?? p?.code);
  if (v === "pro" || v === "premium") return "pro";
  if (v === "bundle") return "bundle";
  return "free";
};

const normalizeItemType = (type?: string) => {
  if (!type) return "";
  const t = type.toLowerCase().trim();
  if (t === "templet") return "template";
  if (t === "templates") return "template";
  if (t === "cards") return "card";
  return t;
};

export const isProductInBundle = (
  product: { id?: string | number; type?: string } | null,
  bundleKeySet: Set<string>
): boolean => {
  if (!product?.id || !product?.type) return false;
  const normalizedType = normalizeItemType(product.type);
  const key = `${normalizedType}:${String(product.id).trim()}`;
  return bundleKeySet.has(key);
};

// ------------------ EXACT Size Config (same as ProductPopup) ------------------
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

  if (name.includes("mugs")) return [{ key: "mug_wrap_11oz", title: "228mm × 88.9mm wrap (11oz mug)" }];
  if (name.includes("coaster")) return [{ key: "coaster_95", title: "95mm × 95mm (×2 coasters)" }];

  return [
    { key: "a5", title: "A3" },
    { key: "a4", title: "A4" },
    // { key: "half_us_letter", title: "Half US Letter" },
    { key: "us_letter", title: "US Letter" },
    // { key: "us_tabloid", title: "US Tabloid (Folded half: 11 × 8.5 in)" },
  ];
};

// ------------------ UI ------------------
const isActivePay = {
  display: "flex",
  gap: "4px",
  justifyContent: "space-between",
  alignItems: "center",
  bgcolor: COLORS.seconday,
  p: "3px",
  borderRadius: 2,
  boxShadow: "3px 7px 8px #eff1f1ff",
};

// ------------------ Helpers ------------------
const toNum = (v: unknown, fallback = 0) => {
  if (v == null) return fallback;
  const s = String(v).trim();
  if (!s) return fallback;
  if (s.toUpperCase() === "EMPTY") return fallback;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

// Some rows/flows may have uppercase keys, some lowercase. Support both.
const KEY_FALLBACK: Record<string, string> = {
  A5: "a5",
  A4: "a4",
  A3: "a3",
  US_LETTER: "us_letter",
  HALF_US_LETTER: "half_us_letter",
  US_TABLOID: "us_tabloid",
  MUG_WRAP_11OZ: "mug_wrap_11oz",
  COASTER_95: "coaster_95",
};

const readActualPrice = (tables: PriceTables | null, key: any) => {
  const actual = tables?.actual ?? {};
  const raw1 = actual?.[key]; // current key
  const raw2 = actual?.[String(key).toUpperCase?.() ?? ""]; // uppercase attempt
  const raw3 = actual?.[KEY_FALLBACK[String(key).toUpperCase()] ?? ""]; // mapped lowercase
  return toNum(raw1 ?? raw2 ?? raw3, 0);
};

async function getAccessToken() {
  const s1 = await supabase.auth.getSession();
  const t1 = s1.data?.session?.access_token;
  if (t1) return t1;

  const s2 = await supabase.auth.refreshSession();
  return s2.data?.session?.access_token || "";
}

// ✅ bundle_items keys: "card:<id>" or "template:<id>"
async function fetchBundleItemKeySet(): Promise<Set<string>> {
  const { data, error } = await supabase.from("bundle_items").select("item_type,item_id");
  if (error) throw error;

  const keys = new Set<string>();
  (data ?? []).forEach((r: any) => {
    const type = r.item_type === "cards" ? "card" : r.item_type === "templets" ? "template" : r.item_type;
    keys.add(`${type}:${r.item_id}`);
  });

  return keys;
}

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<SizeKey>("a4" as SizeKey);
  const [loading, setLoading] = useState(false);

  const [variant, setVariant] = useState<SelectedVariant | null>(null);
  const [product, setProduct] = useState<SelectedProduct | null>(null);
  const [priceTables, setPriceTables] = useState<PriceTables | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  console.log(userPlan)

  const [bundleKeySet, setBundleKeySet] = useState<Set<string>>(new Set());
  const [bundleKeyLoading, setBundleKeyLoading] = useState(false);

  const location: any = useLocation() as { state?: { slides?: Record<string, string> } };
  const { state } = location;

  const { user, plan } = useAuth();
  const navigate = useNavigate();

  const slidesObj = useMemo(() => {
    if (state?.slides) return state.slides;
    try {
      return JSON.parse(localStorage.getItem("slides_backup") || "{}");
    } catch {
      return {};
    }
  }, [state?.slides]);

  const firstSlideUrl = slidesObj?.slide1 || "";

  const mugPreview = useMemo(() => {
    const slides = JSON.parse(sessionStorage.getItem("slides") || "{}");
    return slides.slide1 || "";
  }, []);

  // ✅ read local selections
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
        if (parsed?.actual) setPriceTables(parsed);
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

  // ✅ load bundle_items once
  useEffect(() => {
    (async () => {
      try {
        setBundleKeyLoading(true);
        const setKeys = await fetchBundleItemKeySet();
        setBundleKeySet(setKeys);
      } catch (e) {
        console.error(e);
      } finally {
        setBundleKeyLoading(false);
      }
    })();
  }, []);

  // ✅ category used for sizes + mockup
  const categoryName = useMemo(() => {
    const lsCat = (() => {
      try {
        return localStorage.getItem("selectedCategory") || "";
      } catch {
        return "";
      }
    })();

    return variant?.category || product?.category || lsCat || "default";
  }, [variant?.category, product?.category]);

  // ✅ EXACT sizes (no filter)
  const sizeDefs = useMemo(() => getSizeDefsForCategory(categoryName), [categoryName]);

  // ✅ Build plans from EXACT sizeDefs (no sale)
  const plans = useMemo(() => {
    return sizeDefs.map((opt) => {
      const price = readActualPrice(priceTables, opt.key);
      return {
        id: opt.key,
        title: opt.title,
        sub: opt.sub,
        price,
        disabled: price <= 0,
      };
    });
  }, [sizeDefs, priceTables]);

  // ✅ Ensure selectedPlan exists; prefer first available, else first item
  useEffect(() => {
    if (!plans.length) return;

    const exists = plans.some((p) => String(p.id) === String(selectedPlan));
    if (exists) return;

    const firstAvail = plans.find((p) => !p.disabled)?.id;
    const fallback = plans[0]?.id;
    setSelectedPlan((firstAvail ?? fallback ?? "a4") as any);
  }, [plans, selectedPlan]);

  // const isMugsCate = useMemo(
  //   () => categoryName === "Mugs" || categoryName.toLowerCase() === "mugs",
  //   [categoryName]
  // );
  
  const mock = useMemo(() => getMockupConfig(categoryName), [categoryName]);

  // ✅ load user plan
  useEffect(() => {
    (async () => {
      try {
        setPlanLoading(true);
        const token = await getAccessToken();
        if (!token) {
          setUserPlan({ plan_code: "free", isPremium: false, premium_expires_at: null });
          return;
        }

        const res = await fetch(`${API_BASE}e/plan`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setUserPlan({ plan_code: "free", isPremium: false, premium_expires_at: null });
          return;
        }

        const data = (await res.json()) as UserPlan;
        setUserPlan(data);
      } catch {
        setUserPlan({ plan_code: "free", isPremium: false, premium_expires_at: null });
      } finally {
        setPlanLoading(false);
      }
    })();
  }, []);

  const planCode = plan;

  const selectedItemAccessPlan = useMemo(() => getItemAccessPlan(product), [product]);

  const productKey = useMemo(
    () => (product?.id && product?.type ? `${product.type}:${product.id}` : ""),
    [product]
  );

  const isInBundleItems = useMemo(() => isProductInBundle(product, bundleKeySet), [product, bundleKeySet]);

  const isBundleAndMatched = planCode === "bundle" && isInBundleItems;

  // ✅ PRO-ONLY CARD RULE (keep as-is)
  const isProUser = planCode === "pro";
  const isProOnlyCard = selectedItemAccessPlan === "pro";
  const proOnlyLocked = isProOnlyCard && !isProUser;

  const requiresPayment = useMemo(() => {
    if (planLoading || bundleKeyLoading) return true;

    if (planCode === "pro") return false;

    if (planCode === "bundle") return !isInBundleItems;

    return true;
  }, [planCode, planLoading, bundleKeyLoading, isInBundleItems]);

  const getSlidesPayload = () => {
    if (slidesObj && Object.keys(slidesObj).length) return slidesObj;
    try {
      const raw = sessionStorage.getItem("slides") || localStorage.getItem("slides_backup") || "{}";
      return JSON.parse(raw);
    } catch {
      return slidesObj;
    }
  };

  const syncLocalSelection = (p: { id: any; title: string; price: number }) => {
    try {
      const newVariant: SelectedVariant = {
        key: p.id,
        title: p.title,
        price: p.price,
        isOnSale: false,
        category: categoryName,
      } as any;

      localStorage.setItem("selectedVariant", JSON.stringify(newVariant));
      localStorage.setItem("selectedSize", String(p.id));
      localStorage.setItem("selectedCategory", String(categoryName));
    } catch { }
  };

  const startOneTimeStripeCheckout = async (p: { title: string; price: number }) => {
    setLoading(true);
    try {
      if (!STRIPE_PK) throw new Error("Stripe key missing in env");
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not available");

      const successUrl = `${window.location.origin}${location.pathname}?paid=1&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}${location.pathname}`;

      const res = await fetch(`${API_BASE}/checkout/one-time/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: p.title,
          price: p.price,
          user: {
            email: user?.email,
            name: user?.user_metadata?.full_name || "User",
            id: user?.id,
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            variantKey: selectedPlan,
            category: categoryName,
            accessplan: selectedItemAccessPlan,
            productKey,
          },
        }),
      });

      if (!res.ok) throw new Error("checkout failed");
      const { id } = await res.json();

      toast.success("Redirecting to payment...");
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (e: any) {
      toast.error(e?.message || "Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  const sendPdfDirectForSubscription = useCallback(
    async (opts?: { paid?: boolean; sessionId?: string }) => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("Login session not found");

        const slides = getSlidesPayload();
        const res = await fetch(`${API_BASE}/pdf/send-subscription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            slides,
            cardSize: localStorage.getItem("selectedSize") || selectedPlan,
            category: categoryName,
            accessplan: selectedItemAccessPlan,

            inBundleItems: isInBundleItems,
            productKey,
            userPlan: planCode,

            paid: Boolean(opts?.paid),
            payment_session_id: opts?.sessionId ?? null,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `Request failed (HTTP ${res.status})`);
        }

        await res.json();
        toast.success("PDF generated & emailed to you!");
      } catch (e: any) {
        toast.error(e?.message || "Could not generate PDF");
      } finally {
        setLoading(false);
      }
    },
    [categoryName, selectedItemAccessPlan, isInBundleItems, productKey, getSlidesPayload, selectedPlan, planCode]
  );

  // ✅ Stripe return handler (same)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const paid = sp.get("paid") === "1";
    const sessionId = sp.get("session_id") || "";
    if (!paid || !sessionId) return;

    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const verifyRes = await fetch(`${API_BASE}/checkout/one-time/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
          });

          if (!verifyRes.ok) {
            const err = await verifyRes.json().catch(() => ({}));
            throw new Error(err?.error || "Payment verification failed");
          }
        }

        await sendPdfDirectForSubscription({ paid: true, sessionId });
        navigate(location.pathname, { replace: true, state });
      } catch (e: any) {
        toast.error(e?.message || "Payment done but PDF couldn't be generated");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.pathname, navigate, sendPdfDirectForSubscription]);

  const handlePayClick = async () => {
    if (!termsAccepted) {
      toast.error("Please accept Terms & Conditions first.");
      return;
    }

    if (proOnlyLocked) {
      toast.error("This card is only for Pro users. Please upgrade to Pro.");
      navigate(USER_ROUTES.PREMIUM_PLANS);
      return;
    }

    if (planLoading || bundleKeyLoading) {
      toast.error("Please wait, loading your plan...");
      return;
    }

    // ✅ direct
    if (!requiresPayment) {
      await sendPdfDirectForSubscription();
      return;
    }

    const picked = plans.find((p) => String(p.id) === String(selectedPlan));
    if (!picked || picked.disabled) {
      toast.error("No pricing configured for this product.");
      return;
    }

    syncLocalSelection({ id: picked.id, title: picked.title, price: picked.price });
    await startOneTimeStripeCheckout({ title: picked.title, price: picked.price });
  };

  // ✅ Icons
  const showTrophyIcon = selectedItemAccessPlan === "pro";
  const showGiftIcon =
    !showTrophyIcon && selectedItemAccessPlan === "bundle" && planCode === "bundle" && isInBundleItems;

  // const productName =
  //   product?.title ||
  //   product?.category ||
  //   (() => {
  //     try {
  //       const raw = localStorage.getItem("selectedProduct");
  //       if (!raw) return "product";
  //       const p = JSON.parse(raw);
  //       return p?.title || p?.category || "product";
  //     } catch {
  //       return "product";
  //     }
  //   })();

  return (
    <MainLayout>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "start",
          flexDirection: "column",
          justifyContent: "center",
          mt: { md: 4, sm: 3, xs: 2 },
          mb: { md: 4, sm: 3, xs: 2 },

        }}
      >
        <Container maxWidth="xl">
          <Typography
            sx={{
              textAlign: "start",
              fontSize: { md: "40px", sm: "30px", xs: "20px" },
              // fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexWrap: "wrap",
            }}
          >
            Please select your {product?.category} print size!
            {showTrophyIcon ? (
              <Chip icon={<EmojiEvents />} label="Pro" color="warning" size="small" sx={{ fontWeight: 900 }} />
            ) : null}

            {showGiftIcon ? (
              <Chip icon={<CardGiftcard />} label="Bundle" color="success" size="small" sx={{ fontWeight: 900 }} />
            ) : null}
          </Typography>

          {/* Alerts */}
          <Box sx={{ mt: 1, mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {isBundleAndMatched && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.green, borderRadius: 2 }}>
                🎁 <b>Bundle matched!</b> This item is included in your bundle. You can generate your PDF without payment.
              </Box>
            )}

            {!isBundleAndMatched && planCode === "bundle" && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.green, borderRadius: 2 }}>
                This product is not included in your bundle → payment required.
              </Box>
            )}

            {planCode === "pro" && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.green, borderRadius: 2 }}>
                🏆 <b>Pro user</b>: PDF generation included ✅
              </Box>
            )}

            {planCode === "free" && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.green, borderRadius: 2 }}>
                🆓 <b>Free user</b>: payment required to generate PDF.
              </Box>
            )}

            {mugPreview && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.black, borderRadius: 2,color:COLORS.white }}>
                📒 <b>MUGS</b>: For mugs preview is flipped in the pdf
              </Box>
            )}
          </Box>

          <Grid container spacing={3} sx={{ height: { md: 600, sm: 600, xs: "auto" } }}>
            {/* Left Preview */}
            <Grid
              size={{ md: 7, sm: 7, xs: 12 }}
              sx={{
                backgroundImage: mock?.mockupSrc ? `url(${mock.mockupSrc})` : `url(${TableBgImg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: 7,
                border: "1px solid gray",
                position: "relative",
                height: { md: mugPreview ? 350 : 600, sm: mugPreview ? 350 : 600, xs: 320 },
                overflow: "hidden",
              }}
            >
              {mugPreview ? (
                <Box component="img" src={mugPreview} sx={{ width: "100%", height: "100%", objectFit: "fill" }} />
              ) : firstSlideUrl ? (
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
                    src={firstSlideUrl || mugPreview || ""}
                    alt="first slide"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: (mock?.overlay.objectFit as any) ?? "cover",
                      display: "block",
                      userSelect: "none",
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
                    bgcolor: "rgba(255,255,255,0.25)",
                  }}
                >
                  No preview found
                </Box>
              )}
            </Grid>

            {/* Right - Plans */}
            <Grid
              size={{ md: 5, sm: 5, xs: 12 }}
              sx={{ display: "flex", flexDirection: "column", gap: "25px", textAlign: "start" }}
            >
              <Box sx={{ p: { md: 2, sm: 2, xs: "5px" }, bgcolor: COLORS.primary, borderRadius: 2 }}>
                <Typography variant="h5">🎉 We’ve saved your {product?.category} design!</Typography>

                <Typography sx={{ fontSize: 14, mt: 1, opacity: 0.8 }}>
                  {planLoading || bundleKeyLoading
                    ? "Checking your plan..."
                    : proOnlyLocked
                      ? "This card is Pro-only. Please upgrade to Pro to generate PDF."
                      : isBundleAndMatched
                        ? "Bundle matched by ID. You can generate your PDF without payment."
                        : planCode === "pro"
                          ? "Pro user: PDF generation included."
                          : planCode === "bundle"
                            ? "Bundle user: payment required for this item."
                            : "Free users need to complete payment to receive PDF."}
                </Typography>
              </Box>

              {!plans.length ? (
                <Typography sx={{ color: "text.secondary" }}>No sizes configured for this category.</Typography>
              ) : (
                plans.map((p) => {
                  const isSelected = String(selectedPlan) === String(p.id);

                  return (
                    <Box
                      key={String(p.id)}
                      onClick={() => {
                        if (p.disabled) return;
                        setSelectedPlan(p.id as any);
                        syncLocalSelection({ id: p.id, title: p.title, price: p.price });
                      }}
                      sx={{
                        ...isActivePay,
                        border: `3px solid ${isSelected ? "#004099" : "transparent"}`,
                        cursor: p.disabled ? "not-allowed" : "pointer",
                        opacity: proOnlyLocked ? 0.7 : p.disabled ? 0.55 : 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <input
                          type="radio"
                          name="plan"
                          disabled={p.disabled}
                          checked={isSelected}
                          onChange={() => {
                            if (p.disabled) return;
                            setSelectedPlan(p.id as any);
                          }}
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: { md: 900, sm: 900, xs: 700 } }}>{p.title}</Typography>
                          {p.sub ? <Typography sx={{ fontSize: 12, opacity: 0.85 }}>{p.sub}</Typography> : null}

                          {p.disabled ? (
                            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>Not available</Typography>
                          ) : proOnlyLocked ? (
                            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>Pro-only</Typography>
                          ) : requiresPayment ? (
                            <Typography sx={{ fontSize: { md: "auto", sm: "auto", xs: "15px" } }}>
                              £{p.price.toFixed(2)}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: { md: "auto", sm: "auto", xs: "15px" }, fontWeight: 900 }}>
                              Included
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {p.disabled ? (
                        <Typography variant="h5">—</Typography>
                      ) : proOnlyLocked ? (
                        <Typography variant="h5">—</Typography>
                      ) : requiresPayment ? (
                        <Typography variant="h5">£{p.price.toFixed(2)}</Typography>
                      ) : (
                        <Typography variant="h5">£0</Typography>
                      )}
                    </Box>
                  );
                })
              )}

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

              <Button
                fullWidth
                onClick={handlePayClick}
                sx={{
                  borderRadius: "8px",
                  py: 1.5,
                  fontSize: 20,
                  textTransform: "none",
                  backgroundColor: COLORS.primary,
                  color: COLORS.black,
                  "&:hover": {
                    backgroundColor: COLORS.seconday,
                    opacity: 0.9,
                  },
                }}
              >
                {planLoading || bundleKeyLoading || loading
                  ? "Loading..."
                  : proOnlyLocked
                    ? "Go to Premium Plans"
                    : requiresPayment
                      ? "Pay & Get PDF"
                      : "Generate PDF"}
              </Button>

              {planCode === "pro" ? null : (
                <LandingButton
                  title={"Want unlimited? Upgrade to Bundle/Pro"}
                  variant="outlined"
                  personal
                  width="100%"
                  onClick={() => navigate(USER_ROUTES.PREMIUM_PLANS)}
                />
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default Subscription;
