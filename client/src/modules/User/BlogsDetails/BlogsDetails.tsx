import { useParams } from 'react-router-dom';
import MainLayout from '../../../layout/MainLayout'
import { BLOGS_DATA } from '../../../constant/data';
import { Box, Typography } from '@mui/material';
import { COLORS } from '../../../constant/color';

const BlogsDetails = () => {


    const { id } = useParams();
    const blog = BLOGS_DATA.find((b) => b.id === Number(id));

    if (!blog) return <div>Blog not found</div>;
    return (
        <MainLayout>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "40px",
                    width: { lg: "1340px", md: "100%", sm: "100%", xs: "100%" },
                    justifyContent: "center",
                    m: "auto",
                    p: { lg: 3, md: 3, sm: 3, xs: 1 },
                    mb: { md: 9, sm: 7, xs: 3 }
                }}
            >
                {/* <Banner /> */}
                <Typography sx={{
                    fontSize: { md: "60px", sm: "50px", xs: "35px" },
                    textAlign: "center",
                    p: 2,
                    fontFamily: "'Dancing Script', cursive",
                    fontWeight: 700,
                    background: `linear-gradient(to top, ${COLORS.seconday}, lightGray)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: 2,
                }}>
                    {blog.title}
                </Typography>
                <Box
                    component="img"
                    src={blog.poster}
                    sx={{ width: "100%", height: 600, objectFit: "contain", mb: 3 }}
                />
                <Typography sx={{ fontSize: 18, lineHeight: 1.8 }}>
                    {blog.description1}
                </Typography>
                <Typography sx={{ fontSize: 18, }}>
                    {blog.description2}
                </Typography>
            </Box>
        </MainLayout>
    )
}

export default BlogsDetails