import { Box, Typography } from "@mui/material";
import MainLayout from "../../../layout/MainLayout";
import ViewAllCard from "../../../components/ViewAllCard/ViewAllCard";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCardsFromDB, fetchAllCategoriesFromDB } from "../../../source/source";

const norm = (s?: string) => (s ?? "").toLowerCase().trim();

const ViewAll = () => {
  const { search } = useParams();
  const location = useLocation();

  const routeCategoryName = decodeURIComponent(search ?? "").trim();
  const normalizedRouteName = norm(routeCategoryName);

  const { data: allCards = [] } = useQuery({
    queryKey: ["allCards"],
    queryFn: fetchAllCardsFromDB,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  console.log(allCards,'---')

  const { data: allCategories = [] } = useQuery({
    queryKey: ["allCategories"],
    queryFn: fetchAllCategoriesFromDB,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  let categoryId: string | number | null = location.state?.categoryId ?? null;
  if (!categoryId && normalizedRouteName && allCategories.length > 0) {
    const hit = allCategories.find(
      (c: any) => norm(c?.name) === normalizedRouteName
    );
    categoryId = hit?.id ?? null;
  }

  const title = routeCategoryName || "All Products";

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          width: { lg: "1340px", md: "100%", sm: "100%", xs: "100%" },
          justifyContent: "center",
          m: "auto",
          p: { lg: 3, md: 3, sm: 3, xs: 1 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 250,
            flexDirection: "column",
            m: "auto",
          }}
        >
          <Typography sx={{ fontSize: { md: "30px", sm: "30px", xs: "24px" }, fontWeight: "bold" }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: { md: "14px", xs: "10px" }, textAlign: "center", width: { md: "100%", xs: "90%" } }}>
            {routeCategoryName ? (
              <>Browse all products under <b>{routeCategoryName}</b> category.</>
            ) : (
              <>Browse all products.</>
            )}
          </Typography>
        </Box>

        <ViewAllCard
          categoryId={categoryId}
          categoryName={routeCategoryName}
          allCategories={allCategories}
          cardData={allCards}
        />

        <Box sx={{ height: 200 }} />
      </Box>
    </MainLayout>
  );
};

export default ViewAll