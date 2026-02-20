import { Box } from "@mui/material";
import SmartImage from "../SmartImage/SmartImage";
// import { COLORS } from "../../constant/color";

type ProductTypes = {
  poster: string;
  tabsSlider?: boolean;
  openModal?: () => void;
  data?: any;
  layoutCard?: any;
  borderColor?: string;
  smartCrop?: boolean;
};

const ProductCard = (props: ProductTypes) => {
  const { poster, tabsSlider, openModal, borderColor, smartCrop } = props;
  return (
    <Box
      component={"div"}
      onClick={openModal}
      sx={{
        width: tabsSlider
          ? { md: "100%", sm: "100%", xs: "100%" }
          : { md: "182px", sm: "125px", xs: "157px" },
        height: tabsSlider
          ? { lg: '250px', md: "250px", sm: "240px", xs: "370px" }
          : { md: "270px", sm: "180px", xs: "225px" },
        borderRadius: 3,
        // bgcolor: COLORS.white,
        border: tabsSlider ? `1px solid lightGray` : `4px solid ${borderColor}`,
        cursor: "pointer",
        justifyContent: 'center',
        display: 'flex',
        mx: "auto",
      }}
    >
      <SmartImage
        src={poster}
        alt="productImg"
        enable={!!smartCrop}
        sx={{
          width: tabsSlider
            ? { md: "100%", sm: "100%", xs: "100%" }
            : { md: "175px", sm: "120px", xs: "150px" },
          height: "100%",
          objectFit: { md: "cover", sm: "cover", xs: "cover" },
          objectPosition: "center",
          borderRadius: 2,
        }}
      />
    </Box>
  );
};

export default ProductCard;
