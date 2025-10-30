import { Box } from "@mui/material";
import Navbar from "./components/Navbar/Navbar";

type Props = {
  children: React.ReactNode;
};

const Applayout = ({ children }: Props) => {
  
  return (
    <Box>
      <Navbar />
      {children}
    </Box>
  );
};

export default Applayout;
