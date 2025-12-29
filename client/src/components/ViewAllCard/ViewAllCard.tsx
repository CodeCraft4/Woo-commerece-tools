import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";
import { SwapVert, TuneOutlined } from "@mui/icons-material";
import useModal from "../../hooks/useModal";
import type { CategoryType } from "../ProductPopup/ProductPopup";
import ProductPopup from "../ProductPopup/ProductPopup";

type CategoryFilter = {
  categoryId?: number | string | null;
  categoryName?: string | null;
  allCategories?: Array<{ id: string | number; name: string }>;
  cardData?: any[];
};

const toStr = (v: unknown) => (v == null ? "" : String(v));
const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());

// ✅ Cards table uses subCategory/subSubCategory.
const getCardCategoryName = (item: any) =>
  item?.subCategory ??
  item?.subcategory ??
  item?.cardCategory ??
  item?.cardcategory ??
  item?.categoryName ??
  item?.category ??
  "";

const getCardCategoryId = (item: any) =>
  item?.categoryId ??
  item?.category_id ??
  item?.subCategoryId ??
  item?.subcategory_id ??
  null;

const getCardImage = (item: any) =>
  item?.imageUrl ??
  item?.imageurl ??
  item?.lastpageImageUrl ??
  item?.lastpageimageurl ??
  item?.poster ??
  "";

const VIEW_ALL = "View All Filters";

const ViewAllCard = ({
  categoryId = null,
  categoryName = null,
  allCategories = [],
  cardData = [],
}: CategoryFilter) => {
  const { open: isCategoryModal, openModal, closeModal } = useModal();

  const [activeTab, setActiveTab] = useState<string>(VIEW_ALL);
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>();

  // ✅ Resolve the category from route props (id/name) + allCategories
  const resolvedCategory = useMemo(() => {
    const routeName = (categoryName ?? "").trim();
    if (routeName) {
      const hit = allCategories.find((c) => lc(c.name) === lc(routeName));
      return hit ?? { id: categoryId ?? routeName, name: routeName };
    }

    if (categoryId != null) {
      const hit = allCategories.find((c) => toStr(c.id) === toStr(categoryId));
      return hit ?? null;
    }

    return null;
  }, [categoryId, categoryName, allCategories]);

  // ✅ Activate tab only if it exists; otherwise stay on View All
  useEffect(() => {
    if (resolvedCategory?.name) {
      setActiveTab(resolvedCategory.name);
    } else {
      setActiveTab(VIEW_ALL);
    }
  }, [resolvedCategory?.name]);

  // ✅ If categories list changes and current tab no longer exists, reset
  useEffect(() => {
    if (activeTab === VIEW_ALL) return;
    const ok = allCategories.some((c) => lc(c.name) === lc(activeTab));
    if (!ok) setActiveTab(VIEW_ALL);
  }, [allCategories, activeTab]);

  const activeCategoryName = useMemo(() => {
    if (activeTab !== VIEW_ALL) return activeTab;
    return resolvedCategory?.name ?? null;
  }, [activeTab, resolvedCategory?.name]);

  // ✅ Filter: try ID first (if card has ids), otherwise fallback to name/subCategory match
  const filteredData = useMemo(() => {
    const cards = Array.isArray(cardData) ? cardData : [];

    if (!activeCategoryName && categoryId == null) return cards;

    // 1) Try ID match (only works if your card rows have categoryId/subCategoryId)
    if (categoryId != null) {
      const byId = cards.filter((item) => toStr(getCardCategoryId(item)) === toStr(categoryId));
      if (byId.length > 0) return byId;
      // 2) Fallback to name match if ID not present in card rows
    }

    if (activeCategoryName) {
      const want = lc(activeCategoryName);
      return cards.filter((item) => lc(getCardCategoryName(item)) === want);
    }

    return cards;
  }, [cardData, categoryId, activeCategoryName]);

  const openCategoryModalPopup = (cate: CategoryType) => {
    setSelectedCate(cate);
    openModal();
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
            onClick={() => setActiveTab(VIEW_ALL)}
            sx={{
              py: 1,
              px: 3,
              borderRadius: 20,
              bgcolor: activeTab === VIEW_ALL ? COLORS.primary : "transparent",
              color: activeTab === VIEW_ALL ? COLORS.white : COLORS.black,
              border: activeTab === VIEW_ALL ? `1px solid transparent` : `1px solid ${COLORS.black}`,
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <TuneOutlined fontSize="small" sx={{ color: activeTab === VIEW_ALL ? COLORS.white : COLORS.black }} />
            {VIEW_ALL}
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
                bgcolor: lc(activeTab) === lc(e.name) ? COLORS.primary : "transparent",
                color: lc(activeTab) === lc(e.name) ? COLORS.white : COLORS.black,
                border: lc(activeTab) === lc(e.name) ? `1px solid transparent` : `1px solid ${COLORS.black}`,
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
        <ProductPopup open={isCategoryModal} onClose={closeModal} cate={selectedCate} />
      )}
    </Box>
  );
};

export default ViewAllCard;
