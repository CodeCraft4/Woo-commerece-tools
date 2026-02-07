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
    sessionStorage.removeItem("mugImage");
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

const getCategoryName = (cate?: CategoryType) => {
  return cate?.category ?? cate?.cardcategory ?? cate?.cardCategory ?? "default";
};

type ActualMap = Partial<Record<SizeKeyConfig, number>>;

// ✅ builds actual prices (same rules you had)
const buildActualPrices = (cate?: any, categoryName?: string, isTempletDesign?: boolean): ActualMap => {
  const actual: any = {};

  // common/legacy
  actual.A4 = toNum(cate?.a4price, 0);
  actual.US_LETTER = toNum(cate?.usletter, 0);

  // template new columns
  actual.HALF_US_LETTER = toNum(cate?.halfusletter, 0);
  actual.US_TABLOID = toNum(cate?.ustabloid, 0);

  // A5 normal
  actual.A5 = toNum(cate?.a5price, 0);

  // A3 rule (cards: from a5price, templates: from a3price fallback a5price)
  actual.A3 = isTempletDesign ? toNum(cate?.a3price, toNum(cate?.a5price, 0)) : toNum(cate?.a5price, 0);

  // single-size categories
  actual.MUG_WRAP_11OZ = toNum(cate?.actualprice, 0);
  actual.COASTER_95 = toNum(cate?.actualprice, 0);

  // fallback: older row me sirf actualprice filled ho
  const sizes = getPricingConfig(categoryName).sizes;
  const firstKey = sizes[0]?.key;
  if (firstKey) {
    const cur = toNum(actual[firstKey], 0);
    const legacy = toNum(cate?.actualprice, 0);
    if (cur <= 0 && legacy > 0) actual[firstKey] = legacy;
  }

  return actual;
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
  const isBusinessCard = useMemo(
    () => /business\s*card/i.test(String(categoryName ?? "")),
    [categoryName]
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

  const displayPrice = useMemo(() => getPriceForKey(selectedPlan), [actualPrices, selectedPlan]);

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

  const handlePersonalize = () => {
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
      isOnSale: false,
      category: categoryName,
    };

    const selectedProduct = {
      id: cate?.id,
      type: (cate?.__type ?? (isTempletDesign ? "template" : "card")) as "card" | "template",
      title: cate?.cardname || cate?.cardName || cate?.title || "Untitled",
      category: categoryName,
      img: cate?.imageurl || cate?.lastpageimageurl || cate?.poster || cate?.cover_screenshot || cate?.img_url,
    };

    try {
      localStorage.setItem("selectedVariant", JSON.stringify(selectedVariant));
      localStorage.setItem("selectedSize", String(selectedPlan));
      localStorage.setItem("selectedPrices", JSON.stringify({ actual: actualPrices, sale: {} }));
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
      localStorage.setItem("selectedCategory", String(categoryName));
    } catch {}

    resetSlide1State();
    resetSlide2State();
    resetSlide3State();
    resetSlide4State();

    // template flow
    if (isTempletDesign && user) {
      const row = (cate as any)?.templetDesign ?? cate;

      const raw =
        (cate as any)?.rawStores ??
        row?.raw_stores ??
        row?.rawStores ??
        row?.raw_Stores ??
        row;

      const routeCategory = row?.category ?? raw?.category ?? cate?.category ?? cate?.cardcategory ?? "general";

      navigate(`${USER_ROUTES.TEMPLET_EDITORS}/${encodeURIComponent(routeCategory)}/${row?.id ?? cate.id}`, {
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

      setTimeout(() => {
        navigate(`${USER_ROUTES.HOME}/${draftId}`, {
          state: {
            poster: cate?.imageurl || cate?.lastpageimageurl,
            plan: selectedPlan,
            layout: cate?.polygonlayout,
          },
        });
        setLoading(false);
      }, 300);

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

    const img =
      cate?.imageurl ||
      cate?.lastpageimageurl ||
      cate?.poster ||
      cate?.cover_screenshot ||
      cate?.img_url;

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
      prices: { actual: actualPrices, sale: {} },
      isOnSale: false,
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
            }}
          >
            <Box
              component="img"
              src={cate?.imageurl || cate?.lastpageimageurl || cate?.poster || cate?.cover_screenshot || cate?.img_url}
              onClick={handleToggleZoom}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
                transition: "transform 0.3s ease-in-out",
                transform: isZoomed ? "scale(1.5)" : "scale(1)",
                cursor: isZoomed ? "zoom-out" : "zoom-in",
              }}
            />
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
                  const price = getPriceForKey(opt.key);
                  const disabled = price <= 0;

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

                      <Typography variant="h5">{disabled ? "—" : `£${price.toFixed(2)}`}</Typography>
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
