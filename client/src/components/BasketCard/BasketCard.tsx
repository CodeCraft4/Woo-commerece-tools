import { Box, Typography } from "@mui/material";
import LandingButton from "../LandingButton/LandingButton";
import type { CategoryType } from "../ProductPopup/ProductPopup";

type BasketType = {
  poster: string;
  price: string;
  sales?: boolean;
  openModal?: (user: CategoryType) => void;
};

const BasketCard = (props: BasketType) => {
  const { poster, price, sales } = props;

  return (
    <Box
      component={"div"}
      // onClick={openModal}
      sx={{ borderRadius: 2, width: "250px", height: "450px",overflow:'hidden' }}
    >
      <Box
        component={"img"}
        src={poster}
        alt="backetImg"
        sx={{
          width: "250px",
          height: "300px",
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
                fontSize: "16px",
                textDecoration: "line-through",
                color: "Gray",
                marginRight: 3,
              }}
            >
              £6.99
            </span>
          )}
          {price}
        </Typography>
        {/* {sales && (
          <Rating name="half-rating" defaultValue={2.5} precision={0.5} />
        )} */}
      </Box>

      <LandingButton title="Add To Basket" width="100%" variant="outlined" />
    </Box>
  );
};

export default BasketCard;
