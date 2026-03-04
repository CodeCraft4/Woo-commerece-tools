import { Box, Container, Grid, Typography, Chip, Button } from "@mui/material";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import TableBgImg from "/assets/images/table.png";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { CardGiftcard, EmojiEvents } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { type SizeKey } from "../../../stores/cartStore";
import { getMockupConfig } from "../../../lib/mockup";
import { toJpeg, toPng } from "html-to-image";
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
import { supabase } from "../../../supabase/supabase";
import { USER_ROUTES } from "../../../constant/route";
import MainLayout from "../../../layout/MainLayout";
import { COLORS } from "../../../constant/color";
import { removeWhiteBg } from "../../../lib/lib";
import { loadSlidesFromIdb, saveSlidesToIdb } from "../../../lib/idbSlides";
import { API_BASE } from "../../../lib/apiBase";

// ------------------ ENV ------------------
const STRIPE_PK =
  import.meta.env.VITE_STRIPE_PK ||
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

type RawSlide = { id: number; label?: string; elements: any[] };
type PreviewConfig = { mmWidth?: number; mmHeight?: number };

type PriceTables = { actual: any; sale: any };
type SizeDef = { key: any; title: string; sub?: string };

type UserPlan = {
  plan_code: "free" | "bundle" | "pro" | string;
  isPremium: boolean;
  premium_expires_at: string | null;
  email?: string | null;
};

const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());

const singularizeCategory = (name?: string) => {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower.endsWith("ss")) return trimmed;
  if (lower.endsWith("s")) return trimmed.slice(0, -1);
  return trimmed;
};

const buildPdfFileName = (category?: string, ext: "pdf" | "png" = "pdf") => {
  const label = singularizeCategory(category) || "design";
  const clean = label
    .replace(/[^a-z0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return `personalised ${clean || "design"} ${ext}`;
};

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

  if (name.includes("business card")) {
    return [
      { key: "a4", title: "A4" },
      { key: "us_letter", title: "US Letter" },
    ];
  }

  if (name.includes("business leaflet")) {
    return [
      { key: "a5", title: "A5", sub: "Prints 2 per A4 sheet" },
      { key: "a4", title: "A4", sub: "Prints 1 per A4 sheet" },
      { key: "half_us_letter", title: "Half US Letter", sub: "Prints 2 per US Letter sheet" },
      { key: "us_letter", title: "US Letter", sub: "Prints 1 per US Letter sheet" },
    ];
  }

  if (name.includes("candle")) {
    return [
      { key: "a4", title: "A4", sub: "6 labels per A4 sheet (70mm × 70mm)" },
      { key: "us_tabloid", title: "US Tabloid", sub: "6 labels per sheet (70mm × 70mm)" },
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
      { key: "a5", title: "A5", sub: "Prints 2 per A4 landscape sheet" },
      { key: "a4", title: "A4", sub: "Prints 1 per A4 portrait sheet" },
      { key: "half_us_letter", title: "Half US Letter", sub: "Prints 2 per US Letter landscape sheet" },
      { key: "us_letter", title: "US Letter", sub: "Prints 1 per US Letter portrait sheet" },
    ];
  }

  if (name.includes("mug")) return [{ key: "mug_wrap_11oz", title: "228mm × 88.9mm wrap (11oz mug)" }];
  if (name.includes("coaster"))
    return [{ key: "coaster_95", title: "89mm × 89mm (6 per sheet: 2 × 3)" }];

  return [
    { key: "a5", title: "A3" },
    { key: "a4", title: "A4" },
    // { key: "half_us_letter", title: "Half US Letter" },
    { key: "us_letter", title: "US Letter" },
    { key: "us_tabloid", title: "US Tabloid (11 × 17 in)" },
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

  const location: any = useLocation() as { state?: { slides?: Record<string, string>; previewOnly?: boolean } };
  const { state } = location;

  const { user, plan } = useAuth();
  const navigate = useNavigate();

  const [slidesObj, setSlidesObj] = useState<Record<string, string>>({});
  const [rawSlides, setRawSlides] = useState<RawSlide[]>([]);
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig | null>(null);
  const isPreviewOnly = useMemo(() => {
    if (state?.previewOnly) {
      try {
        if (sessionStorage.getItem("slides_preview_only") === "0") return false;
      } catch {}
      return true;
    }
    try {
      return sessionStorage.getItem("slides_preview_only") === "1";
    } catch {
      return false;
    }
  }, [state?.previewOnly]);

  useEffect(() => {
    let mounted = true;

    const loadSlides = async () => {
      try {
        const globalSlides = (globalThis as any).__slidesCache;
        if (globalSlides && Object.keys(globalSlides).length) {
          if (mounted) setSlidesObj(globalSlides);
          return;
        }
      } catch {}

      if (state?.slides) {
        if (mounted) setSlidesObj(state.slides);
        return;
      }

      try {
        const fromIdb = await loadSlidesFromIdb();
        if (mounted && fromIdb) {
          setSlidesObj(fromIdb);
          return;
        }
      } catch { }

      try {
        const fromSession = JSON.parse(sessionStorage.getItem("slides") || "{}");
        if (mounted && fromSession && Object.keys(fromSession).length) {
          setSlidesObj(fromSession);
          return;
        }
      } catch { }

      try {
        const fromLocal = JSON.parse(localStorage.getItem("slides_backup") || "{}");
        if (mounted) setSlidesObj(fromLocal || {});
      } catch {
        if (mounted) setSlidesObj({});
      }
    };

    loadSlides();
    return () => {
      mounted = false;
    };
  }, [state?.slides]);

  useEffect(() => {
    try {
      const cachedSlides = (globalThis as any).__rawSlidesCache;
      if (Array.isArray(cachedSlides) && cachedSlides.length) {
        setRawSlides(cachedSlides);
      } else {
        const storedSlides = sessionStorage.getItem("templ_preview_slides");
        if (storedSlides) setRawSlides(JSON.parse(storedSlides));
      }
    } catch {}

    try {
      const cachedCfg = (globalThis as any).__previewConfigCache;
      if (cachedCfg && typeof cachedCfg === "object") {
        setPreviewConfig(cachedCfg);
      } else {
        const storedCfg = sessionStorage.getItem("templ_preview_config");
        if (storedCfg) setPreviewConfig(JSON.parse(storedCfg));
      }
    } catch {}
  }, []);

  const firstSlideUrl = slidesObj?.slide1 || "";
  const captureWidth = Math.max(1, Math.round(Number(previewConfig?.mmWidth) || 800));
  const captureHeight = Math.max(1, Math.round(Number(previewConfig?.mmHeight) || 600));

  const slideNodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const setSlideNodeRef = (i: number) => (el: HTMLDivElement | null) => {
    slideNodeRefs.current[i] = el;
  };

  const renderSlide = useCallback((slide?: RawSlide) => {
    if (!slide) return null;
    const ordered = [...(slide.elements || [])].sort((a, b) => {
      const zA = Number(a?.zIndex ?? 1) + (a?.type === "text" ? 100000 : 0);
      const zB = Number(b?.zIndex ?? 1) + (b?.type === "text" ? 100000 : 0);
      return zA - zB;
    });
    return (
      <Box sx={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        {ordered.map((el: any) => {
          const baseStyle: any = {
            position: "absolute",
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
            zIndex: el.zIndex ?? 1,
          };

          if (el.type === "image") {
            return (
              <Box
                key={el.id}
                component="img"
                src={el.src}
                alt=""
                sx={{ ...baseStyle, objectFit: "cover", display: "block" }}
              />
            );
          }

          if (el.type === "sticker") {
            return (
              <Box
                key={el.id}
                component="img"
                src={el.src}
                alt=""
                sx={{ ...baseStyle, objectFit: "contain", display: "block" }}
              />
            );
          }

          if (el.type === "text") {
            const align = el.align ?? "center";
            const justify =
              align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
            return (
              <Box
                key={el.id}
                sx={{
                  ...baseStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: justify,
                  textAlign: align,
                  fontWeight: el.bold ? 700 : 400,
                  fontStyle: el.italic ? "italic" : "normal",
                  fontSize: el.fontSize,
                  fontFamily: el.fontFamily,
                  color: el.color,
                  whiteSpace: "pre-wrap",
                }}
              >
                {el.text}
              </Box>
            );
          }

          return null;
        })}
      </Box>
    );
  }, []);

  const captureSlidesFromDom = useCallback(
    async (format: "jpeg" | "png", maxDim = 1600) => {
      const out: string[] = [];
      for (let i = 0; i < rawSlides.length; i++) {
        const node = slideNodeRefs.current[i];
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        const maxSide = Math.max(rect.width || 0, rect.height || 0);
        const ratio = maxSide ? maxDim / maxSide : 1.5;
        const pixelRatio = Math.min(2, Math.max(0.5, ratio));
        if (format === "png") {
          const png = await toPng(node, {
            pixelRatio,
            backgroundColor: "transparent",
            cacheBust: false,
            skipFonts: false,
          });
          out.push(png);
        } else {
          const jpg = await toJpeg(node, {
            quality: 0.78,
            pixelRatio,
            backgroundColor: "#ffffff",
            cacheBust: false,
            skipFonts: false,
          });
          out.push(jpg);
        }
      }
      return out;
    },
    [rawSlides.length]
  );

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

  useEffect(() => {
    try {
      localStorage.setItem("selectedCategory", String(categoryName));
    } catch {}
  }, [categoryName]);

  const isMugsCategory = useMemo(() => lc(categoryName).includes("mug"), [categoryName]);
  const categoryLabel = useMemo(
    () => singularizeCategory(product?.category || categoryName),
    [product?.category, categoryName]
  );

  const mugPreview = useMemo(() => {
    if (!isMugsCategory) return "";
    if (slidesObj?.slide1) return slidesObj.slide1;
    try {
      const slides = JSON.parse(sessionStorage.getItem("slides") || "{}");
      return slides.slide1 || "";
    } catch {
      return "";
    }
  }, [isMugsCategory, slidesObj]);

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
  const [mockupOk, setMockupOk] = useState(false);
  const allowMockup = !isMugsCategory;

  useEffect(() => {
    let alive = true;

    if (!allowMockup || !mock?.mockupSrc || (!isMugsCategory && mugPreview)) {
      setMockupOk(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (alive) setMockupOk(true);
    };
    img.onerror = () => {
      if (alive) setMockupOk(false);
    };
    img.src = mock.mockupSrc;

    return () => {
      alive = false;
    };
  }, [mock?.mockupSrc, mugPreview, isMugsCategory, allowMockup]);

  const useMockupBackground = allowMockup && Boolean(mock?.mockupSrc) && mockupOk;
  const mockupAspectRatio = useMockupBackground ? "818 / 600" : undefined;

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

  const getSlidesPayload = async () => {
    if (slidesObj && Object.keys(slidesObj).length) return slidesObj;
    try {
      const globalSlides = (globalThis as any).__slidesCache;
      if (globalSlides && Object.keys(globalSlides).length) return globalSlides;
    } catch {}
    try {
      const fromIdb = await loadSlidesFromIdb();
      if (fromIdb && Object.keys(fromIdb).length) return fromIdb;
    } catch { }
    try {
      const raw = sessionStorage.getItem("slides") || localStorage.getItem("slides_backup") || "{}";
      return JSON.parse(raw);
    } catch {
      return slidesObj ?? {};
    }
  };

  const clearPreviewStorage = useCallback(() => {
    try {
      sessionStorage.removeItem("slides");
      sessionStorage.removeItem("slides_preview_only");
      sessionStorage.removeItem("rawSlidesCount");
      sessionStorage.removeItem("capturedSlides");
      sessionStorage.removeItem("capturedSlidesKey");
      sessionStorage.removeItem("templ_preview_slides");
      sessionStorage.removeItem("templ_preview_key");
      sessionStorage.removeItem("templ_preview_category");
      sessionStorage.removeItem("templ_preview_config");
      sessionStorage.removeItem("slides_mirrored");
      sessionStorage.removeItem("slides_mirrored_category");
    } catch {}

    try {
      localStorage.removeItem("slides_backup");
    } catch {}

    try {
      delete (globalThis as any).__slidesCache;
      delete (globalThis as any).__rawSlidesCache;
      delete (globalThis as any).__previewConfigCache;
    } catch {}
  }, []);

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

      const successUrl = `${window.location.origin}${location.pathname}?paid=1&session_id={CHECKOUT_SESSION_ID}&category=${encodeURIComponent(
        categoryName
      )}`;
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

  const ensureSlidesPayload = useCallback(
    async (format: "jpeg" | "png") => {
      const current = await getSlidesPayload();
      const currentKeys = Object.keys(current || {}).filter((k) => current[k]);
      const expectedCount = (() => {
        if (rawSlides.length) return rawSlides.length;
        try {
          const n = Number(sessionStorage.getItem("rawSlidesCount") || "0");
          return Number.isFinite(n) && n > 0 ? n : 0;
        } catch {
          return 0;
        }
      })();

      const hasEnough = expectedCount ? currentKeys.length >= expectedCount : currentKeys.length > 0;
      const needPng = format === "png";
      const hasPng = !needPng
        ? true
        : currentKeys.every((k) => String(current[k] || "").startsWith("data:image/png"));

      if (hasEnough && hasPng && !isPreviewOnly) return current;

      if (!rawSlides.length) return current;

      // ensure DOM nodes are ready
      await new Promise((r) => setTimeout(r, 0));
      const list = await captureSlidesFromDom(format, needPng ? 2400 : 1600);
      if (!list.length) return current;

      const next = Object.fromEntries(list.map((u, idx) => [`slide${idx + 1}`, u]));
      setSlidesObj(next);
      (globalThis as any).__slidesCache = next;
      try {
        sessionStorage.setItem("slides_preview_only", "0");
        sessionStorage.setItem("rawSlidesCount", String(list.length));
      } catch {}

      try {
        sessionStorage.setItem("slides", JSON.stringify(next));
      } catch {}

      try {
        void saveSlidesToIdb(next);
      } catch {}

      return next;
    },
    [captureSlidesFromDom, getSlidesPayload, isPreviewOnly, rawSlides.length]
  );

  const sendPdfDirectForSubscription = useCallback(
    async (opts?: { paid?: boolean; sessionId?: string }) => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("Login session not found");

        const cardSize = localStorage.getItem("selectedSize") || selectedPlan;
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
        const isMugWrap = isMugsCategory && isMugWrapSize(cardSize);

        const isStickerForPdf = /sticker/i.test(String(categoryName ?? ""));
        const isBagCategory = /bag|tote/i.test(String(categoryName ?? ""));
        const isClothingCategory = /clothing|clothes|apparel/i.test(
          String(categoryName ?? "")
        );
        const isBagOrClothingForPdf = isBagCategory || isClothingCategory;
        const isNotebookCategory = isNotebooksCategory(categoryName);
        const clothingBgRemoveOpts = {
          threshold: 28,
          alphaThreshold: 6,
          minBrightness: 160,
          satThreshold: 32,
          whiteOnly: false,
          requireWhiteBg: false,
          softness: 18,
          mode: "edge" as const,
        };
        const bagBgRemoveOpts = {
          threshold: 18,
          alphaThreshold: 8,
          minBrightness: 245,
          satThreshold: 10,
          whiteMinChannel: 240,
          whiteOnly: true,
          requireWhiteBg: true,
        };
        const bgRemoveOpts =
          !isCandlesGrid &&
          !isCoastersGrid &&
          !isMugWrap &&
          (isBagOrClothingForPdf || isNotebookCategory)
            ? isClothingCategory
              ? clothingBgRemoveOpts
              : bagBgRemoveOpts
            : !isCandlesGrid && !isCoastersGrid && !isMugWrap && isStickerForPdf
            ? { threshold: 28, alphaThreshold: 8, minBrightness: 228, satThreshold: 18 }
            : null;
        const isTransparentPdf =
          isStickerForPdf ||
          isBagOrClothingForPdf ||
          isCoastersGrid ||
          isMugWrap ||
          isNotebookCategory;

        const captureFormat: "png" | "jpeg" = isTransparentPdf ? "png" : "jpeg";
        const rawSlides = await ensureSlidesPayload(captureFormat);

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

        const coasterSlides = isCoastersGrid
          ? (() => {
              const keys = Object.keys(processedCoasterSlides)
                .filter((k) => processedCoasterSlides[k])
                .sort();
              const limited = keys.slice(0, 2);
              return Object.fromEntries(limited.map((k) => [k, processedCoasterSlides[k]]));
            })()
          : processedCoasterSlides;

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

        const leafletSlides = (() => {
          if (!isLeafletTwoUp) return baseSlides;
          const keys = Object.keys(baseSlides).filter((k) => baseSlides[k]).sort();
          if (keys.length === 0) return baseSlides;
          if (keys.length === 1) {
            const k = keys[0];
            return { slide1: baseSlides[k], slide2: baseSlides[k] };
          }
          const frontKey = keys[0];
          const backKey = keys[1];
          return {
            slide1: baseSlides[frontKey],
            slide2: baseSlides[frontKey],
            slide3: baseSlides[backKey],
            slide4: baseSlides[backKey],
          };
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
              fillMode: "sequence",
            })
          : isCoastersGrid
          ? await buildFixedGridSlides(coasterSlides, {
              columns: 2,
              rows: 1,
              labelMm: { w: 89, h: 89 },
              gapMm: 0,
              distribute: false,
              fit: "contain",
              pageMm: { w: 229, h: 89 },
              background: "transparent",
              outputFormat: "png",
              fillMode: "sequence",
              mirrorPage: true,
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
          ? await buildTwoUpSlides(leafletSlides, {
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
                if (pageIndex === 1) return "";
                if (pageIndex === 2) return "";
                return null;
              },
            })
          : processedBgSlides;
        const outputFormat = isTransparentPdf ? "png" : "pdf";

        const isPaidFlow = Boolean(opts?.paid && opts?.sessionId);
        const endpoint = isPaidFlow
          ? `${API_BASE}/send-pdf-after-success`
          : `${API_BASE}/pdf/send-subscription`;

        const basePayload = {
          slides,
          cardSize,
          category: categoryName,
          fileName: buildPdfFileName(categoryName, outputFormat),
          ...(isTransparentPdf ? { outputFormat } : {}),
          ...(isTwoUpLandscape || isLeafletTwoUp || isNotebookTwoUp || isInviteTwoUp || isMugWrap
            ? { pageOrientation: "landscape" }
            : {}),
        };

        const paidPayload = isPaidFlow
          ? { sessionId: opts?.sessionId }
          : {
              accessplan: selectedItemAccessPlan,
              inBundleItems: isInBundleItems,
              productKey,
              userPlan: planCode,
              paid: Boolean(opts?.paid),
              payment_session_id: opts?.sessionId ?? null,
            };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...basePayload, ...paidPayload }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `Request failed (HTTP ${res.status})`);
        }

        await res.json();
        clearPreviewStorage();
        toast.success("File generated & emailed to you!");
      } catch (e: any) {
        toast.error(e?.message || "Could not generate file");
      } finally {
        setLoading(false);
      }
    },
    [
      categoryName,
      selectedItemAccessPlan,
      isInBundleItems,
      productKey,
      selectedPlan,
      planCode,
      slidesObj,
      ensureSlidesPayload,
      isMugsCategory,
      clearPreviewStorage,
    ]
  );

  // ✅ Stripe return handler (same)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const paid = sp.get("paid") === "1";
    const sessionId = sp.get("session_id") || "";
    if (!paid || !sessionId) return;

    (async () => {
      try {
        const sentKey = `payment_email_sent_${sessionId}`;
        const sentState = sessionStorage.getItem(sentKey);
        if (sentState === "1" || sentState === "sending") return;
        sessionStorage.setItem(sentKey, "sending");

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
        sessionStorage.setItem(sentKey, "1");
        navigate(location.pathname, { replace: true, state });
      } catch (e: any) {
        const sentKey = `payment_email_sent_${sessionId}`;
        sessionStorage.removeItem(sentKey);
        toast.error(e?.message || "Payment done but file couldn't be generated");
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


  const isStickerCategory = useMemo(
    () => lc(categoryName).includes("sticker"),
    [categoryName]
  );
  const isCandleCategory = useMemo(
    () => lc(categoryName).includes("candle"),
    [categoryName]
  );
  const isBagCategory = useMemo(
    () => /bag|tote/i.test(String(categoryName ?? "")),
    [categoryName]
  );
  const isClothingCategory = useMemo(
    () => /clothing|clothes|apparel/i.test(String(categoryName ?? "")),
    [categoryName]
  );

  const [firstSlideProcessed, setFirstSlideProcessed] = useState(firstSlideUrl);

  useEffect(() => {
    let alive = true;

    if (!firstSlideUrl) {
      setFirstSlideProcessed("");
      return;
    }

    if (!isStickerCategory && !isCandleCategory && !isBagCategory && !isClothingCategory) {
      setFirstSlideProcessed(firstSlideUrl);
      return;
    }

    const clothingBgRemoveOpts = {
      threshold: 28,
      alphaThreshold: 6,
      minBrightness: 160,
      satThreshold: 32,
      whiteOnly: false,
      requireWhiteBg: false,
      softness: 18,
      mode: "edge" as const,
    };
    const bagBgRemoveOpts = {
      threshold: 18,
      alphaThreshold: 8,
      minBrightness: 245,
      satThreshold: 10,
      whiteMinChannel: 240,
      whiteOnly: true,
      requireWhiteBg: true,
    };
    const opts = isCandleCategory
      ? { threshold: 24, alphaThreshold: 8, minBrightness: 235, satThreshold: 16, mode: "all" as const }
      : isBagCategory || isClothingCategory
      ? isClothingCategory
        ? clothingBgRemoveOpts
        : bagBgRemoveOpts
      : { threshold: 28, alphaThreshold: 8, minBrightness: 228, satThreshold: 18 };

    removeWhiteBg(firstSlideUrl, opts).then((res) => {
      if (alive) setFirstSlideProcessed(res);
    });

    return () => {
      alive = false;
    };
  }, [firstSlideUrl, isStickerCategory, isCandleCategory, isBagCategory, isClothingCategory]);

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

  const previewSrc = mugPreview || firstSlideProcessed || "";
  const showOverlayPreview = Boolean(previewSrc) && useMockupBackground;
  const showFlatPreview = Boolean(previewSrc) && !useMockupBackground;

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
          pb: { md: 8, sm: 6, xs: 6 },

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
            Please select your {categoryLabel} print size!
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
              <Box sx={{ p: 1.5, bgcolor: COLORS.black, borderRadius: 2, color: COLORS.white }}>
                📒 <b>MUGS</b>: Preview is mirrored in the downloaded file
              </Box>
            )}
          </Box>

          <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
            {/* Left Preview */}
            <Grid
              size={{ md: 7, sm: 7, xs: 12 }}
              sx={{
                backgroundImage: useMockupBackground
                  ? `url(${mock?.mockupSrc})`
                  : isMugsCategory
                  ? "none"
                  : `url(${TableBgImg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: 7,
                border: "1px solid gray",
                position: "relative",
                height: useMockupBackground ? "auto" : { md: mugPreview ? 350 : 600, sm: mugPreview ? 350 : 600, xs: 320 },
                aspectRatio: mockupAspectRatio,
                overflow: "hidden",
              }}
            >
              {showOverlayPreview ? (
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
                    src={previewSrc}
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
              ) : showFlatPreview ? (
                <Box component="img" src={previewSrc} sx={{ width: "100%", height: "100%", objectFit: "fill" }} />
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
                <Typography variant="h5">🎉 Your {categoryLabel} design is ready for checkout!</Typography>

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
                      ? "Pay & Get your File!"
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

          {rawSlides.length > 0 && (
            <Box sx={{ position: "fixed", left: -10000, top: 0, opacity: 0, pointerEvents: "none" }}>
              {rawSlides.map((sl, i) => (
                <Box
                  key={sl.id ?? i}
                  ref={setSlideNodeRef(i)}
                  sx={{ width: captureWidth, height: captureHeight, position: "relative" }}
                >
                  {renderSlide(sl)}
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
};

export default Subscription;
