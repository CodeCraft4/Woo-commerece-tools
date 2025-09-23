import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";

type CategoryType = {
  id: number;
  poster: string;
  title: string;
};

const CategoryCard = (props: CategoryType) => {
  const { id, poster, title } = props;

  return (
    <Box
      key={id}
      sx={{
        border: "2px solid lightgray",
        borderRadius: 2,
        p: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: {md:"300px",sm:'',xs:'130px'},
        height: "200px",
        alignItems: "center",
        textAlign: "center",
        bgcolor: COLORS.white,
        cursor:'pointer',
        transition: "border-color 0.3s ease",
        "&:hover": {
          borderColor: "black",
          borderWidth:2
        },
        "&:hover img": {
          transform: "scale(1.2)", 
        },
      }}
    >
      <Box
        component={"img"}
        src={poster}
        alt="categoryImg"
        sx={{
          width: {md:'100px',sm:'',xs:'70px'},
          height: {md:'100px',sm:'',xs:'70px'},
          borderRadius: "50%",
          objectFit: "cover",
          transition: "transform 0.3s ease",
        }}
      />
      <Typography sx={{ mt: 2, fontWeight: 600, fontSize: {md:"18px",sm:'',xs:'14px'},color:'#212121' }}>
        {title}
      </Typography>
    </Box>
  );
};

export default CategoryCard;
