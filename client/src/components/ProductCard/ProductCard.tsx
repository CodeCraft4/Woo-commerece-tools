import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";

type ProductTypes = {
  poster: string;
  tabsSlider?: boolean;
};

const ProductCard = (props: ProductTypes) => {
  const { poster, tabsSlider } = props;
  return (
    <Box
      sx={{
        width:{md:'200px',sm:'',xs:'180px'},
        height:{md:"270px",sm:'',xs:'200px'},
        borderRadius: tabsSlider ? 3 : 3,
        bgcolor: COLORS.white,
        border: tabsSlider ?"1px solid lightGray" : 0,
        py: tabsSlider ? 0 : '8px',
        px: tabsSlider ? 0 : '8px',
      }}
    >
      <Box
        component={"img"}
        src={poster}
        alt="productImg"
        sx={{
          width:{md: tabsSlider ? "197px" : "180px",sm:'',xs:'165px'},
          height: "100%",
          objectFit: "cover",
          borderRadius: tabsSlider ? 3 : 2,
        }}
      />
    </Box>
  );
};

export default ProductCard;
