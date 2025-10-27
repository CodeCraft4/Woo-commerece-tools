import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";

type ProductTypes = {
  poster: string;
  tabsSlider?: boolean;
  openModal?: () => void;
  data?: any;
  layoutCard?: any;
  borderColor?: string;
};

const ProductCard = (props: ProductTypes) => {
  const { poster, tabsSlider, openModal, borderColor } = props;
  return (
    <Box
      component={"div"}
      onClick={openModal}
      sx={{
        width: tabsSlider
          ? { md: "182px", sm: "", xs: "100%" }
          : { md: "182px", sm: "", xs: "100%" },
        height: tabsSlider
          ? { md: "280px", sm: "", xs: "350px" }
          : { md: "270px", sm: "", xs: "250px" },
        borderRadius: 3,
        bgcolor: COLORS.white,
        border: tabsSlider ? `1px solid lightGray` : `4px solid ${borderColor}`,
        cursor: "pointer",
        justifyContent:'center',
        display:'flex',
        mx: "auto",
      }}
    >
      <Box
        component={"img"}
        src={poster}
        alt="productImg"
        sx={{
          width: tabsSlider
            ? { md: "180px", sm: "180px", xs: "100%" }
            : { md: "168px", sm: "180px", xs: "100%" },
          height: "100%",
          objectFit: "cover",
          borderRadius: 2,
        }}
      />
    </Box>
  );
};

export default ProductCard;
