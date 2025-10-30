import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";
import { SwapVert, TuneOutlined } from "@mui/icons-material";
import { CATEGORIES_DATA } from "../../constant/data";
import useModal from "../../hooks/useModal";
import type { CategoryType } from "../ProductPopup/ProductPopup";
import ProductPopup from "../ProductPopup/ProductPopup";

const tabs = [
  "View All Filters",
  "Birthday Cards",
  "Birthday Gift",
  "Kids Birthday Cards",
  "Kids Birthday Gift",
  "Letter box",
  "Under £30",
  "Under £60",
];

type CategoryFilter = {
  category?: number | string | null;
};

const ViewAllCard = (props: CategoryFilter) => {
  const { category } = props;

  const {
    open: isCategoryModal,
    openModal: openCategoryModal,
    closeModal: closeCategoryModal,
  } = useModal();

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>(
    undefined
  );

  // ✅ Apply filtering using useMemo for performance
  const filteredData = useMemo(() => {
    let data = CATEGORIES_DATA;

    // 1️⃣ Filter by passed category ID (from click)
    if (category) {
      data = data.filter((item) => item.id === category);
    }

    // 2️⃣ Then apply tab-based filter (optional)
    if (activeTab !== "View All Filters") {
      data = data.filter((item) => item.category === activeTab);
    }

    return data;
  }, [category, activeTab]);

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
        <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "none" },
            alignItems: "center",
            flexWrap: "wrap",
            width: "80%",
            gap: "5px",
          }}
        >
          {tabs.map((e) => (
            <Box
              component={"div"}
              onClick={() => setActiveTab(e)}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 20,
                bgcolor: activeTab === e ? COLORS.primary : "transparent",
                color: activeTab === e ? COLORS.white : COLORS.black,
                border:
                  activeTab === e
                    ? `1px solid transparent`
                    : `1px solid ${COLORS.black}`,
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              {e === "View All Filters" && (
                <TuneOutlined
                  fontSize="small"
                  sx={{
                    color: activeTab === e ? COLORS.white : COLORS.black,
                  }}
                />
              )}{" "}
              {e}
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
            "&:hover": {
              bgcolor: "lightGray",
            },
          }}
        >
          <SwapVert />
          Sort
        </Box>
      </Box>

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
          filteredData.map((e:any) => (
            <Box
              key={e.id}
              onClick={() => openCategoryModalPopup(e)}
              component={"img"}
              src={e.poster}
              sx={{
                width: 248,
                height: 300,
                objectFit: "cover",
                borderRadius: 2,
                border: "2px solid lightGray",
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
        <ProductPopup
          open={isCategoryModal}
          onClose={closeCategoryModal}
          cate={selectedCate}
        />
      )}
    </Box>
  );
};

export default ViewAllCard;
