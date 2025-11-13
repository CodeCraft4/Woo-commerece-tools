
import WishCard from "../../../components/WishCard/WishCard";
import Applayout from "../../../layout/Applayout";
import { Box } from "@mui/material";

const Home = () => {

  return (
    <Applayout>
      <Box
        sx={{
          height: {md: "93.7dvh", sm: "93.7dvh", xs: '83dvh' },
          }}
      >
        <WishCard />
      </Box>
    </Applayout>
  );
};

export default Home;
