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
        width:{md:'250px',sm:'',xs:'180px'},
        height:{md:"400px",sm:'',xs:'250px'},
        borderRadius: tabsSlider ? 3 : 4,
        bgcolor: COLORS.white,
        border: "1px solid lightGray",
        py: tabsSlider ? 0 : '5px',
        px: tabsSlider ? 0 : '5px',
      }}
    >
      <Box
        component={"img"}
        src={poster}
        alt="productImg"
        sx={{
          width:{md: tabsSlider ? "247px" : "230px",sm:'',xs:'165px'},
          height: "100%",
          objectFit: "cover",
          borderRadius: tabsSlider ? 3 : 4,
        }}
      />
    </Box>
  );
};

export default ProductCard;
