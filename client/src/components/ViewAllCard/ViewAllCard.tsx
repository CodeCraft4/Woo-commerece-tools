import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";
import { SwapVert, TuneOutlined } from "@mui/icons-material";
import useModal from "../../hooks/useModal";
import type { CategoryType } from "../ProductPopup/ProductPopup";
import ProductPopup from "../ProductPopup/ProductPopup";

type CategoryFilter = {
  categoryId?: number | string | null;                  // align with ViewAll
  categoryName?: string | null;                         // align with ViewAll
  allCategories?: Array<{ id: string | number; name: string }>;
  cardData?: any[];
};

const toStr = (v: unknown) => (v == null ? "" : String(v));
const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());

// normalize card fields
const getCardCategoryName = (item: any) =>
  item?.cardcategory ?? item?.cardcategory ?? item?.cardname ?? "";

const getCardCategoryId = (item: any) =>
  item?.categoryId ?? item?.category_id ?? null;

const getCardImage = (item: any) =>
  item?.imageUrl ??
  item?.imageurl ??
  item?.lastpageImageUrl ??
  item?.lastpageimageurl ??
  item?.poster ??
  "";

const ViewAllCard = ({
  categoryId = null,
  categoryName = null,
  allCategories = [],
  cardData = [],
}: CategoryFilter) => {
  const {
    open: isCategoryModal,
    openModal: openCategoryModal,
    closeModal: closeCategoryModal,
  } = useModal();

  const [activeTab, setActiveTab] = useState<string>("View All Filters");
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>();

  // init active tab from categoryName first, else resolve via categoryId
  useEffect(() => {
    const routeName = (categoryName ?? "").trim();
    if (routeName) {
      setActiveTab(routeName);
      return;
    }
    if (categoryId != null) {
      const hit = allCategories.find((c) => toStr(c.id) === toStr(categoryId));
      if (hit?.name) setActiveTab(hit.name);
    }
  }, [categoryId, categoryName, allCategories]);

  const selectedCategoryName: string | null = useMemo(() => {
    if (activeTab !== "View All Filters") return activeTab;
    if (categoryId != null) {
      const hit = allCategories.find((c) => toStr(c.id) === toStr(categoryId));
      return hit?.name ?? null;
    }
    return null;
  }, [activeTab, allCategories, categoryId]);

  const filteredData = useMemo(() => {
    const cards = Array.isArray(cardData) ? cardData : [];

    // Prefer ID-based filter when we have categoryId and either:
    // - user is on "View All Filters", or
    // - the activeTab matches the resolved name of that id.
    if (categoryId != null) {
      return cards.filter((item) => toStr(getCardCategoryId(item)) === toStr(categoryId));
    }

    if (selectedCategoryName) {
      const want = lc(selectedCategoryName);
      return cards.filter((item) => lc(getCardCategoryName(item)) === want);
    }

    return cards;
  }, [cardData, categoryId, selectedCategoryName]);

  const openCategoryModalPopup = (cate: CategoryType) => {
    setSelectedCate(cate);
    openCategoryModal();
  };

  return (
    <Box>
      <Box
        sx={{
          mt: { md: 8 },
          display: "flex",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Tabs */}
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
            onClick={() => setActiveTab("View All Filters")}
            sx={{
              py: 1,
              px: 3,
              borderRadius: 20,
              bgcolor: activeTab === "View All Filters" ? COLORS.primary : "transparent",
              color: activeTab === "View All Filters" ? COLORS.white : COLORS.black,
              border: activeTab === "View All Filters" ? `1px solid transparent` : `1px solid ${COLORS.black}`,
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <TuneOutlined
              fontSize="small"
              sx={{
                color: activeTab === "View All Filters" ? COLORS.white : COLORS.black,
              }}
            />
            View All Filters
          </Box>

          {allCategories.map((e) => (
            <Box
              key={e.id}
              component="div"
              onClick={() => setActiveTab(e.name)}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 20,
                bgcolor: activeTab === e.name ? COLORS.primary : "transparent",
                color: activeTab === e.name ? COLORS.white : COLORS.black,
                border: activeTab === e.name ? `1px solid transparent` : `1px solid ${COLORS.black}`,
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              {e.name}
            </Box>
          ))}
        </Box>

        <Box
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
        </Box>
      </Box>

      {/* Grid */}
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
          filteredData.map((e: any) => (
            <Box
              key={e.id}
              onClick={() => openCategoryModalPopup(e)}
              component="img"
              src={getCardImage(e)}
              alt={e.name || e.title || "card"}
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

      {isCategoryModal && selectedCate && (
        <ProductPopup open={isCategoryModal} onClose={closeCategoryModal} cate={selectedCate} />
      )}
    </Box>
  );
};

export default ViewAllCard;