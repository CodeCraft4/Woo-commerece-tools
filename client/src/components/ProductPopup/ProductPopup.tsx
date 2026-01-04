import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useMemo, useState } from "react";
import LandingButton from "../LandingButton/LandingButton";
import { IconButton } from "@mui/material";
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
import { useCartStore, type SizeKey, type PriceTable } from "../../stores/cartStore";
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

function computePrice(base: number, key: "a4" | "a3" | "us_letter") {
  if (key === "a3") return base + 2;
  if (key === "us_letter") return base + 4;
  return base;
}

function clearEditorStorage(opts?: { all?: boolean }) {
  if (opts?.all) {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch { }
    return;
  }
  try {
    const KEYS = ["selectedSize", "selectedVariant", "categorieTemplet", "3dModel", "selectedPrices"];
    KEYS.forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem("slides");
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("templetEditor:draft:")) localStorage.removeItem(key);
    }
  } catch { }
}

export type CategoryType = {
  id?: string | number;
  category?: string;

  cardname?: string;
  cardName?: string;
  title?: string;

  cardcategory?: string;
  cardCategory?: string;

  description?: string;

  img_url?: string;
  poster?: string;
  imageurl?: string;
  lastpageimageurl?: string;
  cover_screenshot?: string;

  polygonlayout?: any;

  actualprice?: number | string;
  actualPrice?: number | string;

  a4price?: number;
  a5price?: number;
  usletter?: number;

  salea4price?: number;
  salea5price?: number;
  saleusletter?: number;

  __type?: "card" | "template";
};

type ProductsPopTypes = {
  open: boolean;
  onClose: () => void;
  cate?: CategoryType | any;
  isTempletDesign?: boolean;

  /** if undefined -> auto sale per selected size */
  salePrice?: boolean;

  /** default = "add", in cart page use "edit" */
  mode?: "add" | "edit";
  initialPlan?: SizeKey;
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

const ProductPopup = (props: ProductsPopTypes) => {
  const { open, onClose, cate, isTempletDesign, salePrice, mode = "add", initialPlan = "a4" } = props;
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SizeKey>(initialPlan);
  const [isZoomed, setIsZoomed] = useState(false);

  const { resetSlide1State } = useSlide1();
  const { resetSlide2State } = useSlide2();
  const { resetSlide3State } = useSlide3();
  const { resetSlide4State } = useSlide4();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { addToCart, updateCartItem } = useCartStore();

  const basePrice: number = useMemo(() => {
    const p = cate?.actualPrice ?? cate?.actualprice ?? 2;
    const n = Number(p);
    return Number.isFinite(n) ? n : 2;
  }, [cate]);

  const actualPrices: PriceTable = {
    a4: toNumberSafe(cate?.a4price, computePrice(basePrice, "a4")),
    a3: toNumberSafe(cate?.a5price, computePrice(basePrice, "a3")),
    us_letter: toNumberSafe(cate?.usletter, computePrice(basePrice, "us_letter")),
  };

  const salePrices = {
    a4: toNumberSafe(cate?.salea4price, 0),
    a3: toNumberSafe(cate?.salea5price, 0),
    us_letter: toNumberSafe(cate?.saleusletter, 0),
  } as const;

  const sizeOptions: Array<{ key: SizeKey; title: string; sub?: string }> = [
    { key: "a4", title: "A4 Paper (Folded A5 Card)", sub: "For the little message" },
    { key: "a3", title: "A3 Paper (Folded A4 Card)", sub: "IDEA Favourite" },
    { key: "us_letter", title: "US Letter (Half US Letter Folded Card)", sub: "For a big impression" },
  ];

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
    setLoading(true);

    clearEditorStorage({ all: false });


    const selectedVariant = {
      key: selectedPlan,
      title: sizeOptions.find((s) => s.key === selectedPlan)?.title || selectedPlan,
      price: display.price,
      basePrice,
    };

    try {
      localStorage.setItem("selectedVariant", JSON.stringify(selectedVariant));
      localStorage.setItem("selectedSize", selectedPlan);
      localStorage.setItem(
        "selectedPrices",
        JSON.stringify({
          a4: useSaleForSelected ? salePrices.a4 : actualPrices.a4,
          a5: useSaleForSelected ? salePrices.a3 : actualPrices.a3,
          us_letter: useSaleForSelected ? salePrices.us_letter : actualPrices.us_letter,
        })
      );
    } catch { }

    resetSlide1State();
    resetSlide2State();
    resetSlide3State();
    resetSlide4State();

    if (isTempletDesign && user) {
      const row = cate?.templetDesign ?? cate; // full DB row (if present)

      const raw =
        cate?.rawStores ??            // from openEdit mapping
        row?.raw_stores ??            // DB key
        row?.rawStores ??             // alt key
        row?.raw_Stores ??            // alt key
        row;                          // last fallback

      const routeCategory =
        row?.category ??
        raw?.category ??
        cate?.category ??
        cate?.cardcategory ??
        "general";

      navigate(`${USER_ROUTES.TEMPLET_EDITORS}/${encodeURIComponent(routeCategory)}/${row?.id ?? cate.id}`, {
        state: { templetDesign: raw }, // ✅ THIS MUST BE RAW STORES
      });

      setLoading(false);
      return;
    }


    if (user) {

      const isContinueDraft = Boolean((cate as any).__draft === true);

    const draftId = isContinueDraft
      ? ensureDraftCardId(String(cate?.id ?? "")) // id is draft card_id uuid
      : (() => {
          // ✅ New card: force new id so it creates a NEW draft later
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

    const type = (cate?.__type ?? (isTempletDesign ? "template" : "card")) as "card" | "template";

    const img =
      cate?.imageurl ||
      cate?.lastpageimageurl ||
      cate?.poster ||
      cate?.cover_screenshot ||
      cate?.img_url;

    const title = cate?.cardname || cate?.cardName || cate?.title || "Untitled";

    const category =
      cate?.category ??
      cate?.cardcategory ??
      cate?.cardCategory ??
      "default";

    // ✅ robust: template data can be either cate.templetDesign OR cate itself
    const templetRow = cate?.templetDesign ?? cate;
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

      // ✅ editor data rules
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
              src={
                cate?.imageurl || cate?.lastpageimageurl || cate?.poster || cate?.cover_screenshot || cate?.img_url
              }
              onClick={handleToggleZoom}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease-in-out",
                transform: isZoomed ? "scale(1.5)" : "scale(1)",
                cursor: isZoomed ? "zoom-out" : "zoom-in",
              }}
            />
          </Box>

          <Box sx={{ width: { md: "50%", sm: "50%", xs: "100%" } }}>
            <Typography sx={{ fontSize: "20px", mb: { md: 3, sm: 3, xs: 0 }, fontWeight: "bold" }}>
              Select Size
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: { md: "20px", sm: "20px", xs: "10px" } }}>
              {sizeOptions.map((opt) => {
                const p = pickPrice(actualPrices, useSaleForSelected ? salePrices : undefined, opt.key);
                return (
                  <Box
                    key={opt.key}
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
                        {opt.sub && (
                          <Typography fontSize={{ md: "13px", sm: "13px", xs: "10px" }}>{opt.sub}</Typography>
                        )}
                      </Box>
                    </Box>

                    <Typography variant="h5">
                      £{Number(p.price).toFixed(2)}
                      {p.isOnSale}
                    </Typography>
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
                  }}
                >
                  {cate?.description} 💫
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: "15px", justifyContent: "center", m: "auto", mt: 4 }}>
              <LandingButton
                title={mode === "edit" ? "Update basket" : "Add to basket"}
                variant="outlined"
                width="150px"
                personal
                onClick={handleAddOrUpdateCart}
              />
              <LandingButton title="Personalise" width="150px" personal loading={loading} onClick={handlePersonalize} />
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