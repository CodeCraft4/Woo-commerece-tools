import { Box, Typography } from '@mui/material'
import { COLORS } from '../../../../../constant/color'
import { useNavigate } from 'react-router-dom'
import { USER_ROUTES } from '../../../../../constant/route'

type BlogCardType = {
    data?: any
}
const BlogCard = (props: BlogCardType) => {
    const { data } = props || {}

    const navigate = useNavigate();

    return (
        <Box
            onClick={() => navigate(`${USER_ROUTES.OUR_BLOGS_DETAILS}/${data.id}`)}
            sx={{
                width: { md: 300, sm: 300, xs: '100%' },
                height: 'auto',
                overflow: 'hidden',
                cursor: 'pointer',
                "&:hover .underlineText": {
                    textDecoration: "underline",
                }
            }}
        >
            <Box
                component="img"
                src={data?.poster || '/assets/images/animated-banner.jpg'}
                sx={{ width: '100%', height: 300, objectFit: 'cover' }}
            />

            <Typography
                className="underlineText"
                sx={{ fontSize: 22, fontWeight: 600, color: COLORS.seconday }}
            >
                {data.title.slice(0, 25)}
            </Typography>

            <Typography
                className="underlineText"
                sx={{ fontSize: 16, color: COLORS.black }}
            >
                {data.description1?.slice(0, 100)}
            </Typography>
        </Box>

    )
}

export default BlogCard