import { Box, Typography } from "@mui/material";
import LandingButton from "../LandingButton/LandingButton";
import type { CategoryType } from "../ProductPopup/ProductPopup";
import toast from "react-hot-toast";
import { useCartStore } from "../../stores";

type BasketType = {
  id?: string | number;
  title?: string;
  poster: string;
  price?: string;
  saleprice?: string;
  category?: string;
  sales?: boolean;
  openModal?: (user: CategoryType) => void;
};

const BasketCard = (props: BasketType) => {
  const { poster, price, sales, id, title, category, saleprice, openModal } =
    props;

  const { addToCart } = useCartStore();

  // Store Card in the context API.
  const handleAddToCart = () => {
    addToCart({
      id: id,
      img: poster,
      title: title,
      price: price,
      category: category ? category : "default",
    });
    toast.success("Product add to store");
  };

  return (
    <Box
      component={"div"}
      sx={{
        borderRadius: 2,
        width: { md: "250px", sm: " 250px", xs: "100%" },
        height: "450px",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <Box
        component={"img"}
        src={poster}
        onClick={() =>
          openModal?.({
            id,
          })
        }
        alt="backetImg"
        sx={{
          width: { md: "250px", sm: " 250px", xs: "100%" },
          height: { md: "300px", sm: "300px", xs: "400px" },
          objectFit: "cover",
          borderRadius: 2,
          "&:hover": { transform: "scale(1.03)" },
          transition: "transform 0.3s ease",
        }}
      />

      <Box
        sx={{
          dsiplay: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ pt: 1, pb: 1, fontSize: "23px", fontWeight: 300 }}>
          {sales && (
            <span
              style={{
                fontSize: "18px",
                textDecoration: "line-through",
                color: "Gray",
                marginRight: 3,
              }}
            >
              £{price}
            </span>
          )}
          £{sales ? saleprice : price}
        </Typography>
        {/* {sales && (
          <Rating name="half-rating" defaultValue={2.5} precision={0.5} />
        )} */}
      </Box>

      <LandingButton
        title="Add To Basket"
        width="100%"
        variant="outlined"
        onClick={handleAddToCart}
      />
    </Box>
  );
};

export default BasketCard;
