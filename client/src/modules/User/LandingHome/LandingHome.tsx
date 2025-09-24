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
import BasketSlider from "../../../components/BasketSlider/BasketSlider";
import FunkyApp from "../../../components/FunkyApp/FunkyApp";
import Description from "../../../components/Description/Description";
import { COLORS } from "../../../constant/color";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import useModal from "../../../hooks/useModal";
import OfferModal from "../../../components/OfferModal/OfferModal";

const AdverstisementCard = [
  "Birthday Gifts",
  "Personlised Gifts",
  "Anniversary Gift",
];

const LandingHome = () => {
  const fetchMockCategories = async () => {
    return new Promise<typeof CATEGORIES_DATA>((resolve) => {
      resolve(CATEGORIES_DATA);
    });
  };

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchMockCategories,
  });

  const {
    open: isOpenOfferModal,
    openModal: openOfferModal,
    closeModal: closeOfferModal,
  } = useModal();

  useEffect(() => {
    setTimeout(() => {
      openOfferModal();
    }, 400);
  }, []);

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          width: "100%",
        }}
      >
        {/* Categories */}

        <Box
          sx={{
            display: "flex",
            gap: { md: "20px", sm: "20px", xs: "10px" },
            alignItems: "center",
            overflowX: "scroll",
            width: { lg: "100%" },
            p: 3,
            justifyContent: "center",
            m: "auto",
            "&::-webkit-scrollbar": {
              height: "10px",
              width: "100px",
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
          {categories?.map((cate) => (
            <CategoryCard
              key={cate.id}
              id={cate.id}
              poster={cate.poster}
              title={cate.title}
            />
          ))}
        </Box>

        {/* Banner Area */}
        <Banner />

        {/* Horizental Scroll Cards */}
        <Box
          sx={{
            display: "flex",
            gap: "13px",
            alignItems: "center",
            overflowX: "auto",
            width: { lg: "99%" },
            mr: "5px",
            ml: "5px",
            pb: 5,
            mt: { md: "-80px", sm: "", xs: 0 },
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
          {categories?.map((cate) => (
            <ProductCard poster={cate.poster} />
          ))}
        </Box>

        {/* Advertisement Card */}
        <Box sx={{ width: "100%", justifyContent: "center", m: "auto" }}>
          <Box
            sx={{
              display: { md: "flex", sm: "flex", xs: "block" },
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            {AdverstisementCard.map((e) => (
              <AdvertisementCard title={e} />
            ))}
          </Box>
        </Box>

        {/* Birthday Slider CArd */}
        <BirthdaySlider
          title="Make it a Birthday to Remember!..."
          description="Show you give a funk and celebrate their birthday with a personalised card for him, for her or for kids!"
        />

        {/* VIP Funkey just for offer */}
        <VIPFunky />

        {/* Basket Slider Cards */}
        <BasketSlider
          title="Brighten Their Day"
          description="Get into the summer mood with a selection of our favourite seasonal flowers and top picks."
        />

        {/* Personal Gift */}
        <PersonalGift />

        {/* Basket Card Sales */}
        <BasketSlider title="Sale!" saleSlide={true} />

        {/* Comming Offers */}
        {/* <CommingSoonOffers /> */}

        {/* Just advertisemtn */}
        <GiveFunk />

        {/* For App monatization */}
        <FunkyApp />

        {/* Description */}
        <Description />
        <br />
      </Box>

      {/* OfferModal */}
      {isOpenOfferModal && (
        <OfferModal open={isOpenOfferModal} onClose={closeOfferModal} />
      )}
    </MainLayout>
  );
};

export default LandingHome;
