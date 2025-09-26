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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  borderRadius: 3,
  //   p: 2,
};

export type CategoryType = {
  id?: string | number;
  title?: string;
  poster?: string;
  description?: string;
  price?: number;
  openModal?: (cate: CategoryType) => void;
};

type ProductsPopTypes = {
  open: boolean;
  onClose: () => void;
  cate?: CategoryType;
};
const plans = [
  {
    id: "square-card",
    title: "Square Card",
    desc: "For the little message",
    price: 3.99,
  },
  {
    id: "large square card",
    title: "Large Square Card",
    desc: "IDEA Favourite",
    price: 4.99,
  },
];

const ProductPopup = (props: ProductsPopTypes) => {
  const { open, onClose, cate } = props;


  const [selectedPlan, setSelectedPlan] = useState<string>("square-card");
  const [isZoomed, setIsZoomed] = useState(false);

  const navigate = useNavigate();

  const handlePersonalize = () => {
    if (!cate) return;

    navigate(`${USER_ROUTES.HOME}/${cate.id}`, {
      state: {
        poster: cate.poster,
        plan: selectedPlan,
      },
    });
  };

  const handleToggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(27, 27, 27, 0.06)",
          },
        }}
      >
        <Box sx={style}>
          <Box sx={{ display: "flex", p: 2, gap: 2 }}>
            <Box
              sx={{
                width: "50%",
                height: 500,
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={cate?.poster}
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
            <Box sx={{ width: "50%" }}>
              <Typography
                sx={{
                  fontSize: "20px",
                  mb: 3,
                  fontWeight: "bold",
                }}
              >
                Select Sizes
              </Typography>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {plans.map((plan) => (
                  <Box
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    sx={{
                      ...isActivePay,
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
                        <Typography fontWeight={600}>{plan.title}</Typography>
                        <Typography fontSize={"13px"}>{plan.desc}</Typography>
                        <Typography variant="h6">£{plan.price}</Typography>
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
                      fontSize: "20px",
                      color: "#212121",
                      p: 1,
                    }}
                  >
                    Free postage on standard cards - use code FREEPOSTAGE 💫
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
                />
                <LandingButton
                  title="Personlize"
                  width="150px"
                  personal
                  onClick={handlePersonalize}
                />
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 0, right: 4 }}
          >
            <Close fontSize="large" sx={{ color: COLORS.primary }} />
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
