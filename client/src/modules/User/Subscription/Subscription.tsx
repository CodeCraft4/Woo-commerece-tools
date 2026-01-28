import { Box, Container, Grid, IconButton, Typography, Alert, Chip } from "@mui/material";
import Applayout from "../../../layout/Applayout";
import { useMemo, useState, useEffect, useCallback } from "react";
import TableBgImg from "/assets/images/table.png";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { ArrowBackIos, CardGiftcard, EmojiEvents } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { type SizeKey } from "../../../stores/cartStore";
import { pickPrice } from "../../../lib/pricing";
import { getMockupConfig } from "../../../lib/mockup";
import { supabase } from "../../../supabase/supabase";
import { USER_ROUTES } from "../../../constant/route";

// ------------------ ENV ------------------
// const API_BASE = "http://localhost:5000";
const API_BASE = "https://diypersonalisation.com/api";
const STRIPE_PK =
  "pk_test_51S5Pnw6w4VLajVLTFff76bJmNdN9UKKAZ2GKrXL41ZHlqaMxjXBjlCEly60J69hr3noxGXv6XL2Rj4Gp4yfPCjAy00j41t6ReK";
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : Promise.resolve(null);

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

  subCategory?: string;
  subSubCategory?: string;
  subcategory?: string;
  subsubcategory?: string;
};

type PriceTables = { actual: any; sale: any };
type SizeDef = { key: any; title: string; sub?: string };

type UserPlan = {
  plan_code: "free" | "bundle" | "pro" | string;
  isPremium: boolean;
  premium_expires_at: string | null;
  email?: string | null;

  bundle_main_categories?: string[] | null;
  bundle_sub_categories?: string[] | null;
  bundle_sub_sub_categories?: string[] | null;
};

const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());

const getItemAccessPlan = (p: any): "free" | "bundle" | "pro" => {
  const v = lc(p?.accessplan ?? p?.accessPlan ?? p?.plan ?? p?.plan_code ?? p?.code);
  if (v === "pro" || v === "premium") return "pro";
  if (v === "bundle") return "bundle";
  return "free";
};

const hasValidPrice = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

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

  if (name.includes("mug")) return [{ key: "mug_wrap_11oz", title: "228mm × 88.9mm wrap (11oz mug)" }];
  if (name.includes("coaster")) return [{ key: "coaster_95", title: "95mm × 95mm (×2 coasters)" }];

  return [
    { key: "a5", title: "A5" },
    { key: "a4", title: "A4" },
    { key: "half_us_letter", title: "Half US Letter" },
    { key: "us_letter", title: "US Letter" },
    { key: "us_tabloid", title: "US Tabloid (Folded half: 11 × 8.5 in)" },
  ];
};

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

async function getAccessToken() {
  const s1 = await supabase.auth.getSession();
  const t1 = s1.data?.session?.access_token;
  if (t1) return t1;

  const s2 = await supabase.auth.refreshSession();
  return s2.data?.session?.access_token || "";
}

function readLocalJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ✅ bundle_items keys: "card:<id>" or "template:<id>"
async function fetchBundleItemKeySet(): Promise<Set<string>> {
  const { data, error } = await supabase.from("bundle_items").select("item_type,item_id");
  if (error) throw error;

  const keys = new Set<string>();
  (data ?? []).forEach((r: any) => {
    const t = lc(r.item_type);
    const id = String(r.item_id);

    const type = t === "cards" ? "card" : t === "templets" ? "template" : t;
    if (type === "card" || type === "template") keys.add(`${type}:${id}`);
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

  // ✅ bundle_items set
  const [bundleKeySet, setBundleKeySet] = useState<Set<string>>(new Set());
  const [bundleKeyLoading, setBundleKeyLoading] = useState(false);

  // ✅ get both state and search (Stripe return)
  const location: any = useLocation() as { state?: { slides?: Record<string, string> } };
  const { state } = location;

  const { user } = useAuth();
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
  const mugPreview = useMemo(() => sessionStorage.getItem("mugImage") || "", []);
  const mugImageSrc = useMemo(() => sessionStorage.getItem("mugImage"), []);

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
    } catch {}

    try {
      const rawP = localStorage.getItem("selectedPrices");
      if (rawP) {
        const parsed = JSON.parse(rawP) as PriceTables;
        if (parsed?.actual && parsed?.sale) setPriceTables(parsed);
      }
    } catch {}

    try {
      const rawProd = localStorage.getItem("selectedProduct");
      if (rawProd) {
        const parsed = JSON.parse(rawProd) as SelectedProduct;
        setProduct(parsed);
      }
    } catch {}
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

  // ✅ category/sub/subsub from local+product
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

  const subCategoryName = useMemo(() => {
    const ls = (() => {
      try {
        return localStorage.getItem("selectedSubCategory") || "";
      } catch {
        return "";
      }
    })();
    return product?.subCategory || product?.subcategory || (product as any)?.sub_category || ls || "";
  }, [product]);

  const subSubCategoryName = useMemo(() => {
    const ls = (() => {
      try {
        return localStorage.getItem("selectedSubSubCategory") || "";
      } catch {
        return "";
      }
    })();
    return product?.subSubCategory || product?.subsubcategory || (product as any)?.sub_sub_category || ls || "";
  }, [product]);

  const sizeDefs = useMemo(() => getSizeDefsForCategory(categoryName), [categoryName]);

  const sizeOptions = useMemo(() => {
    const actual = priceTables?.actual ?? {};
    return sizeDefs.filter((d) => hasValidPrice(actual[d.key]));
  }, [sizeDefs, priceTables?.actual]);

  useEffect(() => {
    if (!sizeOptions.length) return;
    const exists = sizeOptions.some((x) => x.key === selectedPlan);
    if (!exists) setSelectedPlan(sizeOptions[0].key);
  }, [sizeOptions, selectedPlan]);

  const useSaleForSelected = useMemo(() => {
    if (variant?.isOnSale === true) return true;
    if (variant?.isOnSale === false) return false;
    const v = priceTables?.sale?.[selectedPlan];
    return Number.isFinite(Number(v)) && Number(v) > 0;
  }, [variant?.isOnSale, priceTables?.sale, selectedPlan]);

  const plans = useMemo(() => {
    return sizeOptions.map((opt) => {
      const p = pickPrice(priceTables?.actual ?? {}, useSaleForSelected ? priceTables?.sale ?? {} : undefined, opt.key);
      return {
        id: opt.key,
        title: opt.title,
        sub: opt.sub,
        price: Number(p.price) || 0,
        isOnSale: p.isOnSale,
      };
    });
  }, [sizeOptions, priceTables, useSaleForSelected]);

  const isMugsCate = useMemo(
    () => categoryName === "Mugs" || categoryName.toLowerCase() === "mugs",
    [categoryName],
  );
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

        const res = await fetch(`${API_BASE}/me/plan`, {
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

  const planCode = useMemo(() => lc(userPlan?.plan_code || "free"), [userPlan?.plan_code]);

  // ✅ build bundle allow lists (API + local fallback)
  const bundleAllow = useMemo(() => {
    const apiAllow = {
      main: (userPlan?.bundle_main_categories ?? []) as string[],
      sub: (userPlan?.bundle_sub_categories ?? []) as string[],
      subsub: (userPlan?.bundle_sub_sub_categories ?? []) as string[],
    };

    const local = readLocalJson<{ main?: string[]; sub?: string[]; subsub?: string[] }>("bundle_access");

    const main = (apiAllow.main?.length ? apiAllow.main : local?.main || []).map((x) => lc(x));
    const sub = (apiAllow.sub?.length ? apiAllow.sub : local?.sub || []).map((x) => lc(x));
    const subsub = (apiAllow.subsub?.length ? apiAllow.subsub : local?.subsub || []).map((x) => lc(x));

    return { main, sub, subsub };
  }, [userPlan]);

  // ✅ category-based bundle eligibility
  const isBundleEligibleByCategory = useMemo(() => {
    if (planCode !== "bundle") return false;

    const m = lc(categoryName);
    const s = lc(subCategoryName);
    const ss = lc(subSubCategoryName);

    if (!bundleAllow.main.length) return false;
    if (!bundleAllow.main.includes(m)) return false;

    if (bundleAllow.sub.length && s) {
      if (!bundleAllow.sub.includes(s)) return false;
    }
    if (bundleAllow.subsub.length && ss) {
      if (!bundleAllow.subsub.includes(ss)) return false;
    }

    return true;
  }, [planCode, categoryName, subCategoryName, subSubCategoryName, bundleAllow]);

  const selectedItemAccessPlan = useMemo(() => getItemAccessPlan(product), [product]);

  // ✅ ID match key
  const productKey = useMemo(() => {
    const id = product?.id == null ? "" : String(product.id);
    const type = (product?.type ?? "card") as "card" | "template";
    if (!id) return "";
    return `${type}:${id}`;
  }, [product?.id, product?.type]);

  const isInBundleItems = useMemo(() => {
    if (!productKey) return false;
    return bundleKeySet.has(productKey);
  }, [bundleKeySet, productKey]);

  // ✅ FINAL bundle eligibility = ID OR CATEGORY
  const isBundleEligible = useMemo(() => {
    if (planCode !== "bundle") return false;
    return isInBundleItems || isBundleEligibleByCategory;
  }, [planCode, isInBundleItems, isBundleEligibleByCategory]);

  // ✅ PRO-ONLY CARD RULE
  const isProUser = planCode === "pro";
  const isProOnlyCard = selectedItemAccessPlan === "pro";
  const proOnlyLocked = isProOnlyCard && !isProUser;

  // ✅ payment needed rule
  const requiresPayment = useMemo(() => {
    if (planLoading || bundleKeyLoading) return true;

    // pro-only card: non-pro user can't pay; must upgrade
    if (proOnlyLocked) return false;

    if (planCode === "pro") return false;

    if (planCode === "bundle") {
      // ✅ OR eligibility
      return !isBundleEligible;
    }

    return true; // free
  }, [planLoading, bundleKeyLoading, planCode, proOnlyLocked, isBundleEligible]);

  const getSlidesPayload = () => {
    if (slidesObj && Object.keys(slidesObj).length) return slidesObj;
    try {
      const raw = sessionStorage.getItem("slides") || localStorage.getItem("slides_backup") || "{}";
      return JSON.parse(raw);
    } catch {
      return slidesObj;
    }
  };

  const syncLocalSelection = (plan: { id: any; title: string; price: number; isOnSale?: boolean }) => {
    try {
      const newVariant: SelectedVariant = {
        key: plan.id,
        title: plan.title,
        price: plan.price,
        isOnSale: plan.isOnSale,
        category: categoryName,
      };
      localStorage.setItem("selectedVariant", JSON.stringify(newVariant));
      localStorage.setItem("selectedSize", String(plan.id));
      localStorage.setItem("selectedCategory", String(categoryName));
    } catch {}
  };

  const startOneTimeStripeCheckout = async (plan: { title: string; price: number }) => {
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
          title: plan.title,
          price: plan.price,
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
            subCategory: subCategoryName,
            subSubCategory: subSubCategoryName,
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

  // ✅ generate PDF
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
            subCategory: subCategoryName,
            subSubCategory: subSubCategoryName,
            accessplan: selectedItemAccessPlan,

            // ✅ final eligibility
            bundleEligible: isBundleEligible,
            inBundleItems: isInBundleItems,
            categoryEligible: isBundleEligibleByCategory,
            productKey,

            paid: Boolean(opts?.paid),
            payment_session_id: opts?.sessionId ?? null,
            userPlan: planCode,
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
    [
      categoryName,
      subCategoryName,
      subSubCategoryName,
      selectedItemAccessPlan,
      isBundleEligible,
      isInBundleItems,
      isBundleEligibleByCategory,
      productKey,
      getSlidesPayload,
      selectedPlan,
      planCode,
    ],
  );

  // ✅ Stripe return handler
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

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) {
      toast.error("No pricing configured for this product.");
      return;
    }

    syncLocalSelection(plan);

    if (planLoading || bundleKeyLoading) {
      toast.error("Please wait, loading your plan...");
      return;
    }

    if (!requiresPayment) {
      await sendPdfDirectForSubscription();
      return;
    }

    await startOneTimeStripeCheckout({ title: plan.title, price: plan.price });
  };

  // ✅ Icons
  const showTrophyIcon = selectedItemAccessPlan === "pro";
  const showGiftIcon = !showTrophyIcon && selectedItemAccessPlan === "bundle" && isBundleEligible;

  // ✅ Messages
  const showHurryBundleMsg = planCode === "bundle" && selectedItemAccessPlan === "bundle" && isBundleEligible;

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
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexWrap: "wrap",
            }}
          >
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIos fontSize="large" sx={{ color: "black" }} />
            </IconButton>
            Go big and upgrade your card!

            {showTrophyIcon ? (
              <Chip icon={<EmojiEvents />} label="Pro" color="warning" size="small" sx={{ fontWeight: 900 }} />
            ) : null}

            {showGiftIcon ? (
              <Chip icon={<CardGiftcard />} label="Bundle" color="success" size="small" sx={{ fontWeight: 900 }} />
            ) : null}
          </Typography>

          {/* Alerts */}
          <Box sx={{ mt: 1, mb: 2, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            {proOnlyLocked ? (
              <Alert severity="warning" sx={{ py: 0.2 }}>
                This card is <b>Pro-only</b>. Please upgrade to Pro to generate PDF.
              </Alert>
            ) : null}

            {!proOnlyLocked && planCode === "pro" ? (
              <Alert severity="success" sx={{ py: 0.2 }}>
                You can generate your pdf easily without payment ✅
              </Alert>
            ) : null}

            {!proOnlyLocked && showHurryBundleMsg ? (
              <Alert severity="success" sx={{ py: 0.2 }}>
                Hurry🎉 This card is insert in the bundle — your plan <b>Bundle</b> can generate your PDF easily ✅
              </Alert>
            ) : null}

            {!proOnlyLocked && planCode === "bundle" && selectedItemAccessPlan === "bundle" && !isBundleEligible ? (
              <Alert severity="warning" sx={{ py: 0.2 }}>
                Not included in your Bundle (ID match & category match both failed) → payment required.
              </Alert>
            ) : null}

            {!proOnlyLocked && planCode === "free" ? (
              <Alert severity="info" sx={{ py: 0.2 }}>
                Free user: payment required to generate PDF.
              </Alert>
            ) : null}
          </Box>

          <Grid container spacing={3} sx={{ height: { md: 600, sm: 600, xs: "auto" } }}>
            {/* Left Preview */}
            <Grid
              size={{ md: 7, sm: 7, xs: 12 }}
              sx={{
                backgroundImage: isMugsCate ? "" : mock?.mockupSrc ? `url(${mock.mockupSrc})` : `url(${TableBgImg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: 7,
                border: "1px solid gray",
                position: "relative",
                height: { md: 600, sm: 600, xs: 320 },
                overflow: "hidden",
              }}
            >
              {mugPreview ? (
                <Box component="img" src={mugPreview} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                    src={firstSlideUrl || mugImageSrc || ""}
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
              <Box sx={{ p: { md: 2, sm: 2, xs: "5px" }, bgcolor: "#b7f7f4ff", borderRadius: 2 }}>
                <Typography variant="h5">🎉 We’ve saved your card design!</Typography>

                <Typography sx={{ fontSize: 14, mt: 1, opacity: 0.8 }}>
                  {planLoading || bundleKeyLoading
                    ? "Checking your plan..."
                    : proOnlyLocked
                    ? "This card is Pro-only. Please upgrade to Pro to generate PDF."
                    : planCode === "pro"
                    ? "Pro user: PDF generation included."
                    : planCode === "bundle"
                    ? isBundleEligible
                      ? "Bundle matched (ID or Categories): PDF included for this item."
                      : "Bundle user: payment required (not eligible)."
                    : "Free users need to complete payment to receive PDF."}
                </Typography>
              </Box>

              {!plans.length ? (
                <Typography sx={{ color: "text.secondary" }}>No sizes/prices configured for this product.</Typography>
              ) : (
                plans.map((plan) => (
                  <Box
                    key={String(plan.id)}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      syncLocalSelection(plan);
                    }}
                    sx={{
                      ...isActivePay,
                      border: `3px solid ${selectedPlan === plan.id ? "#004099" : "transparent"}`,
                      cursor: "pointer",
                      opacity: proOnlyLocked ? 0.7 : 1,
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
                        <Typography sx={{ fontWeight: { md: 900, sm: 900, xs: 700 } }}>{plan.title}</Typography>
                        {plan.sub ? <Typography sx={{ fontSize: 12, opacity: 0.85 }}>{plan.sub}</Typography> : null}

                        {proOnlyLocked ? (
                          <Typography sx={{ fontSize: 13, fontWeight: 800 }}>Pro-only</Typography>
                        ) : requiresPayment ? (
                          <Typography sx={{ fontSize: { md: "auto", sm: "auto", xs: "15px" } }}>
                            £{plan.price.toFixed(2)} {plan.isOnSale ? "(Sale)" : ""}
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: { md: "auto", sm: "auto", xs: "15px" }, fontWeight: 900 }}>
                            Included
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {proOnlyLocked ? (
                      <Typography variant="h5">—</Typography>
                    ) : requiresPayment ? (
                      <Typography variant="h5">£{plan.price.toFixed(2)}</Typography>
                    ) : (
                      <Typography variant="h5">£0</Typography>
                    )}
                  </Box>
                ))
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

              <LandingButton
                title={
                  planLoading || bundleKeyLoading
                    ? "Loading..."
                    : proOnlyLocked
                    ? "Go to Premium Plans"
                    : requiresPayment
                    ? "Pay & Get PDF"
                    : "Generate PDF"
                }
                width="100%"
                personal
                loading={loading || planLoading || bundleKeyLoading}
                onClick={proOnlyLocked ? () => navigate(USER_ROUTES.PREMIUM_PLANS) : handlePayClick}
              />

              {!planLoading && planCode === "free" ? (
                <LandingButton
                  title={"Want unlimited? Upgrade to Bundle/Pro"}
                  variant="outlined"
                  personal
                  width="100%"
                  onClick={() => navigate(USER_ROUTES.PREMIUM_PLANS)}
                />
              ) : null}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Applayout>
  );
};

export default Subscription;
