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
import { useQuery } from "@tanstack/react-query";

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

const fetchCategoriesData = async () => {
  return new Promise<typeof CATEGORIES_DATA>((resolve) => {
    resolve(CATEGORIES_DATA);
  });
};

const BirthdaySlider = (props: BirthdayTypes) => {
  const { title, description, brandSlider } = props;

  const sliderRef = React.useRef<Slider | null>(null);

  const [activeTab, setActiveTab] = useState(0);

  const { data: birthdayCards } = useQuery({
    queryKey: ["birthdayCards"],
    queryFn: fetchCategoriesData,
  });

    const filteredCards = birthdayCards
    ? birthdayCards.filter((card) => {
        const selectedCategory = TABS[activeTab];
        return card.category === selectedCategory;
      })
    : [];
  

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
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
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
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
          sx={{ fontSize: { md: "35px", sm: "", xs: "16px" }, fontWeight: 800 }}
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
              px: 3,
              py: { md: 1.5, sm: "", xs: 1 },
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
                fontSize:'14px',
                fontWeight: 600,
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
          {filteredCards?.map((cate) => (
            <ProductCard poster={cate.poster} tabsSlider={true} />
          ))}
        </Slider>

        {/* Custom arrows */}
        <IconButton
          onClick={() => sliderRef.current?.slickPrev()}
          sx={{
            position: "absolute",
            top: "40%",
            left: -30,
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
            right: -20,
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
          mt: { md: 5, sm: 3, xs: 2 },
          fontSize: "17px",
          fontWeight: 500,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

export default BirthdaySlider;
