// ===============================================
// File: src/pages/dashboard/products/components/ProductCard/ProductCard.tsx
// ===============================================
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";

// Keep in sync with callers
type Card = {
  id: number;
  card_name: string;
  card_category: string;
  sku: string;
  actual_price: number;
  sale_price: number;
  description: string;
  imageUrl?: string;
  created_at: string;
  polygon_shape?: string;
  lastpageImageUrl?: string;
  img_url?: string;
  subCategory?:string;
  subSubCategory?:string
};

type Props = {
  data: Card;
  openDeleteModal?: (id: number) => void;
  onEdit?: (id: number) => void;
};

const ProductCard = (props: Props) => {
  const { data, openDeleteModal, onEdit } = props || {};

  return (
    <Box
      component={"div"}
      sx={{
        width: { md: 200, sm: 200, xs: "100%" },
        height: { md: 250, sm: 250, xs: 280 },
        border: "1px solid #e0e0e0",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        position: "relative",
        cursor: "pointer",
        "&:hover": { boxShadow: "0 4px 15px rgba(0,0,0,0.2)" },
        "&:hover .overlay": { opacity: 1 },
      }}
    >
      {/* Product Image */}
      <Box
        component={"img"}
        src={data?.imageUrl || data?.lastpageImageUrl || data?.img_url}
        alt="Product"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          clipPath: data?.polygon_shape || "none",
        }}
      />

      {/* Overlay with Buttons */}
      <Box
        className="overlay"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          opacity: 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <IconButton
          sx={{ bgcolor: "white", color: "black", "&:hover": { bgcolor: "#f0f0f0" } }}
          onClick={() => onEdit && onEdit(data.id)}
        >
          <Edit fontSize="small" />
        </IconButton>
        <IconButton
          sx={{ bgcolor: "white", color: "red", "&:hover": { bgcolor: "#f0f0f0" } }}
          onClick={() => openDeleteModal && openDeleteModal(data.id)}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ProductCard;
