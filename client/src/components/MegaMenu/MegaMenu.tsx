import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { COLORS } from "../../constant/color";
import { CATEGORIES_DATA } from "../../constant/data";
import useModal from "../../hooks/useModal"; // ✅ import your custom hook
import ProductPopup from "../ProductPopup/ProductPopup"; // ✅ import the popup
import { useState } from "react";

interface Category {
  name: string;
  links: string[];
}

interface MegaMenuItem {
  title: string;
  categories: Category[];
}

const MegaMenu = ({
  data,
  onSelect,
}: {
  data: MegaMenuItem;
  onSelect: () => void;
}) => {
  const { open, openModal, closeModal } = useModal();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const handleCardClick = (item: any) => {
    setSelectedCategory(item);
    openModal();
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "80%",
        left: 0,
        width: "100%",
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        m: "auto",
      }}
    >
      <Box
        sx={{
          width: { lg: "1310px", md: "100%", sm: "100%", xs: "auto" },
          bgcolor: "white",
          display: "flex",
          p: 4,
          boxShadow: 3,
          position: "absolute",
          top: 0,
          height: 400,
        }}
      >
        {/* LEFT SIDE — Categories */}
        <Box
          sx={{
            width: "70%",
            display: "flex",
            flexWrap: "wrap",
            gap: "60px",
            pr: 2,
          }}
        >
          {data.categories.map((category, index: number) => (
            <Box key={index} sx={{ color: COLORS.primary }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                {category.name}
              </Typography>
              <List sx={{ p: 0 }}>
                {category.links.map((link, linkIndex: number) => (
                  <ListItemButton
                    key={linkIndex}
                    sx={{ py: 0, px: 0 }}
                    onClick={onSelect}
                  >
                    <ListItemText
                      primary={link}
                      sx={{
                        fontSize: "12px",
                        color: "#212121",
                        "&:hover": {
                          textDecoration: "underline",
                          bgcolor: "transparent",
                        },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          ))}
        </Box>

        {/* RIGHT SIDE — Category Cards */}
        <Box
          sx={{
            width: "30%",
            borderLeft:'2px solid gray',
            overflowY: "scroll",
            overflowX: "hidden",
            display: "grid",
            p: "5px",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: COLORS.primary,
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: COLORS.seconday,
            },
          }}
        >
          {CATEGORIES_DATA.map((item: any) => (
            <Box
              key={item.id}
              onClick={() => handleCardClick(item)} // ✅ open popup with selected item
              sx={{
                border: `2px solid ${item.borderColor}`,
                borderRadius: "8px",
                width: "115px",
                height: "160px",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              <Box
                component="img"
                src={item.poster}
                alt={item.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  p: 0.5,
                  fontWeight: 500,
                  color: COLORS.black,
                }}
              >
                {item.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ✅ Product Popup */}
      <ProductPopup open={open} onClose={closeModal} cate={selectedCategory} />
    </Box>
  );
};

export default MegaMenu;
