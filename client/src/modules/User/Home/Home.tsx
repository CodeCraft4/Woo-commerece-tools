
import WishCard from "../../../components/WishCard/WishCard";
import Applayout from "../../../layout/Applayout";
import { Box } from "@mui/material";

const Home = () => {

  return (
    <Applayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "90vh",
          alignItems: "center",
          m: "auto",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <WishCard />
      </Box>
    </Applayout>
  );
};

export default Home;
