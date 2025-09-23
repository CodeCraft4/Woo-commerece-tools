// import { useState } from "react";
// import { Box, Container, Typography } from "@mui/material";
// import { Grid, styled } from "@mui/system";

// const COLORS = {
//   primary: "#241257",
//   white: "#FFFFFF",
//   textGray: "#555555",
// };

// // Data structured to match the reference image's columns
// const megaMenuData = {
//   "Birthday Cards": {
//     images: [
//       {
//         label: "Birthday Cards for Her",
//         url: "https://placehold.co/120x150/e0e0e0/ffffff?text=For+Her",
//       },
//       {
//         label: "Birthday Cards for Him",
//         url: "https://placehold.co/120x150/e0e0e0/ffffff?text=For+Him",
//       },
//       {
//         label: "Birthday Cards for Kids",
//         url: "https://placehold.co/120x150/e0e0e0/ffffff?text=For+Kids",
//       },
//       {
//         label: "Birthday Age Cards",
//         url: "https://placehold.co/120x150/e0e0e0/ffffff?text=Age+Cards",
//       },
//       {
//         label: "Funky Face Cards",
//         url: "https://placehold.co/120x150/e0e0e0/ffffff?text=Funky+Face",
//       },
//       {
//         label: "Premium Square Birthday Cards",
//         url: "https://placehold.co/120x150/e0e0e0/ffffff?text=Premium",
//       },
//     ],
//     lists: [
//       {
//         title: "Who's it For",
//         items: [
//           "For Her",
//           "For Him",
//           "Kids",
//           "Girls",
//           "Boys",
//           "Female Friend",
//           "Male Friend",
//           "Mum",
//           "Dad",
//           "Daughter",
//           "Son",
//           "Sister",
//           "Brother",
//           "Wife",
//           "Husband",
//           "LGBTQ+",
//         ],
//       },
//       {
//         title: "Age",
//         items: [
//           "1st Birthday",
//           "18th Birthday",
//           "21st Birthday",
//           "30th Birthday",
//           "40th Birthday",
//           "50th Birthday",
//           "60th Birthday",
//           "70th Birthday",
//           "80th Birthday",
//           "All Ages",
//         ],
//       },
//       {
//         title: "Card Styles",
//         items: [
//           "Bestselling",
//           "Create Your Own",
//           "Cute",
//           "Funky Face Cards",
//           "Funny",
//           "Giant",
//           "Multi Photo Upload",
//           "New In Birthday",
//           "October Birthday",
//           "Photo Upload",
//           "Premium Square Cards",
//           "Rude",
//           "September Birthday",
//           "Traditional",
//           "Trending",
//         ],
//       },
//       {
//         title: "Brands",
//         items: [
//           "Barley Bear",
//           "Bluey",
//           "Boofle",
//           "Cath Kidston",
//           "Disney",
//           "Harry Potter",
//           "Hello Kitty",
//           "Lilo & Stitch",
//           "Me to You",
//           "Minecraft",
//           "Peppa Pig",
//           "Paw Patrol",
//           "Pokemon",
//           "Swizzels Love Heart",
//           "Wallace & Gromit",
//         ],
//       },
//     ],
//   },
//   Cards: {
//     lists: [
//       {
//         title: "Occasions",
//         items: [
//           "Birthday",
//           "Anniversary",
//           "Engagement",
//           "New Home",
//           "Wedding",
//           "Congratulations",
//         ],
//       },
//       {
//         title: "Recipient",
//         items: ["Friends", "Family", "Partner", "Colleagues"],
//       },
//       {
//         title: "Types",
//         items: ["Photo Cards", "Funny Cards", "Personalised Cards"],
//       },
//     ],
//   },
//   "Personalised Gifts": {
//     lists: [
//       {
//         title: "By Recipient",
//         items: ["Gifts for Her", "Gifts for Him", "Gifts for Kids"],
//       },
//       {
//         title: "By Type",
//         items: ["Mugs", "Cushions", "Keyrings", "Photo Gifts"],
//       },
//       { title: "By Occasion", items: ["Birthday", "Anniversary", "Thank You"] },
//     ],
//   },
//   Gifts: {
//     lists: [
//       { title: "Categories", items: ["Luxury", "Budget", "Corporate"] },
//       {
//         title: "Gifts for Her",
//         items: ["Jewellery", "Spa Sets", "Chocolates"],
//       },
//       { title: "Gifts for Him", items: ["Gadgets", "Watches", "Wallets"] },
//     ],
//   },
//   Flowers: {
//     lists: [
//       {
//         title: "By Flower",
//         items: ["Roses", "Tulips", "Lilies", "Sunflowers"],
//       },
//       {
//         title: "By Occasion",
//         items: ["Anniversary", "Birthday", "Get Well Soon"],
//       },
//       { title: "By Colour", items: ["Red", "White", "Pink", "Yellow"] },
//     ],
//   },
//   Offers: {
//     lists: [
//       {
//         title: "Special Offers",
//         items: ["50% Off", "Buy 1 Get 1", "New Arrivals"],
//       },
//       {
//         title: "Clearance",
//         items: ["Last Chance Items", "Discontinued Designs"],
//       },
//       { title: "Promotions", items: ["Student Discount", "NHS Discount"] },
//     ],
//   },
// };

// const links = Object.keys(megaMenuData);

// const MegaMenuContainer = styled(Box)({
//   position: "absolute",
//   top: "100%",
//   left: "50%",
//   transform: "translateX(-50%)",
//   width: "100%",
//   maxWidth: "md",
//   hight: "100vh",
//   maxHeight: "100vh",
//   overflowY: "auto",
//   background: COLORS.white,
//   boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
//   padding: 3,
//   zIndex: 1000,
// });

// const SectionTitle = styled(Typography)({
//   fontWeight: "bold",
//   fontSize: "18px",
//   lineHeight: "2",
//   marginBottom: "8px",
//   borderBottom: `2px solid #ccc`,
//   paddingBottom: "4px",
// });

// const MegaMenuItem = styled(Typography)({
//   color: COLORS.textGray,
//   fontSize: "16px",
//   lineHeight: "1.5",
//   "&:hover": {
//     color: COLORS.primary,
//     textDecoration: "underline",
//   },
// });

// const MegaMenu = () => {
//   const [activeMenu, setActiveMenu] = useState(null);

//   return (
//     <Box
//       sx={{ bgcolor: COLORS.primary, py: 1, px: 2, position: "relative" }}
//       onMouseLeave={() => setActiveMenu(null)}
//     >
//             {/* Top nav links */}     {" "}
//       <Container
//         sx={{
//           display: "flex",
//           gap: { xs: 2, sm: 4 },
//           justifyContent: "center",
//           flexWrap: "wrap",
//         }}
//       >
//                {" "}
//         {links.map((link:any) => (
//           <Box
//             key={link}
//             sx={{ cursor: "pointer" }}
//             onMouseEnter={() => setActiveMenu(link)} // Set the specific menu on hover
//           >
//                        {" "}
//             <Typography sx={{ color: COLORS.white, fontWeight: "bold" }}>
//                             {link}           {" "}
//             </Typography>
//                      {" "}
//           </Box>
//         ))}
//              {" "}
//       </Container>
//                   {/* Mega Menu Content */}     {" "}
//       {activeMenu && (
//         <MegaMenuContainer>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={8}>
//               <Grid container spacing={2}>
//                 {megaMenuData[activeMenu]?.lists?.map((list:any, index:number) => (
//                   <Grid
//                     item
//                     xs={12}
//                      sm={12 / megaMenuData[activeMenu]?.lists.length}
//                     key={index}
//                   >
//                                        {" "}
//                     <SectionTitle>{list.title}</SectionTitle>                   {" "}
//                     {list.items.map((item, itemIndex) => (
//                       <MegaMenuItem key={itemIndex}>{item}</MegaMenuItem>
//                     ))}
//                                      {" "}
//                   </Grid>
//                 ))}
//                              {" "}
//               </Grid>
//                          {" "}
//             </Grid>
//                      {" "}
//           </Grid>
//                  {" "}
//         </MegaMenuContainer>
//       )}
//          {" "}
//     </Box>
//   );
// };

// export default MegaMenu;
