import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import LandingButton from "../LandingButton/LandingButton";
import { COLORS } from "../../constant/color";
import BasketCard from "../BasketCard/BasketCard";
import { useQuery } from "@tanstack/react-query";
import { USER_ROUTES } from "../../constant/route";
import { useNavigate } from "react-router-dom";
import { fetchAllCardsFromDB, fetchAllCategoriesFromDB } from "../../source/source";
import useModal from "../../hooks/useModal";
import ProductPopup, { type CategoryType } from "../ProductPopup/ProductPopup";

type Props = {
  title?: string;
  description?: string;
  brandSlider?: boolean;
  saleSlide?: boolean;
  clothing?: boolean;
};

const BasketSlider = ({ title, description, brandSlider, saleSlide, clothing }: Props) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>();

  const { open: isDetailModal, openModal: openDetailModal, closeModal: closeDetailModal } = useModal();

  const { data: basketCards, isLoading } = useQuery({
    queryKey: ["basketCards"],
    queryFn: fetchAllCardsFromDB,
  });

  const { data: tabsCategories = [] } = useQuery<any[]>({
    queryKey: ["tabsCategories"],
    queryFn: fetchAllCategoriesFromDB,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Only show clothing-related tabs when clothing === true
  const filteredTabs = useMemo(() => {
    if (!clothing) return tabsCategories;

    const whitelist = [
      "Clothing",
      "Clothes",
      "T-Shirt",
      "T Shirt",
      "Tshirt",
      "Hoodie",
      "Sweatshirt",
      "Shirt",
      "Jeans",
    ].map((s) => s.toLowerCase());

    return tabsCategories.filter((c) => {
      const name = (c?.name ?? "").toString().trim().toLowerCase();
      return whitelist.includes(name);
    });
  }, [tabsCategories, clothing]);

  // Keep activeTab in range when tabs change
  useEffect(() => {
    if (activeTab >= filteredTabs.length) setActiveTab(0);
  }, [filteredTabs, activeTab]);

  const currentCat = filteredTabs[activeTab];

  const filteredCards = useMemo(() => {
    if (!basketCards || !currentCat) return [];
    return basketCards.filter((card: any) => {
      if (card.categoryId != null && currentCat.id != null) {
        return String(card.categoryId) === String(currentCat.id);
      }
      // fallback: match by name
      return (card.cardcategory || card.cardname) === currentCat.name;
    });
  }, [basketCards, currentCat]);

  const handleOpenModal = (cate: CategoryType) => {
    setSelectedCate(cate);
    openDetailModal();
  };

  return (
    <Box sx={{ width: "100%", m: "auto", position: "relative", mt: { md: 8, sm: 8, xs: 0 }, p: { md: 0, sm: 0, xs: 2 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography fontWeight={700} fontSize={{ md: "26px" }}>{title}</Typography>
        {!brandSlider && (
          <LandingButton title="Shop All" width="150px" onClick={() => navigate(USER_ROUTES.VIEW_ALL)} />
        )}
      </Box>

      {/* Tabs */}
      {!saleSlide && filteredTabs.length > 0 && (
        <Box sx={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", mt: 2 }}>
          {filteredTabs.slice(0, 6).map((tab, index) => (
            <Box
              key={tab.id ?? tab.name ?? index}
              onClick={() => setActiveTab(index)}
              sx={{
                px: { md: 3, sm: 1, xs: 1 },
                py: { md: 1, sm: 0.5, xs: 0.5 },
                border: "2px solid black",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                backgroundColor: activeTab === index ? COLORS.primary : "transparent",
                "&:hover": { backgroundColor: activeTab === index ? COLORS.seconday : "#f0f0f0" },
              }}
            >
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color: activeTab === index ? COLORS.white : COLORS.black }}>
                {tab.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Slider */}
      <Box sx={{ mt: 3, position: "relative" }}>
        {isLoading ? (
          <Box sx={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress sx={{ color: COLORS.seconday }} />
          </Box>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation={{ prevEl: ".swiper-button-prev", nextEl: ".swiper-button-next" }}
            spaceBetween={10}
            breakpoints={{
              0: { slidesPerView: 1 },
              600: { slidesPerView: 3 },
              760: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
              1440: { slidesPerView: 6 },
              1920: { slidesPerView: 7 },
            }}
          >
            {filteredCards.map((cate: any) => (
              <SwiperSlide key={cate.id}>
                <Box px={{ md: 1, sm: "5px", xs: "4px" }}>
                  <BasketCard
                    id={cate.id}
                    openModal={() => handleOpenModal(cate)}
                    title={cate.cardname}
                    poster={cate?.imageurl || cate?.lastpageimageurl}
                    price={cate.actualprice}
                    saleprice={cate.saleprice}
                    sales={saleSlide}
                    category={cate.cardcategory}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Modal */}
        {isDetailModal && selectedCate && (
          <ProductPopup open={isDetailModal} onClose={closeDetailModal} cate={selectedCate} />
        )}

        {/* Custom Navigation Buttons */}
        <IconButton
          className="swiper-button-prev"
          sx={{
            position: "absolute",
            top: "30%",
            left: { lg: -20, md: -15, sm: -15, xs: -10 },
            transform: "translateY(-50%)",
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
            top: "30%",
            right: { lg: -20, md: -15, sm: -15, xs: -10 },
            transform: "translateY(-50%)",
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

      <Typography sx={{ mt: 2, fontSize: "17px", fontWeight: 300 }}>{description}</Typography>
    </Box>
  );
};

export default BasketSlider;
