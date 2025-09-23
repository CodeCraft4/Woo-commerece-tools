import { Box } from "@mui/material";
import CategoryCard from "../../../components/CategoryCard/CategoryCard";
import MainLayout from "../../../layout/MainLayout";
import { CATEGORIES_DATA } from "../../../constant/data";
import ProductCard from "../../../components/ProductCard/ProductCard";
import AdvertisementCard from "../../../components/AdvertisementCard/AdvertisementCard";
import PersonalGift from "../../../components/PersonalGift/PersonalGift";
import GiveFunk from "../../../components/GiveFunk/GiveFunk";
import Banner from "../../../components/Banner/Banner";
import BirthdaySlider from "../../../components/BirthdaySlider/BirthdaySlider";
import VIPFunky from "../../../components/VIP-Funky/VIP-Funky";
import CommingSoonOffers from "../../../components/CommingSoon/CommingSoon";
import BasketSlider from "../../../components/BasketSlider/BasketSlider";
import FunkyApp from "../../../components/FunkyApp/FunkyApp";
import Description from "../../../components/Description/Description";
import { COLORS } from "../../../constant/color";

const LandingHome = () => {
  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          gap: { md: "25px", sm: "20px", xs: "10px" },
          alignItems: "center",
          overflowX: "auto",
          width: { lg: "90%" },
          p: 3,
          justifyContent: "center",
          m: "auto",

          "&::-webkit-scrollbar": {
            height: "10px",
            width:'100px'
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: COLORS.primary, // <-- scrollbar thumb
            borderRadius: "20px",
          },
        }}
      >
        {CATEGORIES_DATA.map((cate) => (
          <CategoryCard id={cate.id} poster={cate.poster} title={cate.title} />
        ))}
      </Box>

      <Banner />

      <Box
        sx={{
          display: "flex",
          gap: "15px",
          alignItems: "center",
          overflowX: "auto",
          width: { lg: "100%" },
          p: 2,
          mt: { md: "-100px", sm: "", xs: 0 },
          zIndex: 100,
          position: "relative",
          "&::-webkit-scrollbar": {
            height: "13px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: COLORS.primary,
            borderRadius: "20px",
          },
        }}
      >
        {CATEGORIES_DATA.map((cate) => (
          <ProductCard poster={cate.poster} />
        ))}
      </Box>
      <br />
      <br />
      <Box sx={{ p: 2, width: "100%", justifyContent: "center", m: "auto" }}>
        <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "block" },
            justifyContent: "space-between",
          }}
        >
          {[1, 2, 3].map((_) => (
            <AdvertisementCard />
          ))}
        </Box>
      </Box>
      <br />
      <br />
      <BirthdaySlider
        title="Make it a Birthday to Remember!..."
        description="Show you give a funk and celebrate their birthday with a personalised card for him, for her or for kids!"
      />
      <br />
      <br />
      <VIPFunky />
      <br />
      <br />
      <CommingSoonOffers />
      <BirthdaySlider
        title={"Christmas is Coming..."}
        description="Avoid the festive fluster and get Christmas sorted for your flock early with Christmas cards and gift ideas they'll love!"
      />

      <Box sx={{ p: { md: 4, sm: 3, p: 1 } }}>
        <PersonalGift />
      </Box>

      <BirthdaySlider
        title={"Brands You'll Love"}
        description="Dive into a selection of gift ideas from all their favourite brands, from sweet treats to self care, LEGO®, and more!"
        brandSlider={true}
      />
      <br />
      <br />
      <BasketSlider
        title="Brighten Their Day"
        description="Get into the summer mood with a selection of our favourite seasonal flowers and top picks."
      />
      <br />
      <br />
      <BasketSlider title="Sale!" saleSlide={true} />
      <Box sx={{ p: { md: 3, sm: 3, xs: 1 } }}>
        <GiveFunk />
      </Box>
      <Box sx={{ p: { md: 3, sm: 3, xs: 1 } }}>
        <FunkyApp />
      </Box>
      <Box sx={{ p: { md: 3, sm: 3, xs: 1 } }}>
        <Description />
      </Box>
      <br />
      <br />
      <br />
    </MainLayout>
  );
};

export default LandingHome;
