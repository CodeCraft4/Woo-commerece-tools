import { Box, Typography } from "@mui/material";
import MainLayout from "../../../layout/MainLayout";
import ViewAllCard from "../../../components/ViewAllCard/ViewAllCard";
import { useLocation, useParams } from "react-router-dom";

const ViewAll = () => {
  const { search } = useParams();
  const location = useLocation();
  const categoryId = location.state?.categoryId || null;
  const categoryTitle = decodeURIComponent(search || "");

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          // width: "100%",
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
          <Typography
            sx={{
              fontSize: { md: "30px", sm: "30px", xs: "24px" },
              fontWeight: "bold",
            }}
          >
            {categoryTitle}{" "}
            <span style={{ fontSize: "13px" }}>1234 results</span>
          </Typography>
          <Typography
            sx={{
              fontSize: { md: "14px", xs: "10px" },
              // fontWeight: 300,
              textAlign: "center",
              width: { md: "100%", xs: "90%" },
            }}
          >
            Browse all products under <b>{categoryTitle}</b> category.
          </Typography>
        </Box>
        <ViewAllCard category={categoryId} />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </Box>
    </MainLayout>
  );
};

export default ViewAll;
