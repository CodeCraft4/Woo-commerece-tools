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
      <Typography variant="h3">LOGO</Typography>
      <Typography sx={{ maxWidth: 400, textAlign: "center" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque recusandae alias dignissimos sunt ab! Pariatur minima placeat hic enim quis facilis ducimus neque culpa sequi delectus atque praesentium in laboriosam tempora aspernatur deleniti molestias rerum, quo consequatur ipsa repudiandae. Maiores dignissimos odit error est quisquam ratione hic nostrum sunt assumenda eaque totam ea libero, aliquid omnis molestiae magnam iure ducimus saepe minima minus ipsa! Vel, laborum reprehenderit nisi in, corrupti omnis modi illo cum adipisci magni voluptate magnam voluptates deserunt commodi cumque incidunt recusandae aut inventore ex suscipit nam, voluptatum sunt praesentium a? Debitis excepturi temporibus itaque consequuntur nulla optio?
      </Typography>
    </Box>
  );
};

export default SlideLogo;