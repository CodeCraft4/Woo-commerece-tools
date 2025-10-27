import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../../../constant/route";

// Define the type for a Card
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
  polygon_shape?:string;
  lastpageImageUrl?:string;
};

type Props = {
  data: Card;
  openDeleteModal?: (id: number) => void;
};

const ProductCard = (props: Props) => {
  const { data, openDeleteModal } = props || {};

  const navigate = useNavigate();
  const onEdit = (id: number) => {
    navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS, { state: { id, product: data } });
  };

  return (
    <Box
      component={"div"}
      sx={{
        width: {md:280,sm:280,xs:'100%'},
        height: {md:400,sm:400,xs:280},
        border: "1px solid #e0e0e0",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        position: "relative",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        },
        "&:hover .overlay": {
          opacity: 1,
        },
      }}
    >
      {/* Product Image */}
      <Box
        component={"img"}
        src={data?.imageUrl || data?.lastpageImageUrl}
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
          sx={{
            bgcolor: "white",
            color: "black",
            "&:hover": { bgcolor: "#f0f0f0" },
          }}
          onClick={() => onEdit && onEdit(data.id)}
        >
          <Edit fontSize="large" />
        </IconButton>
        <IconButton
          sx={{
            bgcolor: "white",
            color: "red",
            "&:hover": { bgcolor: "#f0f0f0" },
          }}
          onClick={() => openDeleteModal && openDeleteModal(data.id)}
        >
          <Delete fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ProductCard;
