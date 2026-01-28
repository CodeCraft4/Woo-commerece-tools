// path: src/components/ProductPopup/ProductPopup.tsx
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
import { useCartStore, type SizeKey } from "../../stores/cartStore";
import { pickPrice, toNumberSafe } from "../../lib/pricing";
import { ensureDraftCardId, newUuid, setDraftCardId } from "../../lib/draftCardId";

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
    } catch { }
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
  } catch { }
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

  saleprice?: number | string;
  salea4price?: number | string;
  salea5price?: number | string;
  saleusletter?: number | string;

  // ✅ new columns
  a3price?: number | string;
  halfusletter?: number | string;
  ustabloid?: number | string;

  salea3price?: number | string;
  salehalfusletter?: number | string;
  saleustabloid?: number | string;

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
  salePrice?: boolean; // undefined -> auto on sale per selected size
  mode?: "add" | "edit";
  initialPlan?: SizeKey;
  priceLoading?:boolean
};

type SizeDef = { key: SizeKey; title: string; sub?: string };

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

const hasValidPrice = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

const getCategoryName = (cate?: CategoryType) => {
  return (
    cate?.category ??
    cate?.cardcategory ??
    cate?.cardCategory ??
    "default"
  );
};

const getSizeDefsForCategory = (categoryName?: string): SizeDef[] => {
  const name = (categoryName ?? "").trim().toLowerCase();

  // Invites: A5, A4, Half US Letter, US Letter
  if (name.includes("invite")) {
    return [
      { key: "a5" as SizeKey, title: "A5", sub: "Prints 2 invites per A4 sheet" },
      { key: "a4" as SizeKey, title: "A4", sub: "Prints 1 invite per A4 sheet" },
      { key: "half_us_letter" as SizeKey, title: "Half US Letter", sub: "Prints 2 invites per US Letter sheet" },
      { key: "us_letter" as SizeKey, title: "US Letter", sub: "Prints 1 invite per US Letter sheet" },
    ];
  }

  // Clothing / Sticker / Wall Art / Photo Art / Bags: A4, A3, US Letter, US Tabloid
  if (
    name.includes("clothing") ||
    name.includes("sticker") ||
    name.includes("wall art") ||
    name.includes("photo art") ||
    name.includes("bag")
  ) {
    return [
      { key: "a4" as SizeKey, title: "A4" },
      { key: "a3" as SizeKey, title: "A3" },
      { key: "us_letter" as SizeKey, title: "US Letter" },
      { key: "us_tabloid" as SizeKey, title: "US Tabloid (11 × 17 in)" },
    ];
  }

  // Notebooks: A5, A4, Half US Letter, US Letter
  if (name.includes("notebook")) {
    return [
      { key: "a5" as SizeKey, title: "A5" },
      { key: "a4" as SizeKey, title: "A4" },
      { key: "half_us_letter" as SizeKey, title: "Half US Letter" },
      { key: "us_letter" as SizeKey, title: "US Letter" },
    ];
  }

  // Mugs: single
  if (name.includes("mug")) {
    return [{ key: "mug_wrap_11oz" as SizeKey, title: "228mm × 88.9mm wrap (11oz mug)" }];
  }

  // Coasters: single
  if (name.includes("coaster")) {
    return [{ key: "coaster_95" as SizeKey, title: "95mm × 95mm (×2 coasters)" }];
  }

  // Default Cards: A5, A4, Half US Letter, US Letter, US Tabloid
  return [
    { key: "a5" as SizeKey, title: "A5" },
    { key: "a4" as SizeKey, title: "A4" },
    { key: "half_us_letter" as SizeKey, title: "Half US Letter" },
    { key: "us_letter" as SizeKey, title: "US Letter" },
    { key: "us_tabloid" as SizeKey, title: "US Tabloid (Folded half: 11 × 8.5 in)" },
  ];
};

const buildPriceTables = (cate: CategoryType | undefined): { actual: any; sale: any } => {
  const actual: any = {};
  const sale: any = {};

  // ✅ mapping from DB columns -> size keys
  actual.a5 = toNumberSafe(cate?.actualprice, 0);

  actual.a4 = toNumberSafe(cate?.a4price, 0);

  // A3 new column preferred; fallback legacy a5price (old apps used it for A3)
  actual.a3 = toNumberSafe((cate as any)?.a3price, toNumberSafe(cate?.a5price, 0));

  actual.us_letter = toNumberSafe(cate?.usletter, 0);
  actual.half_us_letter = toNumberSafe((cate as any)?.halfusletter, 0);
  actual.us_tabloid = toNumberSafe((cate as any)?.ustabloid, 0);

  // single-size categories (mugs/coasters) use actualprice
  actual.mug_wrap_11oz = toNumberSafe(cate?.actualprice, 0);
  actual.coaster_95 = toNumberSafe(cate?.actualprice, 0);

  sale.a5 = toNumberSafe(cate?.saleprice, 0);
  sale.a4 = toNumberSafe(cate?.salea4price, 0);
  sale.a3 = toNumberSafe((cate as any)?.salea3price, toNumberSafe(cate?.salea5price, 0));
  sale.us_letter = toNumberSafe(cate?.saleusletter, 0);
  sale.half_us_letter = toNumberSafe((cate as any)?.salehalfusletter, 0);
  sale.us_tabloid = toNumberSafe((cate as any)?.saleustabloid, 0);

  sale.mug_wrap_11oz = toNumberSafe(cate?.saleprice, 0);
  sale.coaster_95 = toNumberSafe(cate?.saleprice, 0);

  return { actual, sale };
};

const ProductPopup = (props: ProductsPopTypes) => {
  const { open, onClose, cate, isTempletDesign, salePrice, mode = "add", initialPlan ,priceLoading} = props;

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SizeKey>((initialPlan ?? "a4") as SizeKey);
  const [isZoomed, setIsZoomed] = useState(false);

  const { resetSlide1State } = useSlide1();
  const { resetSlide2State } = useSlide2();
  const { resetSlide3State } = useSlide3();
  const { resetSlide4State } = useSlide4();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { addToCart, updateCartItem } = useCartStore();

  const categoryName = useMemo(() => getCategoryName(cate), [cate]);

  const sizeDefs = useMemo(() => getSizeDefsForCategory(categoryName), [categoryName]);

  const { actual: actualPrices, sale: salePrices } = useMemo(() => buildPriceTables(cate), [cate]);

  // ✅ show only sizes that actually have price
  const sizeOptions = useMemo(() => {
    return sizeDefs.filter((d) => hasValidPrice((actualPrices as any)[d.key]));
  }, [sizeDefs, actualPrices]);

  // ✅ auto-select first available size on open/product change
  useEffect(() => {
    if (!open) return;
    const first = sizeOptions[0]?.key;
    if (first) setSelectedPlan(first);
  }, [open, sizeOptions]);

  const useSaleForSelected = useMemo(() => {
    if (salePrice === true) return true;
    if (salePrice === false) return false;
    const v = (salePrices as any)[selectedPlan];
    return Number.isFinite(Number(v)) && Number(v) > 0;
  }, [salePrice, salePrices, selectedPlan]);

  const display = useMemo(() => {
    const picked = pickPrice(actualPrices, useSaleForSelected ? salePrices : undefined, selectedPlan);
    return picked;
  }, [actualPrices, salePrices, selectedPlan, useSaleForSelected]);

  const handleToggleZoom = () => setIsZoomed((prev) => !prev);

  const handlePersonalize = () => {
    if (!cate) return;

    if (!sizeOptions.length) {
      toast.error("No pricing configured for this product.");
      return;
    }

    setLoading(true);
    clearEditorStorage({ all: false });

    const selectedVariant = {
      key: selectedPlan,
      title: sizeOptions.find((s) => s.key === selectedPlan)?.title || String(selectedPlan),
      price: display.price,
      isOnSale: display.isOnSale,
      category: categoryName,
    };

    const selectedProduct = {
      id: cate?.id,
      type: (cate?.__type ?? (isTempletDesign ? "template" : "card")) as "card" | "template",
      title: cate?.cardname || cate?.cardName || cate?.title || "Untitled",
      category: categoryName,
      img:
        cate?.imageurl ||
        cate?.lastpageimageurl ||
        cate?.poster ||
        cate?.cover_screenshot ||
        cate?.img_url,
    };

    try {
      localStorage.setItem("selectedVariant", JSON.stringify(selectedVariant));
      localStorage.setItem("selectedSize", String(selectedPlan));
      localStorage.setItem("selectedPrices", JSON.stringify({ actual: actualPrices, sale: salePrices }));
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
    } catch { }

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

      const routeCategory =
        row?.category ??
        raw?.category ??
        cate?.category ??
        cate?.cardcategory ??
        "general";

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

    const type = (cate?.__type ?? (isTempletDesign ? "template" : "card")) as "card" | "template";

    const img =
      cate?.imageurl ||
      cate?.lastpageimageurl ||
      cate?.poster ||
      cate?.cover_screenshot ||
      cate?.img_url;

    const title = cate?.cardname || cate?.cardName || cate?.title || "Untitled";
    const category = categoryName;

    const templetRow = (cate as any)?.templetDesign ?? cate;
    const rawStores =
      templetRow?.raw_stores ??
      templetRow?.rawStores ??
      templetRow?.stores ??
      undefined;

    const description =
      cate?.description ??
      templetRow?.description ??
      "";

    const payload = {
      id: cate.id,
      type,
      img,
      title,
      category,
      description,
      selectedSize: selectedPlan,
      prices: { actual: actualPrices, sale: salePrices },
      isOnSale: display.isOnSale,
      displayPrice: display.price,
      polygonlayout: type === "card" ? cate?.polygonlayout : undefined,
      templetDesign: type === "template" ? templetRow : undefined,
      rawStores: type === "template" ? rawStores : undefined,
    };

    if (mode === "edit") {
      updateCartItem(cate.id, type, payload);
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
              {priceLoading ? "Select Size" : "Load Pricing"}
            </Typography>

            {priceLoading ? (
              <Box sx={{ height: '75%', width: '100%', }}>
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
                  const p = pickPrice(actualPrices, useSaleForSelected ? salePrices : undefined, opt.key);
                  return (
                    <Box
                      key={String(opt.key)}
                      onClick={() => setSelectedPlan(opt.key)}
                      sx={{
                        ...isActivePay,
                        height: { md: "auto", sm: "auto", xs: "60px" },
                        border: `3px solid ${selectedPlan === opt.key ? "#8D6DA1" : "transparent"}`,
                        cursor: "pointer",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <input
                          type="radio"
                          name="plan"
                          checked={selectedPlan === opt.key}
                          onChange={() => setSelectedPlan(opt.key)}
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: { md: "auto", sm: "auto", xs: "12px" } }}>
                            {opt.title}
                          </Typography>
                          {/* {opt.sub ? (
                            <Typography sx={{ fontSize: 11, opacity: 0.9 }}>{opt.sub}</Typography>
                          ) : null} */}
                        </Box>
                      </Box>

                      <Typography variant="h5">£{Number(p.price).toFixed(2)}</Typography>
                    </Box>
                  );
                })}

                <Box>
                  <Typography
                    sx={{
                      ...isActivePay,
                      bgcolor: "#8D6DA1",
                      fontSize: { md: "20px", sm: "16px", xs: "14px" },
                      color: COLORS.white,
                      p: 1.5,
                      maxHeight: 250,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        height: "4px",
                        width: '4px'
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "#f1f1f1",
                        borderRadius: "20px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: COLORS.gray,
                        borderRadius: "20px",
                      },
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
              />
            </Box>

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
