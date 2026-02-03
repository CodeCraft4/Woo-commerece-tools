// import * as React from "react";
// import { Box, Paper, Avatar, Typography, useTheme } from "@mui/material";
// import {
//     AccessTimeRounded,
//     BoltRounded,
//     InventoryRounded,
//     SentimentSatisfiedAltRounded,
// } from "@mui/icons-material";
// import { COLORS } from "../../../../../constant/color";

// type WhyChooseItem = {
//     icon: React.ReactNode;
//     title: string;
//     desc: string;
//     tint: string;
// };

// type WhyChooseProps = {
//     imageSrc?: string;
//     items?: WhyChooseItem[];
//     heading?: string;
// };

// const DEFAULT_ITEMS: WhyChooseItem[] = [
//     { icon: <AccessTimeRounded />, title: "Less Time Waiting", desc: "Instant PDFs, no waiting, no shipping delays", tint: "#E6F0FF" },
//     { icon: <BoltRounded />, title: "More Efficient", desc: "Save money with print at home personalised designs", tint: "#F3E8FF" },
//     { icon: <InventoryRounded />, title: "Longer Lasting", desc: "Perfect for personalised cards, invites, T-shirts, mugs & more", tint: "#FFEAE5" },
//     { icon: <SentimentSatisfiedAltRounded />, title: "More Comfortable Experience", desc: "Beautiful templates created for real life moments", tint: "#E9FBF1" },
// ];

// const WhyChoose: React.FC<WhyChooseProps> = ({
//     imageSrc = "/assets/images/banner2.jpg",
//     items = DEFAULT_ITEMS,
//     heading = "Why Choose DIY Personalisation?",
// }) => {
//     const theme = useTheme();

//     return (
//         <Box sx={{ mt: { md: 8, sm: 6, xs: 4 }, px: { md: 2, sm: 2, xs: 1 } }}>
//             {/* Heading */}
//             <Box sx={{ textAlign: "center", mb: { md: 4, xs: 3 } }}>
//                 <Typography
//                     component="h2"
//                     sx={{
//                         fontSize: { md: 32, sm: 28, xs: 22 },
//                         fontWeight: 800,
//                         color: COLORS.seconday,
//                     }}
//                 >
//                     {heading}
//                 </Typography>
//                 <Box
//                     sx={{
//                         width: 72,
//                         height: 5,
//                         borderRadius: 999,
//                         mx: "auto",
//                         mt: 1,
//                         background: "linear-gradient(90deg, #FDBA74 0%, #FDBA74 60%, transparent 60%)",
//                     }}
//                 />
//             </Box>

//             {/* Panel */}
//             <Box
//                 sx={{
//                     borderRadius: 4,
//                     p: { md: 3, sm: 2, xs: 2 },
//                     bgcolor: "#b7f7f4a4",
//                     border: "1px solid rgba(59,130,246,0.15)",
//                     boxShadow:
//                         theme.palette.mode === "light"
//                             ? "0 10px 30px rgba(2,32,71,0.08)"
//                             : "0 10px 30px rgba(0,0,0,0.4)",
//                 }}
//             >
//                 {/* FLEX ROW */}
//                 <Box
//                     sx={{
//                         display: "flex",
//                         gap: { md: 3, xs: 2 },
//                         alignItems: "stretch",
//                         flexDirection: { xs: "column", md: "row" },
//                     }}
//                 >
//                     {/* Left: stacked cards */}
//                     <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
//                         {items.map((it, i) => (
//                             <Paper
//                                 key={it.title + i}
//                                 elevation={0}
//                                 sx={{
//                                     p: { md: 2.5, xs: 2 },
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: 2,
//                                     borderRadius: 3,
//                                     border: "1px solid rgba(0,0,0,0.06)",
//                                     background: "#fff",
//                                     boxShadow: 2,
//                                 }}
//                             >
//                                 <Avatar
//                                     sx={{
//                                         width: 48,
//                                         height: 48,
//                                         bgcolor: it.tint,
//                                         color: "#1E3A8A",
//                                         border: "1px solid rgba(0,0,0,0.06)",
//                                         flexShrink: 0,
//                                     }}
//                                 >
//                                     {it.icon}
//                                 </Avatar>

//                                 <Box sx={{ minWidth: 0 }}>
//                                     {/* <Typography
//                                         sx={{
//                                             fontWeight: 800,
//                                             fontSize: { md: 16, xs: 15 },
//                                             color: "#0B3A72",
//                                             mb: 0.5,
//                                         }}
//                                     >
//                                         {it.title}
//                                     </Typography> */}
//                                     <Typography
//                                         sx={{
//                                             color: "rgba(15,23,42,0.75)",
//                                             fontSize: { md: 14, xs: 13.5 },
//                                             lineHeight: 1.7,
//                                         }}
//                                     >
//                                         {it.desc}
//                                     </Typography>
//                                 </Box>
//                             </Paper>
//                         ))}
//                     </Box>

//                     {/* Right: image with rounded frame */}
//                     <Box
//                         sx={{
//                             flex: 1,
//                             position: "relative",
//                             height: { md: 400, sm: 320, xs: 240 },
//                             borderRadius: 3,
//                             overflow: "hidden",
//                             background: "linear-gradient(45deg, #DBEAFE, #EFF6FF)",
//                         }}
//                     >
//                         <Box
//                             component="img"
//                             src={imageSrc}
//                             alt="Why Choose Illustration"
//                             onError={(e) => {
//                                 // why: ensure a visual even if path is wrong
//                                 (e.currentTarget as HTMLImageElement).src = "/assets/images/fallback.jpg";
//                             }}
//                             sx={{
//                                 position: "absolute",
//                                 inset: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                                 borderRadius: 4,
//                                 display: "block", // crucial for some browsers
//                             }}
//                         />
//                     </Box>
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// export default WhyChoose;

import { Box, Typography } from "@mui/material";
import { COLORS } from "../../../../../constant/color";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../../../constant/route";

const bullets = [
    {
        id: 1,
        title: "Instant PDFs,  no waiting, no shipping delays",
        borderColor: COLORS.primary
    },
    {
        id: 2,
        title: "Print at home and save money on personalised designs",
        borderColor: COLORS.seconday
    },
    {
        id: 3,
        title: "Perfect for cards, invites, clothing, mugs and more",
        borderColor: COLORS.green
    },
    {
        id: 4,
        title: "Beautiful templates designed for every life moment",
        borderColor: COLORS.black
    },
];

export default function WhyChoose() {

    const navigate = useNavigate()

    return (
        <Box sx={{ width: "100%",mt:1 }}>
            <Typography
                sx={{
                    fontSize: { md: 35, sm: 30, xs: 20 },
                    fontWeight: 700,
                    color: COLORS.black,
                    lineHeight: 1.2,
                    textAlign: "center",
                    // mb: 2,
                }}
            >
              Unlimited personalisation, one simple subscription.
            </Typography>
             <Typography sx={{ fontSize: { md: 24, sm: 25, xs: 'auto'},textAlign:'start' }}>Create more, spend less with DIY Personalisation subscription.</Typography>

            {/* Purple panel */}
            <Box
                sx={{
                    bgcolor: COLORS.white,
                    borderWidth: 4,
                    borderStyle: "solid",
                    borderColor: COLORS.seconday,
                    borderRadius: 3,
                    p: { md: 2, sm: 2, xs: 2 },
                    display: "flex",
                    alignItems: "stretch",
                    gap: { md: 3, xs: 2 },
                    flexDirection: { xs: "column", md: "row" },
                    height: 400,
                }}
            >
                {/* Left list */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: { md: 2, xs: 1.5 },
                        justifyContent: "center",
                    }}
                >
                    {bullets.map((text) => (
                        <Box
                            key={text.id}
                            sx={{
                                bgcolor: "#fff",
                                borderRadius: 3,
                                borderWidth: 3,
                                borderStyle: 'solid',
                                borderColor: text.borderColor,
                                px: { md: 2.5, xs: 2 },
                                py: { md: 1.2, xs: 1 },
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            {/* bullet dot */}
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: "#111",
                                    flexShrink: 0,
                                    // mt: "2px",
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: { md: 22, sm: 20, xs: 16 },
                                    fontWeight: 500,
                                    color: "#111",
                                    lineHeight: 1.1,
                                }}
                            >
                                {text.title}
                            </Typography>
                        </Box>
                    ))}

                    <Box sx={{ bgcolor: COLORS.black, color: COLORS.white, p: 2, display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderRadius: 3 }}>
                        <Typography sx={{ fontSize: { md: 22, sm: 25, xs: 'auto' } }}>DIY P Creator subscription <br /> $25 a month Cancel anytime</Typography>
                        <LandingButton title="Start my subscription" active personal bgblack width="250px" onClick={() => navigate(USER_ROUTES.PREMIUM_PLANS)} />
                    </Box>

                </Box>

                {/* Right image */}
                <Box
                    sx={{
                        width: { xs: "100%", md: 500 },
                        height: '100%',
                        overflow: "hidden",
                        flexShrink: 0,
                    }}
                >
                    <Box
                        component="img"
                        src="/assets/images/lifestyle.png"
                        alt="DIY Personalisation"
                        sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2, }}
                    />
                </Box>
            </Box>
        </Box>
    );
}