import { Box } from "@mui/material";
import MainLayout from "../../../layout/MainLayout";
import Banner from "../../../components/Banner/Banner";
import VIPFunky from "../../../components/VIP-Funky/VIP-Funky";
import Description from "../../../components/Description/Description";
import VisualSection from "./components/VisualSection/VisualSection";
import SpecialDIY from "./components/SpecialDIY/SpecialDIY";
import MakeMoments from "./components/MakeMoments/MakeMoments";
import WhyChoose from "./components/WhyChoose/WhyChoose";
import BasketSliderNoTabs from "../../../components/BasketSlider/BasketSlider";
import SubscriptionModelSection from "./components/OurPremiumCards/OurPremiumCards";


// const AdverstisementCard = [
//   {
//     title: "Calendars",
//     price: "price £10",
//     poster: "/assets/images/Calendar.jpg",
//     bgcolor: COLORS.primary,
//   },
//   {
//     title: "Personlised Gifts",
//     price: "price £20",
//     poster: "/assets/images/PersonlisedImg.jpg",
//     bgcolor: COLORS.seconday,
//   },
//   {
//     title: "Anniversary Gift",
//     price: "price £12",
//     poster: "assets/images/Anniversary.jpg",
//     bgcolor: COLORS.green,
//   },
// ];

const LandingHome = () => {
  // const { user } = useAuth();
  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          width: { lg: "1340px", md: "100%", sm: "100%", xs: "100%" },
          justifyContent: "center",
          m: "auto",
          p: { lg: 3, md: 3, sm: 3, xs: 1 },
        }}
      >
        {/* Categories */}
        {/* <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2, md: 3 },
            alignItems: "center",
            overflowX: "auto",
            width: "100%",
            pb: { xs: 1, sm: 2, md: 3 },
            justifyContent: { xs: "flex-start", md: "flex-start" },
            m: "auto",
            "&::-webkit-scrollbar": {
              height: "6px",
              width: '6px',
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
          {
            isLoading && (
              <Box sx={{
                textAlign: 'center'
              }}>Loading...</Box>
            )
          }
          {categories?.map((cate, index) => (
            <CategoryCard
              key={index}
              id={cate.id}
              poster={cate.image_base64}
              title={cate.name}
              borderColor={`${cate.borderColor}`}
            />
          ))}
        </Box> */}

        {/* Banner Area */}
        <Banner />

        {/* Horizental Scroll Cards */}
        {/* <Box
          sx={{
            display: "flex",
            gap: { md: "13px", sm: "5px", xs: "10px" },
            alignItems: "center",
            overflowX: "auto",
            width: { lg: "99.4%", md: "99%", sm: "100%", xs: "100%" },
            mr: { md: "5px", sm: "5px", xs: 0 },
            ml: { md: "5px", sm: "5px", xs: 0 },
            pb: { md: 3, sm: 3, xs: 2 },
            mt: { md: "-90px", sm: "-90px", xs: 0 },
            zIndex: 100,
            position: "relative",
            "&::-webkit-scrollbar": {
              height: "7px",
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
              poster={cate.image_base64}
              title={cate.name}
              borderColor={`${cate.borderColor}`}
              seasonalCard
            />
          ))}
        </Box> */}

        {/* Advertisement Card */}
        {/* <Box sx={{ width: "100%", justifyContent: "center", m: "auto" }}>
          <Box
            sx={{
              display: { md: "flex", sm: "flex", xs: "block" },
              justifyContent: "space-between",
              gap: { lg: "20px", md: "20px", sm: "10px", xs: 0 },
            }}
          >
            {AdverstisementCard.map((e) => (
              <AdvertisementCard
                title={e.title}
                price={e.price}
                poster={e.poster}
                key={e.title}
                bgcolorSide={e.bgcolor}
              />
            ))}
          </Box>
        </Box> */}

        {/* Birthday Slider CArd */}
        {/* <BirthdaySlider
          title="Make it a Birthday to Remember!..."
          description={`DIY Personalisation has been created for busy, creative, or last minute legends who want
          personalised magic without the stress of delivery or high prices`}
        /> */}

        <VisualSection />

        {/* {
          user && <DraftSlider />
        } */}


        {/* Basket Slider Cards */}
        <BasketSliderNoTabs
          title="What would you personalise?"
          description="Shop Personalised cards, invites, gifts, clothing and home decor."
        />

        <MakeMoments />

        <SubscriptionModelSection/>

        <WhyChoose />


        {/* <VideoSection />

        <BasketSlider
          title="Clothing"
          description="Get into the summer mood with a selection of our favourite seasonal Clothing and top picks."
          clothing
        /> */}

        {/* VIP Funkey just for offer */}
        <VIPFunky />

        <SpecialDIY />

        {/* Personal Gift */}
        {/* <PersonalGift /> */}

        {/* Basket Card Sales */}
        {/* <BasketSlider title="Sale!" saleSlide={true} /> */}


        {/* Templet Slider CArd */}
        {/* <TempletsCardSlider
          title="Personalised Home Gifts"
          description="A section of mugs, wall art, candles with personalised designs"
        /> */}

        {/* Comming Offers */}
        {/* <CommingSoonOffers /> */}
        {/* Just advertisemtn */}
        {/* <GiveFunk /> */}
        {/* <BalloonSticker /> */}
        {/* For App monatization */}
        {/* <FunkyApp /> */}

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
