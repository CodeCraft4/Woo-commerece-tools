import React, { useState } from "react";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
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

  const { data: birthdayCards, isLoading } = useQuery({
    queryKey: ["birthdayCards"],
    queryFn: fetchAllCardsFromDB,
  });

  const filteredCards = birthdayCards
    ? birthdayCards.filter((card) => {
        const selectedCategory = TABS[activeTab];
        return card.cardCategory === selectedCategory;
      })
    : [];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 2,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
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

      <Box
        sx={{
          mt: 3,
          position: "relative",
        }}
      >
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
                mx: "auto",
              },
            }}
          >
            {" "}
            <CircularProgress sx={{ color: COLORS.seconday }} />
          </Box>
        )}
        {/* Slider */}
        <Box sx={{ width: "100%" }}>
          <Slider ref={sliderRef} {...settings}>
            {filteredCards?.map((cate) => (
              <ProductCard
                poster={cate?.imageUrl || cate?.lastpageImageUrl}
                tabsSlider
                layoutCard={cate?.polygonLayout}
                openModal={() => openDetailModal(cate)}
              />
            ))}
          </Slider>
        </Box>

        {isOpenDetailModal && selectedCate && (
          <ProductPopup
            open={isOpenDetailModal}
            onClose={closeDetailModal}
            cate={selectedCate}
          />
        )}

        {/* Custom arrows */}
        <IconButton
          onClick={() => sliderRef.current?.slickPrev()}
          sx={{
            position: "absolute",
            top: "40%",
            left: 0,
            display: "flex",
            justifyContent: "center",
            m: "auto",
            alignItems: "center",
            height: { md: "50px", sm: "50px", xs: "40px" },
            width: { md: "50px", sm: "50px", xs: "40px" },
            border: `3px solid ${COLORS.primary}`,
            color: COLORS.primary,
            bgcolor: COLORS.white,
            zIndex: 10,
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
            right:0,
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
