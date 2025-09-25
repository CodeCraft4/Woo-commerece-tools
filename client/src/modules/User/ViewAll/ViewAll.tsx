import { Box, Typography } from "@mui/material";
import MainLayout from "../../../layout/MainLayout";
import ViewAllCard from "../../../components/ViewAllCard/ViewAllCard";

const ViewAll = () => {
  return (
    <MainLayout>
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
        <Typography sx={{ fontSize: "30px", fontWeight: "bold" }}>
          Search Title <span style={{ fontSize: "15px" }}>1234 results</span>{" "}
        </Typography>
        <Typography sx={{ fontSize: "14px", fontWeight: 300 }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae
          ullam harum omnis quod molestias cum eaque nostrum cupiditate ipsam
          fugit officiis vero facere, minus tempore, corrupti incidunt, facilis
          nam voluptatibus temporibus est et quia odit possimus blanditiis!
          Animi, enim. Molestias. Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Modi obcaecati esse sunt voluptatum corporis atque
          sed rem ea, ad quae!
        </Typography>
      </Box>
        <ViewAllCard />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
    </MainLayout>
  );
};

export default ViewAll;
