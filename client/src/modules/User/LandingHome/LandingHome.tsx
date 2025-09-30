import { Box } from "@mui/material";
import CategoryCard from "../../../components/CategoryCard/CategoryCard";
import MainLayout from "../../../layout/MainLayout";
import { CATEGORIES_DATA } from "../../../constant/data";
import ProductCard from "../../../components/ProductCard/ProductCard";
import AdvertisementCard from "../../../components/AdvertisementCard/AdvertisementCard";
import PersonalGift from "../../../components/PersonalGift/PersonalGift";
import Banner from "../../../components/Banner/Banner";
import BirthdaySlider from "../../../components/BirthdaySlider/BirthdaySlider";
import VIPFunky from "../../../components/VIP-Funky/VIP-Funky";
import BasketSlider from "../../../components/BasketSlider/BasketSlider";
import FunkyApp from "../../../components/FunkyApp/FunkyApp";
import Description from "../../../components/Description/Description";
import { COLORS } from "../../../constant/color";
import { useQuery } from "@tanstack/react-query";
import CommingSoonOffers from "../../../components/CommingSoon/CommingSoon";

const AdverstisementCard = [
  {
    title: "Calendars",
    price: "price £10",
    poster: "/assets/images/Calendar.jpg",
  },
  {
    title: "Personlised Gifts",
    price: "price £20",
    poster: "/assets/images/PersonlisedImg.jpg",
  },
  {
    title: "Anniversary Gift",
    price: "",
    poster: "assets/images/Anniversary.jpg",
  },
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
            gap: { xs: 1, sm: 2, md: 3 },
            alignItems: "center",
            overflowX: "auto",
            width: "100%",
            p: { xs: 1, sm: 2, md: 3 },
            justifyContent: { xs: "flex-start", md: "center" },
            m: "auto",
            "&::-webkit-scrollbar": {
              height: "6px",
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
            gap:{md: "13px",sm: "13px",xs:'5px'},
            alignItems: "center",
            overflowX: "auto",
            width: { lg: "99.4%" },
            mr: {md:"5px",sm:"5px",xs:0},
            ml: {md:"5px",sm:"5px",xs:0},
            pb: {md:5,sm:3,xs:2},
            mt: { md: "-90px", sm: "", xs: 0 },
            zIndex: 100,
            position: "relative",
            "&::-webkit-scrollbar": {
              height: "8px",
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
              <AdvertisementCard
                title={e.title}
                price={e.price}
                poster={e.poster}
                key={e.title}
              />
            ))}
          </Box>
        </Box>

        {/* Birthday Slider CArd */}
        <BirthdaySlider
          title="Make it a Birthday to Remember!..."
          description="Show you give a DIY and celebrate their birthday with a personalised card for him, for her or for kids!"
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
        <CommingSoonOffers />

        {/* Just advertisemtn */}
        {/* <GiveFunk /> */}

        {/* For App monatization */}
        <FunkyApp />

        {/* Description */}
        <Description />
        <br />
      </Box>

      {/* OfferModal */}
      {/* {isOpenOfferModal && (
        <OfferModal open={isOpenOfferModal} onClose={closeOfferModal} />
      )} */}
    </MainLayout>
  );
};

export default LandingHome;
