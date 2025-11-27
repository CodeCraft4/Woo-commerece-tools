import MainLayout from '../../../layout/MainLayout'
import { Box, Typography } from '@mui/material'
import CommunityChat from './components/CommunityChat/CommunityChat'

const CommunityHub = () => {
    return (
        <MainLayout>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "30px",
                    width: { lg: "1340px", md: "100%", sm: "100%", xs: "100%" },
                    justifyContent: "center",
                    m: "auto",
                    p: { lg: 3, md: 3, sm: 3, xs: 1 },
                    mb: { md: 9, sm: 6, xs: 4 }
                }}
            >  <Typography
                sx={{
                    fontSize: { md: "50px", sm: "40px", xs: "25px" },
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
                    Wellcome to Community Hub
                </Typography>


                {/* Chatting Hub */}
                <CommunityChat />

            </Box>
        </MainLayout>
    )
}

export default CommunityHub