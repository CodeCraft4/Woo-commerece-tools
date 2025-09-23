import { Box, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import Slider from "react-slick";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LandingButton from "../LandingButton/LandingButton";
import { CATEGORIES_DATA } from "../../constant/data";
import ProductCard from "../ProductCard/ProductCard";
import { COLORS } from "../../constant/color";

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
};

const BirthdaySlider = (props: BirthdayTypes) => {
  const { title, description, brandSlider } = props;

  const sliderRef = React.useRef<Slider | null>(null);

  const [activeTab, setActiveTab] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6.5,
    slidesToScroll: 2,
    arrows: false,
       initialSlide: 0,
  responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
  };

  return (
    <Box
      sx={{
        width: { md: "95%", sm: "", xs: "100%" },
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
        <Typography
          sx={{ fontSize: { md: "40px", sm: "", xs: "16px" }, fontWeight: 800 }}
        >
          {title}
        </Typography>
        {brandSlider ? null : <LandingButton title="Shop All" width="120px" />}
      </Box>

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
              py: { md: 2, sm: "", xs: 1 },
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

      <Box sx={{ mt: 3, position: "relative" }}>
        {/* Slider */}
        <Slider ref={sliderRef} {...settings}>
          {CATEGORIES_DATA.map((cate) => (
            <ProductCard poster={cate.poster} tabsSlider={true} />
          ))}
        </Slider>

        {/* Custom arrows */}
        <IconButton
          onClick={() => sliderRef.current?.slickPrev()}
          sx={{
            position: "absolute",
            top: "40%",
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
            top: "40%",
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
          mt: {md:5,sm:3,xs:2},
          fontSize: {md:"20px",sm:'',xs:'14px'},
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

export default BirthdaySlider;
