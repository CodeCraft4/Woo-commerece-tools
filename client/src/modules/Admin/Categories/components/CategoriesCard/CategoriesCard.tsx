import { RemoveRedEyeOutlined } from "@mui/icons-material";
import { Box, Typography, IconButton } from "@mui/material";
import { COLORS } from "../../../../../constant/color";
import { useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../../../constant/route";


type CategoriesTypes = {
    data?: any
}


const CategoriesCard = (props: CategoriesTypes) => {

    const { data } = props
    console.log(data, '-')
    const navigate = useNavigate()

    return (
        <Box p={1} sx={{ width: 330 }}>
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    height: 230,
                    borderRadius: 1,
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover .overlay": {
                        opacity: 1,
                        transform: "translateY(0)",
                    },
                }}
            >
                {/* Image */}
                <Box
                    component="img"
                    src={data?.image_base64}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 1,
                        transition: "transform 0.4s ease",
                        "&:hover": { transform: "scale(1.05)" },
                    }}
                />

                {/* Overlay with Edit Button */}
                <Box
                    className="overlay"
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.67)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: 0,
                        transform: "translateY(40px)",
                        transition: "all 0.4s ease",
                    }}
                >
                    <IconButton
                        // onClick={() => navigate(`${ADMINS_DASHBOARD.ADD_CATEGORY}/${data.title}`)}
                        onClick={() => navigate(`${ADMINS_DASHBOARD.ADD_CATEGORY}/${data.title}`, { state: { categories: data } })}
                        sx={{
                            bgcolor: COLORS.white, color: COLORS.seconday, border: '1px solid black', outline: "2px solid white", "&:hover": {
                                bgcolor: COLORS.black,
                            }
                        }}>
                        <RemoveRedEyeOutlined />
                    </IconButton>
                </Box>
            </Box>

            <Box mt={1}>
                <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                    {data?.name}
                </Typography>
                {/* <Typography>{data?.items} Items</Typography> */}
            </Box>
        </Box>
    );
};

export default CategoriesCard;
