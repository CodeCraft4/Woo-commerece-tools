import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useEffect, useMemo, useState } from "react";
import LandingButton from "../LandingButton/LandingButton";
import { IconButton, Skeleton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../constant/route";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useSlide2 } from "../../context/Slide2Context";
import { useSlide3 } from "../../context/Slide3Context";
import { useSlide4 } from "../../context/Slide4Context";
import { useSlide1 } from "../../context/Slide1Context";
import { COLORS } from "../../constant/color";
import { useCartStore } from "../../stores/cartStore";
import { ensureDraftCardId, newUuid, setDraftCardId } from "../../lib/draftCardId";
import { getPricingConfig, type SizeKeyConfig } from "../../lib/pricing";
import { clearSlidesFromIdb } from "../../lib/idbSlides";
import { pickPolygonLayout } from "../../lib/polygon";
import {
  fetchCardById,
  fetchTempletEditorPayloadById,
} from "../../source/source";
import SmartImage from "../SmartImage/SmartImage";
import { shouldSmartCropCategory } from "../../lib/thumbnail";
import TemplateSvgThumbnail from "../TemplateSvgThumbnail/TemplateSvgThumbnail";
import { clearSubscriptionPreviewPayload } from "../../lib/subscriptionPreview";

const CARD_MOCKUP_PREVIEW_STORAGE_PREFIX = "subscription:card:mockup-preview";

const clearCardMockupPreviewStorage = (storage: Storage) => {
  for (let i = storage.length - 1; i >= 0; i -= 1) {
    const key = storage.key(i);
    if (!key) continue;
    if (key === "card_mockup_preview_src" || key.startsWith(CARD_MOCKUP_PREVIEW_STORAGE_PREFIX)) {
      storage.removeItem(key);
    }
  }
};

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { md: 800, sm: 700, xs: "90%" },
  bgcolor: "background.paper",
  borderRadius: 3,
};

function clearEditorStorage(opts?: { all?: boolean }) {
  if (opts?.all) {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    return;
  }
  
  try {
    const KEYS = ["selectedSize", "selectedVariant", "categorieTemplet", "3dModel", "selectedPrices", "selectedProduct"];
    KEYS.forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem("slides");
    sessionStorage.removeItem("slides_backup");
    sessionStorage.removeItem("templ_preview_slides");
    sessionStorage.removeItem("templ_preview_key");
    sessionStorage.removeItem("templ_preview_config");
    sessionStorage.removeItem("capturedSlides");
    sessionStorage.removeItem("capturedSlidesKey");
    sessionStorage.removeItem("slides_preview_only");
    localStorage.removeItem("slides_backup");
    sessionStorage.removeItem("mugImage");
    sessionStorage.removeItem("cart-store-v2");
    sessionStorage.removeItem("draft:card_id");
    sessionStorage.removeItem("card_preview_downloaded");
    sessionStorage.removeItem("card_raw_slides");
    sessionStorage.removeItem("card_raw_slides_meta");
    clearSlidesFromIdb().catch(() => {});
    clearSubscriptionPreviewPayload();
    delete (globalThis as any).__slidesCache;
    delete (globalThis as any).__rawSlidesCache;
    delete (globalThis as any).__previewConfigCache;
    clearCardMockupPreviewStorage(sessionStorage);
    clearCardMockupPreviewStorage(localStorage);


    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("templetEditor:draft:")) localStorage.removeItem(key);
    }
  } catch {}
}

export type CategoryType = {
  id?: string | number;

  category?: string;
  cardcategory?: string;
  cardCategory?: string;

  cardname?: string;
  cardName?: string;
  title?: string;

  description?: string;

  img_url?: string;
  poster?: string;
  imageurl?: string;
  lastpageimageurl?: string;
  cover_screenshot?: string;

  polygonlayout?: any;

  // legacy columns
  actualprice?: number | string;
  a4price?: number | string;
  a5price?: number | string;
  usletter?: number | string;

  // new columns
  a3price?: number | string;
  halfusletter?: number | string;
  ustabloid?: number | string;

  // template support
  rawStores?: any;
  raw_stores?: any;
  templetDesign?: any;

  __type?: "card" | "template";
};

type ProductsPopTypes = {
  open: boolean;
  onClose: () => void;
  cate?: CategoryType | any;
  isTempletDesign?: boolean;
  mode?: "add" | "edit";
  initialPlan?: any;
  priceLoading?: boolean;
};

const isActivePay = {
  display: "flex",
  gap: "4px",
  justifyContent: "space-between",
  alignItems: "center",
  bgcolor: "#56BECC",
  p: "3px",
  borderRadius: 2,
  boxShadow: "3px 7px 8px #eff1f1ff",
};

const toNum = (v: unknown, fallback = 0) => {
  if (v == null) return fallback;
  const s = String(v).trim();
  if (!s) return fallback;
  if (s.toUpperCase() === "EMPTY") return fallback;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

const parseLayoutPricing = (layout: any) => {
  if (!layout) return { pricing: {}, salePricing: {} };
  const obj =
    typeof layout === "string"
      ? (() => {
          try {
            return JSON.parse(layout);
          } catch {
            return null;
          }
        })()
      : layout;
  const pricing = obj?.pricing && typeof obj.pricing === "object" ? obj.pricing : {};
  const salePricing =
    obj?.salePricing && typeof obj.salePricing === "object" ? obj.salePricing : {};
  return { pricing, salePricing };
};

const getCategoryName = (cate?: CategoryType) => {
  return cate?.category ?? cate?.cardcategory ?? cate?.cardCategory ?? "default";
};

const getProductThumbSrc = (cate: any, isTempletDesign?: boolean) => {
  if (isTempletDesign) {
    return (
      cate?.img_url ||
      cate?.poster ||
      cate?.cover_screenshot ||
      cate?.imageurl ||
      cate?.lastpageimageurl ||
      ""
    );
  }
  return (
    cate?.imageurl ||
    cate?.lastpageimageurl ||
    cate?.poster ||
    cate?.cover_screenshot ||
    cate?.img_url ||
    ""
  );
};

type ActualMap = Partial<Record<SizeKeyConfig, number>>;

const getStoredPricing = (cate?: any) => {
  const raw =
    cate?.raw_stores ??
    cate?.rawStores ??
    cate?.raw_store ??
    {};
  const polygon = parseLayoutPricing(cate?.polygonlayout);
  return {
    pricing:
      (raw?.pricing && typeof raw.pricing === "object" ? raw.pricing : null) ??
      polygon.pricing ??
      {},
    salePricing:
      (raw?.salePricing && typeof raw.salePricing === "object"
        ? raw.salePricing
        : null) ??
      polygon.salePricing ??
      {},
  };
};

const firstPrice = (...values: unknown[]) => {
  for (const value of values) {
    const parsed = toNum(value, 0);
    if (parsed > 0) return parsed;
  }
  return 0;
};

const buildActualPrices = (cate?: any, categoryName?: string, isTempletDesign?: boolean): ActualMap => {
  const actual: ActualMap = {};
  const { pricing: stored } = getStoredPricing(cate);
  const isCandleCategory = /candle/i.test(String(categoryName ?? ""));
  const storedTabloid = stored?.US_TABLOID ?? stored?.us_tabloid ?? stored?.ustabloid;
  const candleLetterFallback = firstPrice(cate?.ustabloid, storedTabloid);
  const candleTabloidFallback = toNum(cate?.usletter, 0);

  actual.A4 = firstPrice(cate?.a4price, stored?.A4, stored?.a4);
  actual.US_LETTER = firstPrice(
    cate?.usletter,
    stored?.US_LETTER,
    stored?.us_letter,
    isCandleCategory ? candleLetterFallback : 0,
  );
  actual.HALF_US_LETTER = firstPrice(
    cate?.halfusletter,
    stored?.HALF_US_LETTER,
    stored?.half_us_letter,
  );
  actual.US_TABLOID = firstPrice(
    cate?.ustabloid,
    storedTabloid,
    isCandleCategory ? candleTabloidFallback : 0,
  );
  actual.A5 = firstPrice(cate?.a5price, stored?.A5, stored?.a5);
  actual.A3 = isTempletDesign
    ? firstPrice(cate?.a3price, stored?.A3, stored?.a3, cate?.a5price)
    : firstPrice(stored?.A3, stored?.a3, cate?.a5price);
  actual.MUG_WRAP_11OZ = firstPrice(
    cate?.actualprice,
    stored?.MUG_WRAP_11OZ,
    stored?.mug_wrap_11oz,
  );
  actual.COASTER_95 = firstPrice(
    cate?.actualprice,
    stored?.COASTER_95,
    stored?.coaster_95,
  );

  // fallback: older row me sirf actualprice filled ho
  const sizes = getPricingConfig(categoryName).sizes;
  const firstKey = sizes[0]?.key as SizeKeyConfig | undefined;
  if (firstKey) {
    const cur = toNum(actual[firstKey], 0);
    const legacy = toNum(cate?.actualprice, 0);
    if (cur <= 0 && legacy > 0) actual[firstKey] = legacy;
  }

  return actual;
};

const buildSalePrices = (cate?: any, isTempletDesign?: boolean): ActualMap => {
  const sale: ActualMap = {};
  const { salePricing: stored } = getStoredPricing(cate);

  sale.A4 = firstPrice(cate?.salea4price, stored?.A4, stored?.a4);
  sale.US_LETTER = firstPrice(
    cate?.saleusletter,
    stored?.US_LETTER,
    stored?.us_letter,
  );
  sale.HALF_US_LETTER = firstPrice(
    cate?.salehalfusletter,
    stored?.HALF_US_LETTER,
    stored?.half_us_letter,
  );
  sale.US_TABLOID = firstPrice(
    cate?.saleustabloid,
    stored?.US_TABLOID,
    stored?.us_tabloid,
  );
  sale.A5 = firstPrice(cate?.salea5price, stored?.A5, stored?.a5);
  sale.A3 = isTempletDesign
    ? firstPrice(cate?.salea3price, stored?.A3, stored?.a3, cate?.salea5price)
    : firstPrice(stored?.A3, stored?.a3, cate?.salea5price);
  sale.MUG_WRAP_11OZ = firstPrice(
    cate?.saleprice,
    stored?.MUG_WRAP_11OZ,
    stored?.mug_wrap_11oz,
  );
  sale.COASTER_95 = firstPrice(
    cate?.saleprice,
    stored?.COASTER_95,
    stored?.coaster_95,
  );

  return sale;
};

const ProductPopup = (props: ProductsPopTypes) => {
  const { open, onClose, cate, isTempletDesign, mode = "add", initialPlan, priceLoading } = props;

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>((initialPlan ?? "") as any);
  const [isZoomed, setIsZoomed] = useState(false);

  const { resetSlide1State } = useSlide1();
  const { resetSlide2State } = useSlide2();
  const { resetSlide3State } = useSlide3();
  const { resetSlide4State } = useSlide4();

  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart, updateCartItem } = useCartStore();

  const categoryName = useMemo(() => getCategoryName(cate), [cate]);
  const enableSmartCrop = useMemo(
    () => Boolean(isTempletDesign && shouldSmartCropCategory(categoryName)),
    [categoryName, isTempletDesign]
  );
  const isCandleCategory = useMemo(
    () => /candle/i.test(String(categoryName ?? "")),
    [categoryName]
  );
  const isMugCategory = useMemo(
    () => /mug/i.test(String(categoryName ?? "")),
    [categoryName]
  );
  const isBusinessCard = useMemo(
    () => /business\s*card/i.test(String(categoryName ?? "")),
    [categoryName]
  );
  const isBagCategory = useMemo(
    () => /(tote\s*bag|bag)/i.test(String(categoryName ?? "")),
    [categoryName]
  );
  const isStickerCategory = useMemo(
    () => /sticker/i.test(String(categoryName ?? "")),
    [categoryName]
  );
  const shouldContainPreview = isCandleCategory || isMugCategory || isBusinessCard || isBagCategory || isStickerCategory;
  const thumbSrc = useMemo(
    () => getProductThumbSrc(cate, isTempletDesign),
    [cate, isTempletDesign]
  );

  // ✅ use central config (EXACT sizes)
  const sizeOptions = useMemo(() => {
    const base = getPricingConfig(categoryName).sizes ?? [];
    if (!isTempletDesign || isBusinessCard) return base;

    // const has = (k: any) => base.some((s) => s.key === k);
    const next = [...base];
    // if (!has("A3")) next.push({ key: "A3", title: "A3" });
    // if (!has("US_TABLOID")) next.push({ key: "US_TABLOID", title: "US Tabloid (11×17)" });

    const order = [
      "A5",
      "A4",
      "A3",
      "HALF_US_LETTER",
      "US_LETTER",
      "US_TABLOID",
      "MUG_WRAP_11OZ",
      "COASTER_95",
    ];

    return next.sort(
      (a, b) => order.indexOf(a.key as any) - order.indexOf(b.key as any)
    );
  }, [categoryName, isTempletDesign, isBusinessCard]);

  const actualPrices = useMemo(
    () => buildActualPrices(cate, categoryName, isTempletDesign),
    [cate, categoryName, isTempletDesign]
  );
  const salePrices = useMemo(
    () => buildSalePrices(cate, isTempletDesign),
    [cate, isTempletDesign],
  );

  const getPriceForKey = (key: any) =>
    toNum(
      (actualPrices as any)?.[key] ??
        (actualPrices as any)?.[String(key).toUpperCase?.()] ??
        (actualPrices as any)?.[String(key).toLowerCase?.()],
      0
    );

  // ✅ pick first size which has price > 0 (else fallback first)
  useEffect(() => {
    if (!open) return;

    const firstWithPrice = sizeOptions.find((s) => getPriceForKey(s.key) > 0)?.key;
    const fallback = sizeOptions[0]?.key ?? "A4";

    // if initialPlan provided and it has price > 0, prefer it
    const normalizedInit =
      initialPlan &&
      sizeOptions.find(
        (s) => String(s.key).toLowerCase() === String(initialPlan).toLowerCase()
      )?.key;
    const initKey = normalizedInit ?? initialPlan;
    const initOk = initKey && getPriceForKey(initKey) > 0;
    setSelectedPlan(initOk ? initKey : firstWithPrice ?? fallback);
  }, [open, sizeOptions, actualPrices, initialPlan]);

  const selectedActualPrice = useMemo(
    () => getPriceForKey(selectedPlan),
    [actualPrices, selectedPlan],
  );
  const selectedSalePrice = useMemo(
    () => toNum((salePrices as any)?.[selectedPlan], 0),
    [salePrices, selectedPlan],
  );
  const selectedIsOnSale =
    selectedSalePrice > 0 && selectedSalePrice < selectedActualPrice;
  const displayPrice = selectedIsOnSale ? selectedSalePrice : selectedActualPrice;
  const getDisplayPriceForKey = (key: SizeKeyConfig) => {
    const actual = getPriceForKey(key);
    const sale = toNum((salePrices as any)?.[key], 0);
    return sale > 0 && sale < actual ? sale : actual;
  };

  const selectedIsValid = useMemo(() => {
    if (!selectedPlan) return false;
    const exists = sizeOptions.some((s) => s.key === selectedPlan);
    if (!exists) return false;
    return displayPrice > 0;
  }, [selectedPlan, sizeOptions, displayPrice]);

  const handleToggleZoom = () => setIsZoomed((prev) => !prev);

  const mustSelectError = () => {
    toast.error("Please select a valid size/price to continue.");
  };

  const handlePersonalize = async () => {
    if (!cate) return;

    if (!sizeOptions.length) {
      toast.error("No pricing configured for this product.");
      return;
    }

    // ✅ STOP: do not go editor if invalid
    if (!selectedIsValid) {
      mustSelectError();
      return;
    }

    setLoading(true);
    clearEditorStorage({ all: false });

    const selectedVariant = {
      key: selectedPlan,
      title: sizeOptions.find((s) => s.key === selectedPlan)?.title || String(selectedPlan),
      price: displayPrice,
      isOnSale: selectedIsOnSale,
      category: categoryName,
    };

    const selectedProduct = {
      id: cate?.id,
      type: (cate?.__type ?? (isTempletDesign ? "template" : "card")) as "card" | "template",
      title: cate?.cardname || cate?.cardName || cate?.title || "Untitled",
      category: categoryName,
      img: thumbSrc,
    };

    try {
      localStorage.setItem("selectedVariant", JSON.stringify(selectedVariant));
      localStorage.setItem("selectedSize", String(selectedPlan));
      localStorage.setItem("selectedPrices", JSON.stringify({ actual: actualPrices, sale: salePrices }));
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
      localStorage.setItem("selectedCategory", String(categoryName));
    } catch {}

    resetSlide1State();
    resetSlide2State();
    resetSlide3State();
    resetSlide4State();

    // template flow
    if (isTempletDesign && user) {
      const row = (((cate as any)?.templetDesign ?? cate) || {}) as Record<string, any>;

      const existingRaw =
        (cate as any)?.rawStores ??
        row?.raw_stores ??
        row?.rawStores ??
        row?.raw_Stores ??
        row?.slides;

      let editorRow: Record<string, any> = row;
      if (!existingRaw && row?.id) {
        try {
          const editorPayload = (await fetchTempletEditorPayloadById(row.id)) as Record<string, any>;
          editorRow = {
            ...row,
            ...editorPayload,
          };
        } catch (error) {
          console.error("Template editor payload fetch failed:", error);
          toast.error("Design data missing. Please refresh and try again.");
          setLoading(false);
          return;
        }
      }

      const raw =
        (cate as any)?.rawStores ??
        editorRow?.raw_stores ??
        editorRow?.rawStores ??
        editorRow?.raw_Stores ??
        editorRow?.slides ??
        editorRow;

      const routeCategory = editorRow?.category ?? raw?.category ?? cate?.category ?? cate?.cardcategory ?? "general";

      navigate(`${USER_ROUTES.TEMPLET_EDITORS}/${encodeURIComponent(routeCategory)}/${editorRow?.id ?? cate.id}`, {
        state: { templetDesign: raw },
      });

      setLoading(false);
      return;
    }

    // card flow
    if (user) {
      const isContinueDraft = Boolean((cate as any).__draft === true);

      const draftId = isContinueDraft
        ? ensureDraftCardId(String(cate?.id ?? ""))
        : (() => {
            const id = newUuid();
            setDraftCardId(id);
            return id;
          })();

      let latestCard: any = null;
      if (cate?.id) {
        try {
          // why: always prefer freshest layout so recently updated admin designs
          // are reflected immediately in user editor (avoid stale list/query cache)
          latestCard = await fetchCardById(String(cate.id));
        } catch {}
      }

      const latestRaw =
        (latestCard as any)?.raw_stores ??
        (latestCard as any)?.rawStores ??
        (latestCard as any)?.raw_store ??
        null;
      const cateRaw =
        (cate as any)?.raw_stores ??
        (cate as any)?.rawStores ??
        (cate as any)?.raw_store ??
        null;

      const baseLayout = pickPolygonLayout(
        (latestCard as any)?.polygonlayout,
        (latestCard as any)?.polyganLayout,
        latestRaw?.polygonlayout,
        latestRaw?.polyganLayout,
        (cate as any)?.polygonlayout,
        (cate as any)?.polyganLayout,
        cateRaw?.polygonlayout,
        cateRaw?.polyganLayout
      );

      if (!baseLayout) {
        toast.error("Design data missing. Please refresh and try again.");
        setLoading(false);
        return;
      }

      navigate(`${USER_ROUTES.HOME}/${draftId}`, {
        state: {
          poster: cate?.imageurl || cate?.lastpageimageurl,
          plan: selectedPlan,
          layout: baseLayout,
        },
      });
      setLoading(false);

      return;
    }

    setTimeout(() => {
      toast.error("You need to First Login");
      navigate(USER_ROUTES.SIGNIN);
      setLoading(false);
    }, 300);
  };

  const handleAddOrUpdateCart = () => {
    if (!cate?.id) {
      toast.error("Invalid product");
      return;
    }

    if (!sizeOptions.length) {
      toast.error("No pricing configured for this product.");
      return;
    }

    // ✅ STOP: don’t add/update with invalid plan
    if (!selectedIsValid) {
      mustSelectError();
      return;
    }

    const type = (isTempletDesign ? "templet" : "card") as "card" | "templet";

    const img = thumbSrc;

    const title = cate?.cardname || cate?.cardName || cate?.title || "Untitled";
    const category = categoryName;

    const templetRow = (cate as any)?.templetDesign ?? cate;

    const idStr = String(cate.id).trim();

    if (type === "card") {
      const cardId = Number(idStr);
      if (!Number.isFinite(cardId) || !/^\d+$/.test(idStr)) {
        toast.error("Card id is invalid (must be number). This item looks like a template.");
        return;
      }
    }

    const rawStores =
      (cate as any)?.rawStores ??
      (cate as any)?.raw_stores ??
      templetRow?.raw_stores ??
      templetRow?.rawStores ??
      templetRow?.raw_Stores ??
      templetRow?.stores ??
      undefined;

    const description = cate?.description ?? templetRow?.description ?? "";

    const payload: any = {
      id: idStr,
      type,
      img,
      title,
      category,
      description,
      selectedSize: selectedPlan,
      prices: { actual: actualPrices, sale: salePrices },
      isOnSale: selectedIsOnSale,
      displayPrice,
      polygonlayout: type === "card" ? cate?.polygonlayout : undefined,
      templetDesign: type === "templet" ? templetRow : undefined,
      rawStores: type === "templet" ? rawStores : undefined,
    };

    if (mode === "edit") {
      updateCartItem(idStr, type, payload);
      toast.success("Basket updated");
      onClose();
      return;
    }

    const res = addToCart(payload);
    if (!res.ok && res.reason === "exists") {
      toast.error("Already exists in basket ❌");
      return;
    }

    toast.success("Product added to basket ✅");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
      BackdropProps={{ sx: { backgroundColor: "rgba(10, 10, 10, 0.34)" } }}
    >
      <Box sx={{ ...style, height: { md: "auto", sm: "auto", xs: "500px" }, overflowY: "auto" }}>
        <Box sx={{ display: { md: "flex", sm: "flex", xs: "block" }, p: 2, gap: 2 }}>
          <Box
            sx={{
              width: { md: "400px", sm: "50%", xs: "100%" },
              height: { md: 600, sm: 500, xs: 300 },
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
              cursor: isZoomed ? "zoom-out" : "zoom-in",
            }}
            onClick={handleToggleZoom}
          >
            {isTempletDesign ? (
              <TemplateSvgThumbnail
                template={cate}
                fallbackSrc={thumbSrc}
                alt={cate?.cardname || cate?.cardName || cate?.title || "product"}
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  transition: "transform 0.3s ease-in-out",
                  transform: isZoomed ? "scale(1.5)" : "scale(1)",
                  transformOrigin: "center",
                  backgroundColor: shouldContainPreview ? "#fff" : "transparent",
                }}
              />
            ) : (
              <SmartImage
                src={thumbSrc}
                enable={enableSmartCrop}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: shouldContainPreview ? "contain" : "cover",
                  objectPosition: "center",
                  transition: "transform 0.3s ease-in-out",
                  transform: isZoomed ? "scale(1.5)" : "scale(1)",
                  transformOrigin: "center",
                  backgroundColor: shouldContainPreview ? "#fff" : "transparent",
                }}
              />
            )}
          </Box>

          <Box sx={{ width: { md: "50%", sm: "50%", xs: "100%" } }}>
            <Typography sx={{ fontSize: "20px", mb: { md: 3, sm: 3, xs: 0 }, fontWeight: "bold" }}>
              {priceLoading ? "Load Pricing" : "Select Size"}
            </Typography>

            {priceLoading ? (
              <Box sx={{ height: "75%", width: "100%" }}>
                <Box sx={{ display: { md: "flex", sm: "flex", xs: "block" }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="rounded" height={48} sx={{ mt: 2 }} />
                    <Skeleton variant="rounded" height={48} sx={{ mt: 2 }} />
                    <Skeleton variant="rounded" height={48} sx={{ mt: 2 }} />
                    <Skeleton variant="rounded" height={48} sx={{ mt: 2 }} />
                    <Skeleton variant="rounded" height={48} sx={{ mt: 2 }} />
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: { md: "20px", sm: "20px", xs: "10px" } }}>
                {sizeOptions.map((opt) => {
                  const actualPrice = getPriceForKey(opt.key);
                  const price = getDisplayPriceForKey(opt.key);
                  const hasSale = price > 0 && price < actualPrice;
                  const disabled = actualPrice <= 0;

                  return (
                    <Box
                      key={String(opt.key)}
                      onClick={() => !disabled && setSelectedPlan(opt.key)}
                      sx={{
                        ...isActivePay,
                        opacity: disabled ? 0.5 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                        border: `3px solid ${selectedPlan === opt.key ? "#8D6DA1" : "transparent"}`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <input
                          type="radio"
                          name="plan"
                          disabled={disabled}
                          checked={selectedPlan === opt.key}
                          onChange={() => !disabled && setSelectedPlan(opt.key)}
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{opt.title}</Typography>

                          {/* helper/sub text if you want */}
                          {"helper" in opt && (opt as any).helper ? (
                            <Typography sx={{ fontSize: 12, opacity: 0.9 }}>
                              {(opt as any).helper}
                            </Typography>
                          ) : null}

                          {disabled ? <Typography sx={{ fontSize: 12 }}>Not available</Typography> : null}
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: "right" }}>
                        {hasSale ? (
                          <Typography
                            sx={{ fontSize: 13, textDecoration: "line-through", opacity: 0.75 }}
                          >
                            £{actualPrice.toFixed(2)}
                          </Typography>
                        ) : null}
                        <Typography variant="h5">
                          {disabled ? "—" : `£${price.toFixed(2)}`}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}

                <Box>
                  <Typography
                    sx={{
                      bgcolor: "#8D6DA1",
                      fontSize: { md: "20px", sm: "16px", xs: "14px" },
                      color: COLORS.white,
                      height: 270,
                      borderRadius: 4,
                      p: 2,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": { height: "4px", width: "4px" },
                      "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1", borderRadius: "20px" },
                      "&::-webkit-scrollbar-thumb": { backgroundColor: COLORS.gray, borderRadius: "20px" },
                    }}
                  >
                    {cate?.description} 💫
                  </Typography>
                </Box>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: "15px", justifyContent: "center", m: "auto", mt: 4 }}>
              <LandingButton
                title={mode === "edit" ? "Update basket" : "Add to basket"}
                variant="outlined"
                width="150px"
                personal
                onClick={handleAddOrUpdateCart}
              />
              <LandingButton
                title="Personalise"
                width="150px"
                personal
                loading={loading}
                onClick={handlePersonalize}
                // ✅ optional: disable button UI too
              />
            </Box>

            {/* ✅ optional hint */}
            {!priceLoading && !selectedIsValid ? (
              <Typography sx={{ mt: 1, fontSize: 12, color: "#d32f2f", textAlign: "center" }}>
                Please select a size with a valid price to continue.
              </Typography>
            ) : null}
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            bgcolor: "black",
            color: "white",
            width: "30px",
            height: "30px",
            p: 1,
            "&:hover": { bgcolor: "#212121" },
          }}
        >
          <Close fontSize="large" />
        </IconButton>
      </Box>
    </Modal>
  );
};

export default ProductPopup;
