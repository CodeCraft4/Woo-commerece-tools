import { Box } from "@mui/material";
import Navbar from "./components/Navbar/Navbar";

type Props = {
  children: React.ReactNode;
};

const Applayout = ({ children }: Props) => {

  return (
    <Box sx={{
      height: "100vh",
    }}
    >
      <Navbar />
      <Box component="main">
        {children}
      </Box>
    </Box>
  );
};

export default Applayout;
