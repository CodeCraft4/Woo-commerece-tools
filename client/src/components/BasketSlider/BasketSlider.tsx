import { Box, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import Slider from "react-slick";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LandingButton from "../LandingButton/LandingButton";
import { BASKET_CARDS } from "../../constant/data";
import { COLORS } from "../../constant/color";
import BasketCard from "../BasketCard/BasketCard";

const TABS = [
  "Birthday Cards",
  "Birthday Gift",
  "Kids Birthday Cards",
  "Kids Birthday Gift",
];

type BirthdayTypes = {
  title?: string;
  description?: string;
  brandSlider?: boolean;
  saleSlide?: boolean;
};

const BasketSlider = (props: BirthdayTypes) => {
  const { title, description, brandSlider, saleSlide } = props;

  const sliderRef = React.useRef<Slider | null>(null);

  const [activeTab, setActiveTab] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
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
        {brandSlider ? null : <LandingButton title="Shop All" width="120px" />}
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
                px: 4,
                py: 2,
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
                  fontWeight: 700,
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
          {BASKET_CARDS.map((cate) => (
            <BasketCard poster={cate.poster} price={cate.price} />
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
            height: "60px",
            width: "60px",
            border: "2px solid black",
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
            height: "60px",
            width: "60px",
            border: "2px solid black",
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
          fontSize: "20px",
          fontWeight: 400,
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
