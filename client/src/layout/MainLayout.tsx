import { Box } from "@mui/material";
import Header from "./components/Header/Header";
// import MegaMenu from "../components/MegaMenu/MegaMenu";
import Footer from "./components/Footer/Footer";
import StickerLine from "../components/StickerLine/StickerLine";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <Box>
      <Header />
      <StickerLine />
        {children}
        <Footer />
    </Box>
  );
};

export default MainLayout;
