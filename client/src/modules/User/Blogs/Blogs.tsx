import { Box, Typography } from '@mui/material'
import MainLayout from '../../../layout/MainLayout'
import { COLORS } from '../../../constant/color'
import BlogCard from './components/BlogCard/BlogCard'
import { BLOGS_DATA } from '../../../constant/data'

const Blogs = () => {
    // const locaiton = useLocation()
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
                }}
            >
                {/* <Typography sx={{ fontSize: { md: 22, sm: 20, xs: 18, color: COLORS.primary } }}>Home <span style={{color:COLORS.seconday}}>{locaiton.pathname}</span></Typography> */}
                <Typography
                    sx={{
                        fontSize: { md: "80px", sm: "50px", xs: "35px" },
                        textAlign: "center",
                        p: 2,
                        fontFamily: "'Dancing Script', cursive",
                        fontWeight: 700,
                        background: "linear-gradient(to top, red, lightGray)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: 2,
                    }}
                >
                    Our Blogs
                </Typography>

                <Typography sx={{ fontSize: { md: '35px', sm: '35px', xs: '25px', textAlign: 'center', fontWeight: 700, color: COLORS.seconday } }}>
                    Latest Blogs
                </Typography>

                <Box sx={{ width: '100%', display: { md: 'flex', sm: 'flex', xs: "block" }, gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {BLOGS_DATA.map((blg: any) => (
                        <Box sx={{ mb: { md: 6, sm: 5, xs: 2 } }}>
                            <BlogCard data={blg} />
                        </Box>
                    ))}
                </Box>

            </Box>
        </MainLayout >
    )
}

export default Blogs