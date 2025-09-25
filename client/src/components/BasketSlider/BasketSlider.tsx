import { Box, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import Slider from "react-slick";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import LandingButton from "../LandingButton/LandingButton";
import { BASKET_CARDS } from "../../constant/data";
import { COLORS } from "../../constant/color";
import BasketCard from "../BasketCard/BasketCard";
import { useQuery } from "@tanstack/react-query";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { USER_ROUTES } from "../../constant/route";
import { useNavigate } from "react-router-dom";

const TABS = ["Birthday Flowers", "Latter box", "Under £30", "Under £60"];

type BirthdayTypes = {
  title?: string;
  description?: string;
  brandSlider?: boolean;
  saleSlide?: boolean;
};

const fetchAllBasketData = () => {
  return new Promise<typeof BASKET_CARDS>((resolve) => {
    resolve(BASKET_CARDS);
  });
};

const BasketSlider = (props: BirthdayTypes) => {
  const { title, description, brandSlider, saleSlide } = props;

  const navigate = useNavigate()

  const sliderRef = React.useRef<Slider | null>(null);

  const [activeTab, setActiveTab] = useState(0);

  const { data: basketCards } = useQuery({
    queryKey: ["basketCards"],
    queryFn: fetchAllBasketData,
  });

  const filteredCards = basketCards
    ? basketCards.filter((card) => {
        const selectedCategory = TABS[activeTab];
        return card.category === selectedCategory;
      })
    : [];

  // const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>(
  //   undefined
  // );

  // const {
  //   open: isOpenDetailModal,
  //   openModal,
  //   closeModal: closeDetailModal,
  // } = useModal();

  // const openDetailModal = (cate: CategoryType) => {
  //   setSelectedCate(cate);
  //   openModal();
  // };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box
      sx={{
        width: "95%",
        m: "auto",
        position: "relative",
        mt: 8,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight={800}>
          {title}
        </Typography>
        {brandSlider ? null : <LandingButton title="Shop All" width="150px" onClick={()=>navigate(USER_ROUTES.VIEW_ALL)} />}
      </Box>

      {saleSlide ? null : (
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
            mt: 3,
          }}
        >
          {TABS.map((e, index) => (
            <Box
              component={"div"}
              onClick={() => setActiveTab(index)}
              sx={{
                px: 3,
                py: 1.5,
                border: "2px solid black",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                backgroundColor: activeTab === index ? "black" : "transparent",
                "&:hover": {
                  backgroundColor: activeTab === index ? "black" : "#f0f0f0",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: activeTab === index ? COLORS.white : COLORS.primary,
                }}
              >
                {e}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 3, position: "relative" }}>
        {/* Slider */}
        <Slider ref={sliderRef} {...settings}>
          {filteredCards.map((cate, index) => (
            <Box>
              <BasketCard
                key={index}
                poster={cate.poster}
                price={cate.price}
                // openModal={openDetailModal}
              />
              {/* {isOpenDetailModal && (
                <ProductPopup
                  open={isOpenDetailModal}
                  onClose={closeDetailModal}
                  cate={selectedCate}
                />
              )} */}
            </Box>
          ))}
        </Slider>

        {/* Custom arrows */}
        <IconButton
          onClick={() => sliderRef.current?.slickPrev()}
          sx={{
            position: "absolute",
            top: "30%",
            left: -25,
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: "50px",
            width: "50px",
            border: "1px solid black",
            zIndex: 10,
            bgcolor: COLORS.white,
            color: COLORS.primary,
            "&:hover": { backgroundColor: "lightgray" },
          }}
        >
          <ArrowBackIos />
        </IconButton>

        <IconButton
          onClick={() => sliderRef.current?.slickNext()}
          sx={{
            position: "absolute",
            top: "30%",
            right: 0,
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: "50px",
            width: "50px",
            border: "1px solid black",
            zIndex: 10,
            bgcolor: COLORS.white,
            color: COLORS.primary,
            "&:hover": { backgroundColor: "lightgray" },
          }}
        >
          <ArrowForwardIos />
        </IconButton>
      </Box>

      <Typography
        sx={{
          mt: 5,
          fontSize: "17px",
          fontWeight: 500,
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
