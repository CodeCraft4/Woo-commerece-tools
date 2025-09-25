import { Box, Typography } from "@mui/material";
import LandingButton from "../LandingButton/LandingButton";
import type { CategoryType } from "../ProductPopup/ProductPopup";

type BasketType = {
  poster: string;
  price: string;
  openModal?: (user: CategoryType) => void;
};

const BasketCard = (props: BasketType) => {
  const { poster, price } = props;

  return (
    <Box
      component={"div"}
      // onClick={openModal}
      sx={{ borderRadius: 2, width: "300px", height: "500px" }}
    >
      <Box
        component={"img"}
        src={poster}
        alt="backetImg"
        sx={{
          width: "300px",
          height: "350px",
          objectFit: "cover",
          borderRadius: 2,
          "&:hover": { transform: "scale(1.05)" },
          transition: "transform 0.3s ease",
        }}
      />
      <Typography variant="h4" sx={{ p: 1 }}>
        {price}
      </Typography>

      <LandingButton title="Add To Basket" width="100%" variant="outlined" />
    </Box>
  );
};

export default BasketCard;
