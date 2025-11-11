import React, { useState } from "react";
import { Box, Pagination } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import CategoriesCard from "./components/CategoriesCard/CategoriesCard";
import { DUMMY_CATEGORIES } from "../../../constant/data";

const Categories = () => {
  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Calculate visible data
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = DUMMY_CATEGORIES.slice(startIndex, endIndex);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    console.log(event)
  };

  const totalPages = Math.ceil(DUMMY_CATEGORIES.length / itemsPerPage);

  return (
    <DashboardLayout title="Categories" addBtn="Add Category">
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: { xs: "center", sm: "flex-start" },
          p:2
        }}
      >
        {paginatedData.map((cate, index) => (
          <CategoriesCard key={index} data={cate} />
        ))}
      </Box>

      {/* ✅ Pagination Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChange}
          color="secondary"
          // shape="rounded"
          size="large"
          sx={{
            "& .MuiPaginationItem-root": {
              fontWeight: 600,
            },
          }}
        />
      </Box>
    </DashboardLayout>
  );
};

export default Categories;
