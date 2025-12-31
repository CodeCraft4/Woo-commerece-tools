import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { COLORS } from "../../constant/color";
import {TuneOutlined } from "@mui/icons-material";
import useModal from "../../hooks/useModal";
import type { CategoryType } from "../ProductPopup/ProductPopup";
import ProductPopup from "../ProductPopup/ProductPopup";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllCategoriesFromDB,
  fetchAllCardsFromDB,
  fetchAllTempletDesigns,
} from "../../source/source";

const VIEW_ALL = "View All Filters";
const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());

type LocationState = {
  categoryId?: string | number | null;
  categoryName?: string | null;
};

type ActiveTab = { id: string | number | null; name: string };

const getCardImage = (item: any) =>
  item?.imageUrl ??
  item?.imageurl ??
  item?.lastpageImageUrl ??
  item?.lastpageimageurl ??
  item?.poster ??
  "";

const getTempletImage = (item: any) =>
  item?.img_url ??
  item?.imageUrl ??
  item?.imageurl ??
  item?.poster ??
  "";

// ✅ Cards filters
const getCardTabName = (card: any) => card?.cardcategory ?? card?.cardCategory ?? "";
const getCardName = (card: any) => card?.cardname ?? card?.cardName ?? "";
// const getCardSubCategory = (card: any) => card?.subCategory ?? card?.subcategory ?? "";
// const getCardSubSubCategory = (card: any) =>
//   card?.subSubCategory ?? card?.subsubcategory ?? card?.sub_sub_category ?? "";

// ✅ Templet filters
const getTempletTabName = (t: any) => t?.category ?? t?.categoryName ?? t?.templetCategory ?? "";
const getTempletTitle = (t: any) => t?.title ?? t?.name ?? t?.cardname ?? "";

const ViewAllCard = () => {
  const { search } = useParams(); // route param: /view-all/:search
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const routeName = decodeURIComponent(search ?? "");
  const routeCategoryName = (state.categoryName ?? routeName ?? "").trim();
  const routeCategoryId = state.categoryId ?? null;

  const { open: isCategoryModal, openModal, closeModal } = useModal();
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>();

  // ✅ tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>({ id: null, name: VIEW_ALL });

  // (optional) search box later
  const [searchText, setSearchText] = useState("");
  console.log(setSearchText,'-')
  const query = lc(searchText);

  // ✅ categories (tabs)
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchAllCategoriesFromDB,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const allCategories = useMemo(
    () => (categories ?? []).map((c: any) => ({ id: c.id, name: c.name })),
    [categories]
  );

  // ✅ cards list (1 hour)
  const { data: cardData = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["allCards"],
    queryFn: fetchAllCardsFromDB,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // ✅ templet list (1 hour)
  const { data: templetCardData = [], isLoading: templetsLoading } = useQuery({
    queryKey: ["templetCards"],
    queryFn: fetchAllTempletDesigns,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // ✅ On landing/home click: auto activate tab
  useEffect(() => {
    if (!routeCategoryName) {
      setActiveTab({ id: null, name: VIEW_ALL });
      return;
    }

    const hit = allCategories.find((c) => lc(c.name) === lc(routeCategoryName));

    setActiveTab({
      id: hit?.id ?? routeCategoryId ?? null,
      name: hit?.name ?? routeCategoryName,
    });
  }, [routeCategoryName, routeCategoryId, allCategories]);

  const clickViewAll = () => setActiveTab({ id: null, name: VIEW_ALL });
  const clickTab = (c: { id: any; name: string }) => setActiveTab({ id: c.id, name: c.name });

  // ✅ Filter CARDS (tab = cardcategory, name = cardname, nested placeholders)
  const filteredCards = useMemo(() => {
    const list = Array.isArray(cardData) ? cardData : [];

    if (activeTab.name === VIEW_ALL) {
      if (!query) return list;
      return list.filter((card) => {
        const name = lc(getCardName(card));
        const tab = lc(getCardTabName(card));
        return name.includes(query) || tab.includes(query);
      });
    }

    const wantTab = lc(activeTab.name);

    return list.filter((card) => {
      const tabName = lc(getCardTabName(card));
      if (tabName !== wantTab) return false;

      if (query) {
        const name = lc(getCardName(card));
        if (!name.includes(query) && !tabName.includes(query)) return false;
      }

      // ✅ Nested filters placeholders:
      // const wantSub = lc(selectedSubCat); const wantSubSub = lc(selectedSubSubCat);
      // if (wantSub && lc(getCardSubCategory(card)) !== wantSub) return false;
      // if (wantSubSub && lc(getCardSubSubCategory(card)) !== wantSubSub) return false;

      return true;
    });
  }, [cardData, activeTab.name, query]);

  // ✅ Filter TEMPLETS (tab = category, name = title)
  const filteredTemplets = useMemo(() => {
    const list = Array.isArray(templetCardData) ? templetCardData : [];

    if (activeTab.name === VIEW_ALL) {
      if (!query) return list;
      return list.filter((t) => {
        const title = lc(getTempletTitle(t));
        const tab = lc(getTempletTabName(t));
        return title.includes(query) || tab.includes(query);
      });
    }

    const wantTab = lc(activeTab.name);

    return list.filter((t) => {
      const tabName = lc(getTempletTabName(t));
      if (tabName !== wantTab) return false;

      if (query) {
        const title = lc(getTempletTitle(t));
        if (!title.includes(query) && !tabName.includes(query)) return false;
      }

      return true;
    });
  }, [templetCardData, activeTab.name, query]);

  // ✅ Merge results + tag type correctly
  const filteredData = useMemo(() => {
    const cards = filteredCards.map((x: any) => ({ ...x, __type: "card" as const }));
    const temps = filteredTemplets.map((x: any) => ({ ...x, __type: "templet" as const }));
    return [...cards, ...temps];
  }, [filteredCards, filteredTemplets]);

  const openCategoryModalPopup = (cate: any) => {
    setSelectedCate(cate);
    openModal();
  };

  const loading = catLoading || cardsLoading || templetsLoading;

  return (
    <Box>
      {/* Tabs */}
      <Box
        sx={{
          mt: { md: 8 },
          display: "flex",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "none" },
            alignItems: "center",
            flexWrap: "wrap",
            width: "80%",
            gap: "5px",
          }}
        >
          <Box
            component="div"
            onClick={clickViewAll}
            sx={{
              py: 1,
              px: 3,
              borderRadius: 20,
              bgcolor: activeTab.name === VIEW_ALL ? COLORS.primary : "transparent",
              color: activeTab.name === VIEW_ALL ? COLORS.white : COLORS.black,
              border: activeTab.name === VIEW_ALL ? `1px solid transparent` : `1px solid ${COLORS.black}`,
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <TuneOutlined fontSize="small" />
            {VIEW_ALL}
          </Box>

          {allCategories.map((c) => (
            <Box
              key={c.id}
              component="div"
              onClick={() => clickTab(c)}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 20,
                bgcolor: lc(activeTab.name) === lc(c.name) ? COLORS.primary : "transparent",
                color: lc(activeTab.name) === lc(c.name) ? COLORS.white : COLORS.black,
                border: lc(activeTab.name) === lc(c.name) ? `1px solid transparent` : `1px solid ${COLORS.black}`,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {c.name}
            </Box>
          ))}
        </Box>

        {/* <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "none" },
            alignItems: "center",
            gap: "3px",
            border: "1px solid black",
            borderRadius: 20,
            px: 2,
            py: 1,
            cursor: "pointer",
            "&:hover": { bgcolor: "lightGray" },
          }}
        >
          <SwapVert />
          Sort
        </Box> */}
      </Box>

      {/* Loading */}
      {loading ? (
        <Box sx={{ width: "100%", height: 250, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: { md: "auto", sm: "auto", xs: "center" },
            gap: "21px",
            mt: { md: 4, sm: 4, xs: 0 },
          }}
        >
          {filteredData.length > 0 ? (
            filteredData.map((e: any, idx: number) => (
              <Box
                key={e.id ?? e._id ?? `${idx}-${Math.random()}`}
                onClick={() => openCategoryModalPopup(e)}
                component="img"
                src={e.__type === "templet" ? getTempletImage(e) : getCardImage(e)}
                alt={e.title || e.name || e.cardname || "product"}
                sx={{
                  width: 248,
                  height: 300,
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "2px solid lightGray",
                  cursor: "pointer",
                }}
              />
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: 200,
                fontSize: "20px",
                fontWeight: 500,
                color: "gray",
              }}
            >
              Product not found
            </Box>
          )}
        </Box>
      )}

      {isCategoryModal && selectedCate && (
        <ProductPopup
          open={isCategoryModal}
          onClose={closeModal}
          cate={selectedCate}
          isTempletDesign={(selectedCate as any)?.__type === "templet"}
        />
      )}
    </Box>
  );
};

export default ViewAllCard;
