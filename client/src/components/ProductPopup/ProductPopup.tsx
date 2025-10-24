import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import LandingButton from "../LandingButton/LandingButton";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { COLORS } from "../../constant/color";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../constant/route";
import { useCartStore } from "../../stores";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { md: 800, sm: 800, xs: "90%" },
  bgcolor: "background.paper",
  borderRadius: 3,
  //   p: 2,
};

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
  polygonLayout?: {
    elements?: LayoutElement[];
    textElements?: LayoutElement[];
  };
  openModal?: (cate: CategoryType) => void;
};

type ProductsPopTypes = {
  open: boolean;
  onClose: () => void;
  cate?: CategoryType;
};


const ProductPopup = (props: ProductsPopTypes) => {
  const { open, onClose, cate } = props;
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const { addToCart } = useCartStore();

  const [selectedPlan, setSelectedPlan] = useState<string>("square-card");
  const [isZoomed, setIsZoomed] = useState(false);

  const handlePersonalize = () => {
    if (!cate) return;
    setLoading(true);

    if (user) {
      setTimeout(() => {
        navigate(`${USER_ROUTES.HOME}/${cate.id}`, {
          state: {
            poster: cate.imageUrl || cate.lastpageImageUrl,
            plan: selectedPlan,
            layout: cate?.polygonLayout,
          },
        });
        setLoading(false);
      }, 2000);
    } else
      setTimeout(() => {
        toast.error("You need to First Login"), navigate(USER_ROUTES.SIGNIN);
        setLoading(false);
      }, 2000);
  };

  const handleToggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  const handleAddToCard = () => {
    addToCart({
      id: cate?.id,
      img: cate?.imageUrl || cate?.lastpageImageUrl,
      category: cate?.cardCategory,
      price: cate?.actualPrice,
      title: cate?.cardName,
    });
    toast.success("Product add to Cart");
  };


  const plans = [
  {
    id: "square-card",
    title: "Square Card",
    desc: "For the little message",
    price: cate?.actualPrice,
  },
  {
    id: "Medium square card",
    title: "Medium Square Card",
    desc: "IDEA Favourite",
    price: cate?.actualPrice + 3,
  },
  {
    id: "large square card",
    title: "Large Square Card",
    desc: "IDEA Favourite",
    price: cate?.actualPrice + 5,
  },
];


  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(10, 10, 10, 0.34)",
            // height:{md:'auto',sm:'auto',xs:'500px'}
          },
        }}
      >
        <Box sx={{ ...style, height: { md: "auto", sm: "auto", xs: "500px" },overflowY:'auto' }}>
          <Box
            sx={{
              display: { md: "flex", sm: "flex", xs: "block" },
              p: 2,
              gap: 2,
            }}
          >
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
                src={cate?.imageUrl || cate?.lastpageImageUrl}
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
              <Typography
                sx={{
                  fontSize: "20px",
                  mb: { md: 3, sm: 3, xs: 0 },
                  fontWeight: "bold",
                }}
              >
                Select Sizes
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { md: "20px", sm: "20px", xs: "10px" },
                }}
              >
                {plans.map((plan) => (
                  <Box
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    sx={{
                      ...isActivePay,
                      height:{md:'auto',sm:'auto',xs:'60px'},
                      border: `3px solid ${
                        selectedPlan === plan.id ? "#004099" : "transparent"
                      }`,
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
                        <Typography sx={{fontWeight:600,fontSize:{md:'auto',sm:'auto',xs:'12px'}}}>{plan.title}</Typography>
                        <Typography fontSize={{md:"13px",sm:'13px',xs:'10px'}}>{plan.desc}</Typography>
                        <Typography fontSize={{md:'18px',sm:'18px',xs:'14px'}}>£{plan.price}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5">£{plan.price}</Typography>
                  </Box>
                ))}

                <Box>
                  <Typography
                    sx={{
                      ...isActivePay,
                      bgcolor: "#ffd3db",
                      fontSize: {md:"20px",sm:'16px',xs:'14px'},
                      color: "#212121",
                      p: 1,
                    }}
                  >
                    {cate?.description}💫
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "center",
                  m: "auto",
                  mt: 4,
                }}
              >
                <LandingButton
                  title="Add to basket"
                  variant="outlined"
                  width="150px"
                  personal
                  onClick={handleAddToCard}
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
            sx={{ position: "absolute", top: 0, right: 4 }}
          >
            <Close fontSize="large" sx={{ color: COLORS.black }} />
          </IconButton>
        </Box>
      </Modal>
    </div>
  );
};

export default ProductPopup;

const isActivePay = {
  display: "flex",
  gap: "4px",
  justifyContent: "space-between",
  alignItems: "center",
  bgcolor: "#e9fbffff",
  p: "3px",
  borderRadius: 2,
  boxShadow: "3px 7px 8px #eff1f1ff",
};
