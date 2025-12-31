import React, { useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  ArrowBackIos,
  ArrowDropDown,
  ArrowForwardIos,
} from "@mui/icons-material";
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
import {
  fetchAllCardsFromDB,
  fetchAllCategoriesFromDB,
} from "../../source/source";

type BirthdayTypes = {
  title?: string;
  description?: string;
  brandSlider?: boolean;
};

// normalize helper: remove spaces/symbols for better matching
const normalize = (v: any) =>
  String(v ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "");

const BirthdaySlider = ({ title, description, brandSlider }: BirthdayTypes) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>();

  // Search text for cardname / cardcategory
  const [search, setSearch] = useState("");
  console.log(setSearch,)

  // Others menu state
  const [othersEl, setOthersEl] = useState<null | HTMLElement>(null);
  const [othersLabel, setOthersLabel] = useState<string>("Others");

  const { data: birthdayCards = [], isLoading } = useQuery({
    queryKey: ["birthdayCards"],
    queryFn: fetchAllCardsFromDB,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: tabsCategories = [] } = useQuery<any[]>({
    queryKey: ["tabsCategories"],
    queryFn: fetchAllCategoriesFromDB,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // Only "Cards" category subcategories
  const cardsCategory = tabsCategories.find((cat) => cat.name === "Cards");
  const cardsSubCategories: string[] = cardsCategory?.subcategories || [];

  const currentSubCat: string | undefined = cardsSubCategories[activeTab];

  const { open: isOpenDetailModal, openModal, closeModal } = useModal();
  const openDetailModal = (cate: CategoryType) => {
    setSelectedCate(cate);
    openModal();
  };

  // Others
  const openOthers = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (cardsSubCategories.length <= 5) return;
    setOthersEl(e.currentTarget);
  };
  const closeOthers = () => setOthersEl(null);

  const selectOther = (cat: string) => {
    const idx = cardsSubCategories.findIndex((c) => c === cat);
    if (idx >= 0) {
      setActiveTab(idx);
      setOthersLabel(cat || "Others");
    }
    closeOthers();
  };

  const othersDisabled = cardsSubCategories.length <= 5;
  const othersList = cardsSubCategories.slice(5);

  // ✅ Filtering (Tab MUST match + optional search)
  const filteredCards = useMemo(() => {
    const q = normalize(search);

    // if tab not ready -> show nothing (or you can show all, but your requirement says tab match must exist)
    if (!currentSubCat) return [];

    const tabNorm = normalize(currentSubCat);

    return (birthdayCards || []).filter((card: any) => {
      // card category value (handles string OR object with name)
      const rawCat =
        card?.subCategory ??
        card?.subCategory ??
        card?.cardname
      // card?.cardcategory?.name ??
      "";

      const cardCatNorm = normalize(rawCat);

      // ✅ Tab match is mandatory (flexible match)
      const matchesTab =
        cardCatNorm === tabNorm ||
        cardCatNorm.includes(tabNorm) ||
        tabNorm.includes(cardCatNorm);

      if (!matchesTab) return false;

      // if no search, show all in that tab
      if (!q) return true;

      const nameNorm = normalize(card?.cardname ?? card?.cardName ?? card?.name ?? "");

      // search can match name OR category
      return nameNorm.includes(q) || cardCatNorm.includes(q);
    });
  }, [birthdayCards, currentSubCat, search]);


  // ✅ Fix Shop All for string tab
  const handleShopAll = () => {
    if (!currentSubCat) return;
    navigate(`${USER_ROUTES.VIEW_ALL}/${encodeURIComponent(currentSubCat)}`, {
      state: { categoryName: currentSubCat },
    });
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
          gap: 2,
          flexWrap: "wrap",
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
            <LandingButton title="Shop All" width="150px" onClick={handleShopAll} />
          </Box>
        )}
      </Box>

      {/* Tabs + Others */}
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
          mt: 2,
        }}
      >
        {cardsSubCategories.slice(0, 5).map((tab: string, index: number) => (
          <Box
            key={`${tab}-${index}`}
            onClick={() => {
              setActiveTab(index);
              setOthersLabel("Others");
            }}
            sx={{
              px: { md: 3, sm: 1, xs: 1 },
              py: { md: 1, sm: 0.5, xs: 0.5 },
              border: "2px solid black",
              borderRadius: "15px",
              cursor: "pointer",
              transition: "all 0.3s ease-in-out",
              backgroundColor: activeTab === index ? COLORS.primary : "transparent",
              "&:hover": {
                backgroundColor: activeTab === index ? COLORS.seconday : "#f0f0f0",
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

        {/* Others button */}
        <Button
          variant="outlined"
          endIcon={<ArrowDropDown />}
          disabled={othersDisabled}
          onClick={openOthers}
          sx={{
            textTransform: "none",
            borderRadius: "15px",
            border: "2px solid black",
            color: COLORS.black,
            px: { md: 3, sm: 1, xs: 1 },
            py: { md: 0.5, sm: 0.25, xs: 0.25 },
            bgcolor: "transparent",
            "&.Mui-disabled": { opacity: 0.5, color: COLORS.black, borderColor: "black" },
          }}
        >
          {othersLabel}
        </Button>

        <Menu
          anchorEl={othersEl}
          open={Boolean(othersEl)}
          onClose={closeOthers}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          {othersList.map((cat: string, i: number) => (
            <MenuItem key={`${cat}-${i}`} onClick={() => selectOther(cat)}>
              {cat}
            </MenuItem>
          ))}
        </Menu>
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
            navigation={{ prevEl: ".swiper-button-prev", nextEl: ".swiper-button-next" }}
            breakpoints={{
              0: { slidesPerView: 1 },
              600: { slidesPerView: 3 },
              760: { slidesPerView: 4 },
              1030: { slidesPerView: 5 },
              1440: { slidesPerView: 7 },
              1920: { slidesPerView: 7 },
            }}
          >
            {filteredCards.map((card: any, idx: number) => (
              <SwiperSlide key={card?.id ?? idx}>
                <Box px={{ lg: 1, md: "2px", sm: 1, xs: 1 }}>
                  <ProductCard
                    poster={card?.imageurl || card?.lastpageimageurl}
                    tabsSlider
                    layoutCard={card?.polygonLayout}
                    openModal={() => openDetailModal(card)}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {isOpenDetailModal && selectedCate && (
          <ProductPopup open={isOpenDetailModal} onClose={closeModal} cate={selectedCate} />
        )}

        {/* Custom Nav */}
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

      <Typography sx={{ mt: { md: 3, sm: 3, xs: 2 }, fontSize: "16px", fontWeight: 300 }}>
        {description}
      </Typography>
    </Box>
  );
};

export default BirthdaySlider;
