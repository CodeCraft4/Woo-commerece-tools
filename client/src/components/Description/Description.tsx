import { useState } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

const Description = () => {
  const [showFullText, setShowFullText] = useState(false);

  const handleToggleClick = () => {
    setShowFullText(!showFullText);
  };

  return (
    <Box mt={2} sx={{ color: "black" }}>
      <Typography
        sx={{
          fontSize: "25px",
          fontWeight: 700,
          lineHeight: { md: "100px", sm: "", xs: "auto" },
        }}
      >
        Make It Special with Personalised Cards and Gifts at Funky Pigeon
      </Typography>
      <Typography
        sx={{
          fontSize: { md: "20px", sm: "", xs: "15px" },
          fontWeight: 700,
          lineHeight: "50px",
        }}
      >
        Unique Ideas for Every Occasion
      </Typography>
      <Typography sx={{ fontSize: { md: "18px", sm: "", xs: "14px" }, mb: 4 }}>
        Here at Funky Pigeon, you'll find 1,000's of brilliantly unique greeting
        cards and gifts at your fingertips, ready to personalise with your
        inside jokes, photos and heartfelt messages using our helpful online
        editor. Perfect for creating a memorable keepsake that they can treasure
        for years to come!
      </Typography>
      <Typography sx={{ fontSize: { md: "18px", sm: "", xs: "14px" }, mb: 3 }}>
        We specialise in helping you make every occasion special, from that
        upcoming birthday or anniversary to engagements, housewarming, weddings,
        congratulations, or any of life's other memorable moments!
      </Typography>
      <Typography
        sx={{
          fontSize: { md: "20px", sm: "", xs: "15px" },
          fontWeight: 700,
          lineHeight: "50px",
        }}
      >
        Greeting Cards that Stand Out
      </Typography>
      <Typography sx={{ fontSize: { md: "18px", sm: "", xs: "14px" }, mb: 3 }}>
        Our cards are crafted with love and care, featuring a wide variety of
        designs from classic and elegant to quirky and humorous. You'll find
        something for everyone, whether you're looking for a simple birthday
        card or a unique, personalised masterpiece.
      </Typography>
      <Typography sx={{ fontSize: { md: "18px", sm: "", xs: "14px" }, mb: 3 }}>
        Don't forget our range of gifts! From personalised mugs and cushions to
        photo albums and calendars, we have the perfect present to complement
        your card and make any occasion truly special.
      </Typography>

      {/* Conditionally render the additional content */}
      {showFullText && (
        <>
          <Typography
            sx={{ fontSize: { md: "18px", sm: "", xs: "14px" }, mb: 3 }}
          >
            Make sure your greeting card stands out with exceptional cards in a
            variety of personalised, funny and traditional designs. So, whether
            it's a birthday card or a thank you card, you'll find thousands of
            designs to help you choose the perfect idea. All cards are printed
            to a high quality and can be sent with same-day despatch if ordered
            before our cut-off time. If you're feeling something new, why not go
            for our premium square cards, printed on FSC® certified high-quality
            card for an exceptional feel?
          </Typography>
          <Typography
            sx={{
              fontSize: { md: "20px", sm: "", xs: "15px" },
              fontWeight: 700,
              lineHeight: "50px",
            }}
          >
            Gifts and Flowers to Make Their Day
          </Typography>
          <Typography
            sx={{ fontSize: { md: "18px", sm: "", xs: "14px" }, mb: 3 }}
          >
            Our gifts start from just £3.99, including loads of personalised
            gift ideas where you add your photos, special messages or names.
            From t-shirts to calendars, mugs, cushions, keyrings, alcohol and
            chocolates, add your photos to an almost endless selection of
            presents, with many ranges available to be sent with same-day
            despatch! You can also add a custom inscription to our
            engraved-gifts, from jewellery to glasses.
          </Typography>
          <Typography
            sx={{ fontSize: { md: "18px", sm: "", xs: "14px" }, mb: 3 }}
          >
            We've also got an ever-growing range of trending gifts and novelty
            ideas, including anything from drinking themed games and gifts to
            kids' toys and ideas for all kinds of seasonal occasions. Plus, you
            can now send beautiful flowers and plants to their door, from
            magnificent birthday bouquets or anniversary flowers to easy care
            plants for the home!
          </Typography>
        </>
      )}

      {/* The clickable "Read More/Read Less" button */}
      <Box
        onClick={handleToggleClick}
        sx={{
          textAlign: "center",
          display: "flex",
          gap: 1,
          mt: 3,
          fontSize: "20px",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Typography sx={{ color: "rgba(105, 53, 105, 1)",fontWeight:700 }}>
          {showFullText ? "Read Less" : "Read More"}
        </Typography>
        <KeyboardArrowDown
          fontSize="large"
          sx={{
            transform: showFullText ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease-in-out",
            color: "rgba(105, 53, 105, 1)",
          }}
        />
      </Box>
      <hr />
      <Typography
        sx={{
          fontSize: { md: "20px", sm: "", xs: "15px" },
          mt: 8,
        }}
      >
        © Disney. © Disney/Pixar. © Disney. Winnie the Pooh elements are based
        on the “Winnie the Pooh” works by A.A. Milne E.H. Shepard.
      </Typography>
    </Box>
  );
};

export default Description;
