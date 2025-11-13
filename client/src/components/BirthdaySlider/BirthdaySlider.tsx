import { useState } from "react";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

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

const BirthdaySlider = ({ title, description, brandSlider }: BirthdayTypes) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>();

  const { data: birthdayCards, isLoading } = useQuery({
    queryKey: ["birthdayCards"],
    queryFn: fetchAllCardsFromDB,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const filteredCards = birthdayCards
    ? birthdayCards.filter(
        (card) => card.cardCategory === TABS[activeTab]
      )
    : [];

  const { open: isOpenDetailModal, openModal, closeModal } = useModal();

  const openDetailModal = (cate: CategoryType) => {
    setSelectedCate(cate);
    openModal();
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: { md: "25px", sm: "20px", xs: "16px" },
            fontWeight: 800,
          }}
        >
          {title}
        </Typography>

        {!brandSlider && (
          <Box sx={{ display: { md: "flex", sm: "flex", xs: "none" } }}>
            <LandingButton
              title="Shop All"
              width="150px"
              onClick={() => navigate(USER_ROUTES.VIEW_ALL)}
            />
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
          mt: 2,
        }}
      >
        {TABS.map((tab, index) => (
          <Box
            key={index}
            onClick={() => setActiveTab(index)}
            sx={{
              px: { md: 3, sm: 1, xs: 1 },
              py: { md: 1, sm: 0.5, xs: 0.5 },
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
              {tab}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Slider */}
      <Box sx={{ mt: 3, position: "relative" }}>
        {isLoading ? (
          <Box
            sx={{
              width: "100%",
              height: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress sx={{ color: COLORS.seconday }} />
          </Box>
        ) : (
          <Swiper
            modules={[Navigation]}
            spaceBetween={10}
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            breakpoints={{
              0: { slidesPerView: 1 },
              600: { slidesPerView: 3 },
              760: { slidesPerView: 4 },
              1030: { slidesPerView: 5 },
              1440: { slidesPerView: 7 },
              1920: { slidesPerView: 7 },
            }}
          >
            {filteredCards.map((cate, idx) => (
              <SwiperSlide key={idx}>
                <Box px={{ lg: 1, md: "2px", sm: 1, xs: 1 }}>
                  <ProductCard
                    poster={cate?.imageUrl || cate?.lastpageImageUrl}
                    tabsSlider
                    layoutCard={cate?.polygonLayout}
                    openModal={() => openDetailModal(cate)}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {isOpenDetailModal && selectedCate && (
          <ProductPopup
            open={isOpenDetailModal}
            onClose={closeModal}
            cate={selectedCate}
          />
        )}

        {/* Custom Navigation Buttons */}
        <IconButton
          className="swiper-button-prev"
          sx={{
            position: "absolute",
            top: "40%",
            left: { lg: -20, md: -15, sm: -15, xs: -10 },
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
          className="swiper-button-next"
          sx={{
            position: "absolute",
            top: "40%",
            right: { lg: -20, md: -15, sm: -15, xs: -10 },
            border: `3px solid ${COLORS.primary}`,
            color: COLORS.primary,
            bgcolor: COLORS.white,
            zIndex: 10,
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
