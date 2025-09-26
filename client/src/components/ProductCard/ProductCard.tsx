import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";

type ProductTypes = {
  poster: string;
  tabsSlider?: boolean;
  openModal?: () => void;
};

const ProductCard = (props: ProductTypes) => {
  const { poster, tabsSlider, openModal } = props;

  return (
    <Box
      component={"div"}
      onClick={openModal}
      sx={{
        width: { md: "182px", sm: "", xs: "180px" },
        height: tabsSlider
          ? { md: "280px", sm: "", xs: "200px" }
          : { md: "270px", sm: "", xs: "200px" },
        borderRadius: tabsSlider ? 2 : 3,
        bgcolor: COLORS.white,
        border: tabsSlider ? "1px solid lightGray" : 0,
        py: tabsSlider ? 0 : "8px",
        px: tabsSlider ? 0 : "8px",
        cursor: "pointer",
      }}
    >
      <Box
        component={"img"}
        src={poster}
        alt="productImg"
        sx={{
          width: { md: tabsSlider ? "180px" : "168px", sm: "", xs: "165px" },
          height: "100%",
          objectFit: "cover",
          borderRadius: tabsSlider ? 2 : 2,
        }}
      />
    </Box>
  );
};

export default ProductCard;
