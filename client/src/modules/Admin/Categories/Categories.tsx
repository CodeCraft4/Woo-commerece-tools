import { useState } from "react";
import { Box, Pagination, CircularProgress } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import CategoriesCard from "./components/CategoriesCard/CategoriesCard";
import useModal from "../../../hooks/useModal";
import CategoryModal from "./components/CategoryModal/CategoryModal";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesFromDB } from "../../../source/source";

const Categories = () => {
  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const {
    open: isCategoryModal,
    openModal: openCategoryModal,
    closeModal: closeCategoryModal,
  } = useModal();

  // ---------------------------
  // ✅ React Query Fetch
  // ---------------------------
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await fetchAllCategoriesFromDB();
      return result;
    },
  });

  // Pagination calculations
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = categories.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  // ---------------------------
  // ⏳ Loading Spinner UI
  // ---------------------------
  if (isLoading) {
    return (
      <DashboardLayout title="Categories" addBtn="Add Category">
        <Box
          sx={{
            width: "100%",
            py: 10,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  // ---------------------------
  // ❌ Error UI
  // ---------------------------
  if (isError) {
    return (
      <DashboardLayout title="Categories">
        <p style={{ color: "red" }}>Failed to load categories.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Categories"
      addBtn="Add Category"
      onClick={openCategoryModal}
    >
      {/* Categories Grid */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {paginatedData.map((cate, index) => (
          <CategoriesCard key={cate.id || index} data={cate} />
        ))}
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="secondary"
          size="large"
          sx={{
            "& .MuiPaginationItem-root": {
              fontWeight: 600,
            },
          }}
        />
      </Box>

      {/* Add Category Modal */}
      {isCategoryModal && (
        <CategoryModal
          open={isCategoryModal}
          onCloseModal={closeCategoryModal}
          title="Add Categories"
        />
      )}
    </DashboardLayout>
  );
};

export default Categories;
