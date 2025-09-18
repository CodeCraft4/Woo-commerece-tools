import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        height: "100px",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:'white',
        boxShadow:'4px 0px 8px #929292ff'
      }}
    >
      <Typography>Footer Area</Typography>
    </Box>
  );
};

export default Footer;
