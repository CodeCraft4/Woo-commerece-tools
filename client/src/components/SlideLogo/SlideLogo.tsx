// SlideLogo.tsx
import { Box, Typography } from "@mui/material";

const SlideLogo = () => {
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        fontWeight: "bold",
        color: "black",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Box
       component={'img'}
       src="/assets/images/blackLOGO.png"
       sx={{width:300}}
      />
      <Typography sx={{ maxWidth: 400, textAlign: "center" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque recusandae alias dignissimos sunt ab! Pariatur minima placeat hic enim quis facilis ducimus neque culpa sequi delectus atque praesentium in laboriosam tempora aspernatur deleniti molestias rerum,
      </Typography>
    </Box>
  );
};

export default SlideLogo;