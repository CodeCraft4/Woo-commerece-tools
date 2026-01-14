import { Box, Typography } from "@mui/material";
import type { CategoryType } from "../ProductPopup/ProductPopup";
import { COLORS } from "../../constant/color";

type BasketType = {
  id?: string | number;
  title?: string;
  poster: string;
  price?: string | number;
  saleprice?: string | number;
  category?: string;
  sales?: boolean;
  openModal?: (item: CategoryType) => void;
};

// background by category (same as before)
const bgByCategory = (category?: string) => {
  const c = (category ?? "").toLowerCase().trim();
  if (c.includes("business card")) return COLORS.green;
  if (c.includes("candle")) return COLORS.seconday;
  if (c.includes("bag")) return COLORS.primary;
  if (c.includes("coaster")) return "#7FBF9B";
  if (c.includes("card")) return "#66B6BE";
  if (c.includes("leaflet")) return "#7FBF9B";
  if (c.includes("invite")) return "#8E68A6";
  return "#8E68A6";
};

const BasketCard = ({ id, title, poster, category, openModal }: BasketType) => {
  const handleOpen = () => {
    openModal?.({ id, title, img_url: poster, cardcategory: category } as any);
  };

  return (
    <Box
      onClick={handleOpen}
      sx={{
        position: "relative",
        width: "120%",
        height: 235,
        aspectRatio: "1 / 1",
        borderRadius: 2,
        bgcolor: bgByCategory(category),
        overflow: "hidden",
        cursor: "pointer",
        border: "4px solid gray",

        // subtle shadow like screenshot
        boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
      }}
    >
      {/* ✅ inner content area (THIS was missing inset before) */}
      <Box
        sx={{
          position: "absolute",
          inset: 12,                   // ✅ padding inside card (important)
          borderRadius: 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1.2,
        }}
      >
        {/* image area */}
        <Box
          sx={{
            flex: 1,
            width: "100%",
            display: "flex",
            // alignItems: "center",
            justifyContent: "center",
            mt: 0.5,
          }}
        >
          <Box
            component="img"
            src={poster}
            alt={title ?? "product"}
            sx={{
              width: "75%",
              height: "90%",
              objectFit: "contain",
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </Box>

        {/* category INSIDE card */}
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 500,
            fontSize: { xs: 'auto', sm: 16, md: 18 },
            textAlign: "center",
            textTransform: "capitalize",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            width: "100%",
            textWrap: "nowrap",
          }}
          title={category}
        >
          {category || "Category"}
        </Typography>
      </Box>
    </Box>
  );
};

export default BasketCard;
