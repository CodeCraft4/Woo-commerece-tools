// import { useState } from "react";
// import { KeyboardArrowDown } from "@mui/icons-material";
// import { Box, Typography } from "@mui/material";

// const Description = () => {
//   const [showFullText, setShowFullText] = useState(false);

//   const handleToggleClick = () => {
//     setShowFullText(!showFullText);
//   };

//   return (
//     <Box mt={2} sx={{ color: "black",p:{lg:0,md:1,sm:0,xs:2} }}>
//       <Typography
//         sx={{
//           fontSize: "20px",
//           fontWeight: 800,
//           lineHeight: { md: "50px", sm: "", xs: "auto" },
//         }}
//       >
//         Make It Special with Personalised Cards and Gifts at DIY Personlisation
//       </Typography>
//       <Typography
//         sx={{
//           fontSize: { md: "16px", sm: "", xs: "15px" },
//           fontWeight: 700,
//           lineHeight: "40px",
//         }}
//       >
//         Unique Ideas for Every Occasion
//       </Typography>
//       <Typography
//         sx={{
//           fontSize: { md: "16px", sm: "", xs: "12px" },
//           fontWeight: 220,
//           mb: 2,
//         }}
//       >
//         Here at DIY Personalisation, you'll find 1,000's of brilliantly unique greeting
//         cards and gifts at your fingertips, ready to personalise with your
//         inside jokes, photos and heartfelt messages using our helpful online
//         editor. Perfect for creating a memorable keepsake that they can treasure
//         for years to come!
//       </Typography>
//       <Typography
//         sx={{
//           fontSize: { md: "16px", sm: "", xs: "12px" },
//           fontWeight: 220,
//           mb: 2,
//         }}
//       >
//         We specialise in helping you make every occasion special, from that
//         upcoming birthday or anniversary to engagements, housewarming, weddings,
//         congratulations, or any of life's other memorable moments!
//       </Typography>
//       <Typography
//         sx={{
//           fontSize: { md: "16px", sm: "", xs: "15px" },
//           fontWeight: 700,
//           lineHeight: "40px",
//         }}
//       >
//         Greeting Cards that Stand Out
//       </Typography>
//       <Typography
//         sx={{
//           fontSize: { md: "16px", sm: "", xs: "12px" },
//           fontWeight: 220,
//           mb: 2,
//         }}
//       >
//         Our cards are crafted with love and care, featuring a wide variety of
//         designs from classic and elegant to quirky and humorous. You'll find
//         something for everyone, whether you're looking for a simple birthday
//         card or a unique, personalised masterpiece.
//       </Typography>
//       <Typography
//         sx={{
//           fontSize: { md: "16px", sm: "", xs: "12px" },
//           fontWeight: 220,
//           mb: 2,
//         }}
//       >
//         Don't forget our range of gifts! From personalised mugs and cushions to
//         photo albums and calendars, we have the perfect present to complement
//         your card and make any occasion truly special.
//       </Typography>

//       {/* Conditionally render the additional content */}
//       {showFullText && (
//         <>
//           <Typography
//             sx={{
//               fontSize: { md: "16px", sm: "", xs: "12px" },
//               fontWeight: 220,
//               mb: 2,
//             }}
//           >
//             Make sure your greeting card stands out with exceptional cards in a
//             variety of personalised, funny and traditional designs. So, whether
//             it's a birthday card or a thank you card, you'll find thousands of
//             designs to help you choose the perfect idea. All cards are printed
//             to a high quality and can be sent with same-day despatch if ordered
//             before our cut-off time. If you're feeling something new, why not go
//             for our premium square cards, printed on FSC® certified high-quality
//             card for an exceptional feel?
//           </Typography>
//           <Typography
//             sx={{
//               fontSize: { md: "16px", sm: "", xs: "15px" },
//               fontWeight: 700,
//               lineHeight: "50px",
//             }}
//           >
//             Gifts and Flowers to Make Their Day
//           </Typography>
//           <Typography
//             sx={{
//               fontSize: { md: "15px", sm: "", xs: "14px" },
//               fontWeight: 300,
//               mb: 2,
//             }}
//           >
//             Our gifts start from just £3.99, including loads of personalised
//             gift ideas where you add your photos, special messages or names.
//             From t-shirts to calendars, mugs, cushions, keyrings, alcohol and
//             chocolates, add your photos to an almost endless selection of
//             presents, with many ranges available to be sent with same-day
//             despatch! You can also add a custom inscription to our
//             engraved-gifts, from jewellery to glasses.
//           </Typography>
//           <Typography
//             sx={{
//               fontSize: { md: "16px", sm: "", xs: "12px" },
//               fontWeight: 300,
//               mb: 2,
//             }}
//           >
//             We've also got an ever-growing range of trending gifts and novelty
//             ideas, including anything from drinking themed games and gifts to
//             kids' toys and ideas for all kinds of seasonal occasions. Plus, you
//             can now send beautiful flowers and plants to their door, from
//             magnificent birthday bouquets or anniversary flowers to easy care
//             plants for the home!
//           </Typography>
//         </>
//       )}

//       {/* The clickable "Read More/Read Less" button */}
//       <Box
//         onClick={handleToggleClick}
//         sx={{
//           textAlign: "center",
//           display: "flex",
//           gap: 1,
//           mt: 3,
//           fontSize: "20px",
//           alignItems: "center",
//           justifyContent: "center",
//           cursor: "pointer",
//         }}
//       >
//         <Typography sx={{ color: "rgba(105, 53, 105, 1)", fontWeight: 700 }}>
//           {showFullText ? "Read Less" : "Read More"}
//         </Typography>
//         <KeyboardArrowDown
//           fontSize="large"
//           sx={{
//             transform: showFullText ? "rotate(180deg)" : "rotate(0deg)",
//             transition: "transform 0.3s ease-in-out",
//             color: "rgba(105, 53, 105, 1)",
//           }}
//         />
//       </Box>
//       <hr />
//       <Typography
//         sx={{
//           fontSize: { md: "17px", sm: "", xs: "12px" },
//           fontWeight:300,
//           mt: {md:4,sm:4,xs:1},
//         }}
//       >
//         © Disney. © Disney/Pixar. © Disney. Winnie the Pooh elements are based
//         on the “Winnie the Pooh” works by A.A. Milne E.H. Shepard.
//       </Typography>
//     </Box>
//   );
// };

// export default Description;

import { Box, Typography } from '@mui/material'

const Description = () => {
  return (
    <Box>

      <Box
        component={'img'}
        src='/assets/images/simple-blackLOGO.png'
        sx={{
          width: { md: 400, sm: 150, xs: 120 },
          height: 'auto',
          mb: 4,
          display: 'flex',
          m: 'auto',
          justifyContent: 'center',
        }}
      />

      <Typography sx={{ fontSize: { md: 22, sm: 18, xs: 16 }, mt: 2, textAlign: 'start' }}>
        DIY Personalisation is a UK based plateform thats lets you personalise and instantly download printable cards, invites and gifts, so you create and print them anywhere in the world.
      </Typography>
      <Typography sx={{ fontSize: { md: 22, sm: 18, xs: 16 }, mt: 2, textAlign: 'start', display: 'flex', justifyContent: 'flex-start' }}>
        Design are download printable PDFs, making them accessible globally with no shipping, <br /> delay or borders
      </Typography>

      <Box sx={{ textAlign: "center", py: { xs: 2, md: 3 } }}>
        {/* Line 1 */}
        <Typography
          sx={{
            fontSize: { xs: 22, sm: 28, md: 22 },
            fontWeight: 500,
            color: "#111",
            lineHeight: 1.15,
            mb: 0.5,
          }}
        >
          Personalised designs. Printed your way.
        </Typography>

        {/* Line 2 */}
        <Typography
          sx={{
            fontSize: { xs: 18, sm: 22, md: 22 },
            fontWeight: 500,
            color: "#111",
            lineHeight: 1.2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap", // responsive
          }}
        >
          <span>Instant downloads</span>
          <span style={{ fontSize: "1.2em" }}>•</span>
          <span>No delivery No Waiting</span>
          <span style={{ fontSize: "1.2em" }}>•</span>
          <span>Made by you</span>
        </Typography>
      </Box>

    </Box>
  )
}

export default Description