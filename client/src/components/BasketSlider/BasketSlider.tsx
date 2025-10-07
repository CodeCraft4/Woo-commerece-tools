import { Box, IconButton, Typography } from "@mui/material";
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

  const sliderRef = React.useRef<Slider | null>(null);

  const [activeTab, setActiveTab] = useState(0);

  const { data: basketCards } = useQuery({
    queryKey: ["basketCards"],
    queryFn: fetchAllCardsFromDB,
  });

  const filteredCards = basketCards
    ? basketCards.filter((card) => {
        const selectedCategory = TABS[activeTab];
        return card.card_category === selectedCategory;
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
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box
      sx={{
        width: "100%",
        m: "auto",
        position: "relative",
        mt: { md: 8, sm: 8, xs: 0 },
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
                px: 3,
                py: 1,
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
              <BasketCard
                id={cate.id}
                key={index}
                title={cate.card_name}
                poster={cate.image_url}
                price={cate.actual_price}
                saleprice={cate.sale_price}
                sales={saleSlide}
                category={cate.card_category}
              />
          ))}
        </Slider>

        {/* Custom arrows */}
        <IconButton
          onClick={() => sliderRef.current?.slickPrev()}
          sx={{
            position: "absolute",
            top: {md:"30%",sm:'30%',xs:'40%'},
            left: {md:-25,sm:-25,xs:1},
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: {md:'50px',sm:'50px',xs:'40px'},
            width: {md:'50px',sm:'50px',xs:'40px'},
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
            top: {md:"30%",sm:'30%',xs:'40%'},
            right: 0,
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: {md:'50px',sm:'50px',xs:'40px'},
            width: {md:'50px',sm:'50px',xs:'40px'},
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
