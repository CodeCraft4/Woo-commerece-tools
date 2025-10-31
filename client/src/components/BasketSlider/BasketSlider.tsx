import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import Slider from "react-slick";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import LandingButton from "../LandingButton/LandingButton";
import { COLORS } from "../../constant/color";
import BasketCard from "../BasketCard/BasketCard";
import { useQuery } from "@tanstack/react-query";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { USER_ROUTES } from "../../constant/route";
import { useNavigate } from "react-router-dom";
import { fetchAllCardsFromDB } from "../../source/source";
import useModal from "../../hooks/useModal";
import ProductPopup, { type CategoryType } from "../ProductPopup/ProductPopup";

const TABS = ["Birthday Cards", "Letter box", "Under £30", "Under £60"];

type BirthdayTypes = {
  title?: string;
  description?: string;
  brandSlider?: boolean;
  saleSlide?: boolean;
};

const BasketSlider = (props: BirthdayTypes) => {
  const { title, description, brandSlider, saleSlide } = props;

  const navigate = useNavigate();

  const {
    open: isDetailModal,
    openModal: isOpenDetailModal,
    closeModal: isCloseDetailModal,
  } = useModal();

  const sliderRef = React.useRef<Slider | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>(
    undefined
  );

  const { data: basketCards, isLoading } = useQuery({
    queryKey: ["basketCards"],
    queryFn: fetchAllCardsFromDB,
  });

  const filteredCards = basketCards
    ? basketCards.filter((card) => {
        const selectedCategory = TABS[activeTab];
        return card.cardCategory === selectedCategory;
      })
    : [];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    arrows: false,
    responsive: [
      { breakpoint: 1920, settings: { slidesToShow: 7 } },
      { breakpoint: 1440, settings: { slidesToShow: 6 } },
      { breakpoint: 1024, settings: { slidesToShow: 5 } },
      { breakpoint: 770, settings: { slidesToShow: 4} },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const openDetailModal = (cate: CategoryType) => {
    setSelectedCate(cate);
    isOpenDetailModal();
  };

  return (
    <Box
      sx={{
        width: "100%",
        m: "auto",
        position: "relative",
        mt: { md: 8, sm: 8, xs: 0 },
        p: { md: 0, sm: 0, xs: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={700} fontSize={{ md: "26px" }}>
          {title}
        </Typography>
        {brandSlider ? null : (
          <LandingButton
            title="Shop All"
            width="150px"
            onClick={() => navigate(USER_ROUTES.VIEW_ALL)}
          />
        )}
      </Box>

      {saleSlide ? null : (
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
            mt: 2,
          }}
        >
          {TABS.map((e, index) => (
            <Box
              key={index}
              component={"div"}
              onClick={() => setActiveTab(index)}
              sx={{
                px: {md:3,sm:1,xs:1},
                py: {md:1,sm:0.5,xs:0.5},
                border: "2px solid black",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                backgroundColor:
                  activeTab === index ? COLORS.primary : "transparent",
                "&:hover": {
                  backgroundColor:
                    activeTab === index ? COLORS.seconday : "#f0f0f0",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: activeTab === index ? COLORS.white : COLORS.black,
                }}
              >
                {e}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 3, position: "relative" }}>
        {isLoading && (
          <Box
            sx={{
              width: "100%",
              height: {
                md: "300px",
                sm: "300px",
                xs: "250px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                m: "auto",
              },
            }}
          >
            {" "}
            <CircularProgress sx={{ color: COLORS.seconday }} />
          </Box>
        )}
        {/* Slider */}
        <Slider ref={sliderRef} {...settings}>
          {filteredCards.map((cate, index) => (
            <Box px={1}>
              <BasketCard
                id={cate.id}
                openModal={() => openDetailModal(cate)}
                key={index}
                title={cate.cardName}
                poster={cate.imageUrl || cate?.lastpageImageUrl}
                price={cate.actualPrice}
                saleprice={cate.salePrice}
                sales={saleSlide}
                category={cate.cardCategory}
              />
            </Box>
          ))}
        </Slider>

        {isDetailModal && selectedCate && (
          <ProductPopup
            open={isDetailModal}
            onClose={isCloseDetailModal}
            cate={selectedCate}
          />
        )}

        {/* Custom arrows */}
        <IconButton
          onClick={() => sliderRef.current?.slickPrev()}
          sx={{
            position: "absolute",
            top: { md: "30%", sm: "40%", xs: "40%" },
            left: { lg: -20, md: -15, sm: -15, xs: -15 },
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: { md: "50px", sm: "50px", xs: "40px" },
            width: { md: "50px", sm: "50px", xs: "40px" },
            border: `3px solid ${COLORS.primary}`,
            color: COLORS.primary,
            zIndex: 10,
            bgcolor: COLORS.white,
            "&:hover": { backgroundColor: "lightgray" },
          }}
        >
          <ArrowBackIos />
        </IconButton>

        <IconButton
          onClick={() => sliderRef.current?.slickNext()}
          sx={{
            position: "absolute",
            top: { md: "30%", sm: "0%", xs: "40%" },
            right: { lg: -20, md: -15, sm: -15, xs: -15 },
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: { md: "50px", sm: "50px", xs: "40px" },
            width: { md: "50px", sm: "50px", xs: "40px" },
            border: `3px solid ${COLORS.primary}`,
            color: COLORS.primary,
            zIndex: 10,
            bgcolor: COLORS.white,
            "&:hover": { backgroundColor: "lightgray" },
          }}
        >
          <ArrowForwardIos />
        </IconButton>
      </Box>

      <Typography
        sx={{
          mt: 2,
          fontSize: "17px",
          fontWeight: 300,
        }}
      >
        {description}
        {/* Show you give a funk and celebrate their birthday with a personalised
        card <a href="#" style={{textDecoration:"none",fontWeight:'bolder',color:COLORS.primary}}>for him</a>, <a href="#" style={{textDecoration:"none",fontWeight:'bolder',color:COLORS.primary}}>for her</a>  or <a href="#" style={{textDecoration:"none",fontWeight:'bolder',color:COLORS.primary}}>for kids</a>! */}
      </Typography>
    </Box>
  );
};

export default BasketSlider;
