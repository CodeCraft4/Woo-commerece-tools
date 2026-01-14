import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchAllCardsFromDB, fetchAllTempletDesignsLight, fetchTempletRawStoresById } from "../../source/source";
import { COLORS } from "../../constant/color";
import BasketCard from "../BasketCard/BasketCard";
import useModal from "../../hooks/useModal";
import ProductPopup, { type CategoryType } from "../ProductPopup/ProductPopup";

import "swiper/css";
import toast from "react-hot-toast";

type Props = {
  title?: string;
  description?: string;
};


const normalizePoster = (v?: string) => {
  if (!v) return "";
  const s = String(v).trim();
  if (s.startsWith("data:image/")) return s;

  // raw base64 (without prefix) -> make it valid
  if (/^[A-Za-z0-9+/=\s]+$/.test(s) && s.length > 200) {
    return `data:image/png;base64,${s.replace(/\s/g, "")}`;
  }

  return s;
};

const getTemplatePoster = (item: any) => {
  // 1) direct img_url
  if (item?.img_url) return normalizePoster(item.img_url);

  const rs = item?.raw_stores;

  const maybe =
    rs?.thumbnail ||
    rs?.preview ||
    rs?.cover ||
    rs?.slides?.[0]?.thumbnail ||
    rs?.slides?.[0]?.preview;

  return normalizePoster(maybe);
};


const BasketSliderNoTabs = ({ title, description }: Props) => {
  const [selected, setSelected] = useState<CategoryType | undefined>();
  const { open: isModal, openModal, closeModal } = useModal();

  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const { data: basketCards = [], isLoading: loadingTemplets,
    isError,
    error, } = useQuery({
      queryKey: ["templetDesign", "light"],
      queryFn: fetchAllTempletDesignsLight,
      staleTime: 1000 * 60 * 60,
    });


  if (isError) {
    toast.error("Error loading templates: " + (error as Error).message);
  };


  const qc = useQueryClient();

  useEffect(() => {
    if (!basketCards.length) return;

    const t = setTimeout(() => {
      // ✅ sirf first 8/10 prefetch (warna bohat requests)
      const ids = basketCards.slice(0, 10).map((x: any) => x.id);

      // ✅ stagger requests (burst nahi hoga)
      ids.forEach((id: any, idx: number) => {
        setTimeout(() => {
          qc.prefetchQuery({
            queryKey: ["templetDesign", "heavy", id],
            queryFn: () => fetchTempletRawStoresById(id),
            staleTime: 1000 * 60 * 30,
          });
        }, idx * 300);
      });
    }, 10000); // ✅ 10 sec (20 sec karna ho to 20000)

    return () => clearTimeout(t);
  }, [basketCards, qc]);


  // ✅ fetch cards
  const { data: allCards = [], isLoading: loadingCards } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchAllCardsFromDB,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const isLoading = loadingTemplets || loadingCards;

  // ✅ merge both
  const allProducts = useMemo(() => {
    const templates = (basketCards ?? []).map((x: any) => ({
      ...x,
      __type: "template",

      // ✅ normalize common UI fields
      title: x.cardname || x.cardName || x.title || "Untitled",
      category: x.cardcategory || x.cardCategory || x.category || "default",
      description: x.description || x.desc || x?.raw_stores?.description || "",

      actualprice: x.actualprice ?? x.actualPrice ?? x.price ?? 0,
      saleprice: x.saleprice ?? x.salePrice ?? x.sale_price ?? 0,

      poster: getTemplatePoster(x),
    }));

    const cards = (allCards ?? []).map((x: any) => ({
      ...x,
      __type: "card",

      title: x.cardname || x.cardName || x.title || "Untitled",
      category: x.cardcategory || x.cardCategory || x.category || "default",
      description: x.description || "",

      actualprice: x.actualprice ?? x.actualPrice ?? x.price ?? 0,
      saleprice: x.saleprice ?? x.salePrice ?? x.sale_price ?? 0,

      poster: normalizePoster(x?.img_url || x?.imageurl || x?.lastpageimageurl),
    }));

    return [...templates, ...cards];
  }, [basketCards, allCards]);


const handleOpen = async (item: any) => {
  // optional: modal pe skeleton/loading chahiye to pehle open kar do
  // openModal();

  if (item.__type === "template") {
    const heavy = await qc.fetchQuery({
      queryKey: ["templetDesign", "heavy", item.id],
      queryFn: () => fetchTempletRawStoresById(item.id),
      staleTime: 1000 * 60 * 30,
    });

    // ✅ merge raw_stores into selected item
    const merged = {
      ...item,
      raw_stores: heavy?.raw_stores ?? item?.raw_stores,
      // ProductPopup me aap "templetDesign ?? cate" use kar rahe ho
      // so safe: templetDesign object bhi attach kar do
      templetDesign: {
        ...item,
        raw_stores: heavy?.raw_stores ?? item?.raw_stores,
      },
    };

    setSelected(merged);
    openModal();
    return;
  }

  setSelected(item);
  openModal();
};


  const updateEdges = (s: SwiperType) => {
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
  };

  return (
    <Box sx={{ width: "100%", mt: { md: 6, xs: 3 } }}>
      {/* Header */}
      {title && (
        <Typography sx={{ fontWeight: 700, fontSize: { md: 30, xs: 20 }, textAlign: "center" }}>
          {title}
        </Typography>
      )}
      {description && (
        <Typography sx={{ mt: 1, fontSize: { md: 24, xs: 16 }, textAlign: "start", opacity: 0.9 }}>
          {description}
        </Typography>
      )}

      {/* Black strip */}
      <Box
        sx={{
          mt: 2,
          bgcolor: COLORS.black,
          borderRadius: 3,
          py: 3,
          px: { md: 2, xs: 2 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Box sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress sx={{ color: COLORS.seconday }} />
          </Box>
        ) : (
          <>
            <Swiper
              modules={[FreeMode, Mousewheel]}
              freeMode={{ enabled: true, momentum: true }}
              grabCursor
              mousewheel={{ forceToAxis: true }}
              spaceBetween={50}
              breakpoints={{
                0: { slidesPerView: 1 },
                600: { slidesPerView: 4 },
                900: { slidesPerView: 5 },
                1200: { slidesPerView: 6 },
                1536: { slidesPerView: 7 },
              }}
              onSwiper={(s) => {
                setSwiper(s);
                updateEdges(s);
              }}
              onSlideChange={(s) => updateEdges(s)}
              onReachBeginning={(s) => updateEdges(s)}
              onReachEnd={(s) => updateEdges(s)}
              onFromEdge={(s) => updateEdges(s)}
              style={{ paddingBottom: 6 }}
            >
              {allProducts.map((item: any) => {
                return (
                  <SwiperSlide key={`${item.__type}-${item.id}`} style={{ height: "auto" }}>
                    <BasketCard
                      id={item.id}
                      openModal={() => handleOpen(item)}
                      title={item.cardname || item.title}
                      poster={
                        item.__type === "template"
                          ? getTemplatePoster(item)
                          : normalizePoster(item?.img_url || item?.imageurl || item?.lastpageimageurl)
                      }
                      price={item.actualprice}
                      saleprice={item.saleprice}
                      category={item.cardcategory || item.category}
                    />
                  </SwiperSlide>
                );
              })}

            </Swiper>

            {/* ✅ Center Prev Button */}
            <IconButton
              onClick={() => swiper?.slidePrev()}
              disabled={isBeginning}
              sx={{
                position: "absolute",
                top: "50%",
                left: { xs: 8, md: 12 },
                transform: "translateY(-50%)",
                zIndex: 10,
                bgcolor: COLORS.white,
                border: `2px solid ${COLORS.primary}`,
                color: COLORS.primary,
                "&:hover": { bgcolor: "#f2f2f2" },

                // ✅ disabled style
                "&.Mui-disabled": {
                  opacity: 0.4,
                  bgcolor: "rgba(255,255,255,0.6)",
                  borderColor: "rgba(0,0,0,0.2)",
                  color: "rgba(0,0,0,0.35)",
                },
              }}
            >
              <ArrowBackIos fontSize="small" />
            </IconButton>

            {/* ✅ Center Next Button */}
            <IconButton
              onClick={() => swiper?.slideNext()}
              disabled={isEnd}
              sx={{
                position: "absolute",
                top: "50%",
                right: { xs: 8, md: 12 },
                transform: "translateY(-50%)",
                zIndex: 10,
                bgcolor: COLORS.white,
                border: `2px solid ${COLORS.primary}`,
                color: COLORS.primary,
                "&:hover": { bgcolor: "#f2f2f2" },

                "&.Mui-disabled": {
                  opacity: 0.4,
                  bgcolor: "rgba(255,255,255,0.6)",
                  borderColor: "rgba(0,0,0,0.2)",
                  color: "rgba(0,0,0,0.35)",
                },
              }}
            >
              <ArrowForwardIos fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* Modal */}
      {isModal && selected && (
        <ProductPopup
          open={isModal}
          onClose={closeModal}
          cate={selected}
          salePrice={false}
          isTempletDesign={(selected as any)?.__type === "template"}
        />
      )}
    </Box>
  );
};

export default BasketSliderNoTabs;
