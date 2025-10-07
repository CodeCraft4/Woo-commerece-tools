import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import Slider from "react-slick";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LandingButton from "../LandingButton/LandingButton";
import ProductCard from "../ProductCard/ProductCard";
import { COLORS } from "../../constant/color";
import { useQuery } from "@tanstack/react-query";
import useModal from "../../hooks/useModal";
import ProductPopup, { type CategoryType } from "../ProductPopup/ProductPopup";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../constant/route";
import { fetchAllCardsFromDB } from "../../source/source";

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
  const navigate = useNavigate();

  const sliderRef = React.useRef<Slider | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>(
    undefined
  );

  const { data: birthdayCards } = useQuery({
    queryKey: ["birthdayCards"],
    queryFn: fetchAllCardsFromDB,
  });

  const filteredCards = birthdayCards
    ? birthdayCards.filter((card) => {
        const selectedCategory = TABS[activeTab];
        return card.card_category === selectedCategory;
      })
    : [];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6.89,
    slidesToScroll: 3,
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

  const {
    open: isOpenDetailModal,
    openModal,
    closeModal: closeDetailModal,
  } = useModal();

  const openDetailModal = (cate: CategoryType) => {
    setSelectedCate(cate);
    openModal();
  };

  return (
    <Box
      sx={{
        width: { md: "100%", sm: "", xs: "100%" },
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
        <Typography
          sx={{ fontSize: { md: "25px", sm: "", xs: "16px" }, fontWeight: 800 }}
        >
          {title}
        </Typography>

        {brandSlider ? null : (
          <Box sx={{ display: { md: "flex", sm: "flex", xs: "none" } }}>
            <LandingButton
              title="Shop All"
              width="150px"
              onClick={() => navigate(USER_ROUTES.VIEW_ALL)}
            />
          </Box>
        )}
      </Box>

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
              px: { md: 3, sm: 3, xs: 1 },
              py: { md: 1, sm: "", xs: 0.5 },
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

      <Box
        sx={{
          mt: 3,
          position: "relative",
        }}
      >
        {/* Slider */}
        <Slider ref={sliderRef} {...settings}>
          {filteredCards?.map((cate) => (
            <Box key={cate.id}>
              <ProductCard
                poster={cate?.image_url}
                tabsSlider={true}
                openModal={() => openDetailModal(cate)}
              />
              {isOpenDetailModal && (
                <ProductPopup
                  open={isOpenDetailModal}
                  onClose={closeDetailModal}
                  cate={selectedCate}
                />
              )}
            </Box>
          ))}
        </Slider>

        {/* Custom arrows */}
        <IconButton
          onClick={() => sliderRef.current?.slickPrev()}
          sx={{
            position: "absolute",
            top: "40%",
            left: { md: -25, sm: -25, xs: 0 },
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: { md: "50px", sm: "50px", xs: "40px" },
            width: { md: "50px", sm: "50px", xs: "40px" },
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
            top: "40%",
            right: { md: -20, sm: -20, xs: 0 },
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: { md: "50px", sm: "50px", xs: "40px" },
            width: { md: "50px", sm: "50px", xs: "40px" },
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
          mt: { md: 3, sm: 3, xs: 2 },
          fontSize: "16px",
          fontWeight: 300,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

export default BirthdaySlider;
