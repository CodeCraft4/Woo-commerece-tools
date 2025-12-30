import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState, useMemo } from "react";
import LandingButton from "../LandingButton/LandingButton";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../constant/route";
import { useCartStore } from "../../stores";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useSlide2 } from "../../context/Slide2Context";
import { useSlide3 } from "../../context/Slide3Context";
import { useSlide4 } from "../../context/Slide4Context";
import { useSlide1 } from "../../context/Slide1Context";
import { COLORS } from "../../constant/color";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { md: 800, sm: 700, xs: "90%" },
  bgcolor: "background.paper",
  borderRadius: 3,
};

// keep your old helper (still used as fallback)
function computePrice(base: number, key: "a4" | "a5" | "us_letter") {
  if (key === "a5") return base + 2;
  if (key === "us_letter") return base + 4;
  return base;
}

function clearEditorStorage(opts?: { all?: boolean }) {
  if (opts?.all) {
    try { localStorage.clear(); sessionStorage.clear(); } catch { }
    return;
  }
  try {
    const KEYS = ["selectedSize", "selectedVariant", "categorieTemplet", "3dModel", "selectedPrices"];
    KEYS.forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem("slides");
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("templetEditor:draft:")) {
        localStorage.removeItem(key);
      }
    }
  } catch { }
}

export type LayoutElement = {
  id: string;
  src?: string;
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
};

export type CategoryType = {
  imageUrl?: string;
  id?: string | number;
  cardName?: string;
  poster?: string;
  description?: string;
  cardCategory?: string;
  actualPrice?: number | string | any;
  lastpageImageUrl?: string;
  cover_screenshot?: string;
  polygonLayout?: {
    elements?: LayoutElement[];
    textElements?: LayoutElement[];
  };
  openModal?: (cate: CategoryType) => void;
  // DB pricing (lowercase keys you asked for)
  a4price?: number;
  a5price?: number;
  usletter?: number;
  // tolerate alternate casings just in case:
  A4price?: number;
  A5price?: number;
  usLetter?: number;
  imageurl?: string;
  lastpageimageurl?: string;
  polygonlayout?: any;
  cardname?: string;
};

type ProductsPopTypes = {
  open: boolean;
  onClose: () => void;
  cate?: CategoryType | any;
  isTempletDesign?: boolean;
  salePrice?: boolean
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

const ProductPopup = (props: ProductsPopTypes) => {
  const { open, onClose, cate, isTempletDesign, salePrice } = props;
  const [loading, setLoading] = useState(false);
  const { resetSlide1State } = useSlide1();
  const { resetSlide2State } = useSlide2();
  const { resetSlide3State } = useSlide3();
  const { resetSlide4State } = useSlide4();

  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  const [selectedPlan, setSelectedPlan] = useState<"a4" | "a5" | "us_letter">("a4");
  const [isZoomed, setIsZoomed] = useState(false);

  // base fallback (kept)
  const basePrice: number = useMemo(() => {
    const p = (cate?.actualPrice ?? cate?.actualprice ?? 2);
    const n = Number(p);
    return Number.isFinite(n) ? n : 2;
  }, [cate]);

  // Read exact DB values (robust to A4/A5 uppercase or usLetter)
  const a4Price = Number(cate?.a4price ?? cate?.A4price ?? computePrice(basePrice, "a4"));
  const a5Price = Number(cate?.a5price ?? cate?.A5price ?? computePrice(basePrice, "a5"));
  const usPrice = Number(cate?.usletter ?? cate?.usLetter ?? computePrice(basePrice, "us_letter"));

  const SaleA4Price = Number(cate?.salea4price ?? cate?.salea4price ?? computePrice(basePrice, "a4"));
  const SaleA5Price = Number(cate?.salea5price ?? cate?.salea5price ?? computePrice(basePrice, "a5"));
  const SaleUsPrice = Number(cate?.saleusletter ?? cate?.saleusletter ?? computePrice(basePrice, "us_letter"));

  const sizeOptions: Array<{ key: "a4" | "a5" | "us_letter"; title: string; sub?: string; value: number }> = [
    { key: "a4", title: "A4", sub: "For the little message", value: a4Price },
    { key: "a5", title: "A3", sub: "IDEA Favourite", value: a5Price },
    { key: "us_letter", title: "US Letter", sub: "For a big impression", value: usPrice },
  ];

  const handlePersonalize = () => {
    if (!cate) return;
    setLoading(true);

    clearEditorStorage({ all: false });

    // persist the exact selection AND the full per-size prices for subscription page
    const picked = sizeOptions.find(s => s.key === selectedPlan);
    const selectedVariant = {
      key: selectedPlan,
      title: picked?.title || selectedPlan,
      price: picked?.value ?? computePrice(basePrice, selectedPlan),
      basePrice,
    };
    try {
      localStorage.setItem("selectedVariant", JSON.stringify(selectedVariant));
      localStorage.setItem("selectedSize", selectedPlan);
      localStorage.setItem("selectedPrices", JSON.stringify({
        a4: salePrice ? SaleA4Price : a4Price,
        a5: salePrice ? SaleA5Price : a5Price,
        us_letter: salePrice ? SaleUsPrice : usPrice,
      }));
    } catch { }

    resetSlide1State();
    resetSlide2State();
    resetSlide3State();
    resetSlide4State();

    if (isTempletDesign && user) {
      setTimeout(() => {
        navigate(`${USER_ROUTES.TEMPLET_EDITORS}/${cate.category}/${cate.id}`, {
          state: { templetDesign: cate },
        });
        setLoading(false);
      }, 600);
      return;
    }

    if (user) {
      setTimeout(() => {
        navigate(`${USER_ROUTES.HOME}/${cate.id}`, {
          state: {
            poster: cate?.imageurl || cate?.lastpageimageurl,
            plan: selectedPlan,
            layout: cate?.polygonlayout,
          },
        });
        setLoading(false);
      }, 600);
      return;
    }

    setTimeout(() => {
      toast.error("You need to First Login");
      navigate(USER_ROUTES.SIGNIN);
      setLoading(false);
    }, 600);
  };

  const handleToggleZoom = () => setIsZoomed(prev => !prev);

  const handleAddToCard = () => {
    const picked = sizeOptions.find(s => s.key === selectedPlan);
    addToCart({
      id: cate?.id,
      img: cate?.imageUrl || cate?.lastpageImageUrl,
      category: cate?.cardCategory,
      price: picked?.value ?? computePrice(basePrice, selectedPlan),
      title: cate?.cardName,
    });
    toast.success("Product add to Cart");
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
        BackdropProps={{ sx: { backgroundColor: "rgba(10, 10, 10, 0.34)" } }}
      >
        <Box sx={{ ...style, height: { md: "auto", sm: "auto", xs: "500px" }, overflowY: 'auto' }}>
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
                {sizeOptions.map((opt) => (
                  <Box
                    key={opt.key}
                    onClick={() => setSelectedPlan(opt.key)}
                    sx={{
                      ...isActivePay,
                      height: { md: 'auto', sm: 'auto', xs: '60px' },
                      border: `3px solid ${selectedPlan === opt.key ? COLORS.seconday : "transparent"}`,
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
                        <Typography sx={{ fontWeight: 600, fontSize: { md: 'auto', sm: 'auto', xs: '12px' } }}>
                          {opt.title}
                        </Typography>
                        {opt.sub && <Typography fontSize={{ md: "13px", sm: '13px', xs: '10px' }}>{opt.sub}</Typography>}
                      </Box>
                    </Box>
                    {
                      salePrice ? (
                        <>
                          {opt.key === "a4" && <Typography variant="h5">£{Number(SaleA4Price).toFixed(2)}</Typography>}
                          {opt.key === "a5" && <Typography variant="h5">£{Number(SaleA5Price).toFixed(2)}</Typography>}
                          {opt.key === "us_letter" && <Typography variant="h5">£{Number(SaleUsPrice).toFixed(2)}</Typography>}</>
                      ) : <>
                        {opt.key === "a4" && <Typography variant="h5">£{Number(a4Price).toFixed(2)}</Typography>}
                        {opt.key === "a5" && <Typography variant="h5">£{Number(a5Price).toFixed(2)}</Typography>}
                        {opt.key === "us_letter" && <Typography variant="h5">£{Number(usPrice).toFixed(2)}</Typography>}</>
                    }
                  </Box>
                ))}

                <Box>
                  <Typography
                    sx={{
                      ...isActivePay,
                      bgcolor: "#4d98a1ff",
                      fontSize: { md: "20px", sm: '16px', xs: '14px' },
                      color: COLORS.white,
                      p: 1.5,
                    }}
                  >
                    {cate?.description} 💫
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: "15px", justifyContent: "center", m: "auto", mt: 4 }}>
                <LandingButton title="Add to basket" variant="outlined" width="150px" personal onClick={handleAddToCard} />
                <LandingButton title="Personalise" width="150px" personal loading={loading} onClick={handlePersonalize} />
              </Box>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 4, right: 4, bgcolor: "black", color: 'white', width: '30px', height: '30px', p: 1, "&:hover": { bgcolor: '#212121' } }}
          >
            <Close fontSize="large" />
          </IconButton>
        </Box>
      </Modal>
    </div>
  );
};

export default ProductPopup;
