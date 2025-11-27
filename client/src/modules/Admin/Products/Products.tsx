import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import { supabase } from "../../../supabase/supabase";
import { COLORS } from "../../../constant/color";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import {
  Delete,
  GridViewOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductCard from "./components/ProductCard/ProductCard";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../constant/route";

type Card = {
  id: number;
  card_name: string;
  card_category: string;
  sku: string;
  actual_price: number;
  sale_price: number;
  description: string;
  image_url: string;
  created_at: string;
};

const TABS = [
  { name: "All Cards", categoryValue: "ALL" },
  { name: "Birthday Cards", categoryValue: "Birthday Cards" },
  { name: "Birthday Gift", categoryValue: "Birthday Gift" },
  { name: "Kids Birthday Cards", categoryValue: "Kids Birthday Cards" },
  { name: "Kids Birthday Gift", categoryValue: "Kids Birthday Gift" },
];

// Fetch all cards
const fetchCards = async (): Promise<Card[]> => {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Card[];
};

const deleteCard = async (id: number) => {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return id;
};

const Products = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // 👈 view mode state
  const { open: isOpenDeleteModal, openModal, closeModal } = useModal();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    data: cards = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
    staleTime: 1000 * 60 * 5,
  });

  const filteredCards = useMemo(() => {
    const selectedCategory = TABS[activeTab].categoryValue;
    if (selectedCategory === "ALL") return cards;
    return cards.filter((card) => card.card_category === selectedCategory);
  }, [cards, activeTab]);

  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: (id) => {
      toast.success("Card deleted successfully");
      queryClient.setQueryData<Card[]>(["cards"], (old) =>
        old ? old.filter((c) => c.id !== id) : []
      );
      closeModal();
      setSelectedCard(null);
    },
    onError: () => toast.error("Error deleting card"),
  });

  return (
    <DashboardLayout title="Add Card" addBtn="Add Card" onClick={() => navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS)}>
      {/* Tabs */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
            mt: 4,
          }}
        >
          {TABS.map((tab, index) => (
            <Box
              key={tab.name}
              onClick={() => setActiveTab(index)}
              sx={{
                px: { md: 3, sm: 2, xs: 1 },
                py: { md: 1, sm: 1, xs: 0.5 },
                border: "1px solid black",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                backgroundColor: activeTab === index ? "black" : "transparent",
                "&:hover": {
                  backgroundColor: activeTab === index ? "black" : "#f0f0f0",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: activeTab === index ? COLORS.white : COLORS.primary,
                }}
              >
                {tab.name}
              </Typography>
            </Box>
          ))}
        </Box>
        {/* View Mode Switch */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 0.5,
          }}
        >
          <IconButton
            disableRipple
            onClick={() => setViewMode("grid")}
            sx={{
              color: viewMode === "grid" ? COLORS.white : "gray",
              backgroundColor:
                viewMode === "grid" ? COLORS.black : "transparent",
              borderRadius: "50%",
              "&:hover": {
                bgcolor: COLORS.gray,
                color: COLORS.white
              }
            }}
          >
            <GridViewOutlined />
          </IconButton>

          {/* <IconButton
            disableRipple
            onClick={() => setViewMode("list")}
            sx={{
              color: viewMode === "list" ? COLORS.white : "gray",
              backgroundColor:
                viewMode === "list" ? COLORS.black : "transparent",
              borderRadius: "50%",
              "&:hover": {
                bgcolor: COLORS.gray,
                color: COLORS.white
              }
            }}
          >
            <FormatListBulletedOutlined />
          </IconButton> */}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ mt: 2 }}>
        {isLoading ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <CircularProgress disableShrink sx={{ color: "black" }} />
            loading...
          </Box>
        ) : isError ? (
          <Typography color="error">
            Failed to load products. Try again later.
          </Typography>
        ) : filteredCards.length === 0 ? (
          <Typography>No products found for the selected category.</Typography>
        ) : viewMode === "grid" ? (
          // 🟩 GRID VIEW
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {filteredCards.map((card) => (
              <ProductCard
                key={card.id}
                data={card}
                openDeleteModal={() => {
                  setSelectedCard(card);
                  openModal();
                }}
              />
            ))}
          </Box>
        ) : (
          // 📋 LIST VIEW (Table)
          <>
            {/*  <TableList data={filteredCards} heading={['Orderss', 'Date', 'Cusotomers', 'Payment Status', 'Orders Status', 'Total']} /> */}
          </>
        )}
      </Box>

      {/* Delete Modal */}
      {isOpenDeleteModal && selectedCard && (
        <ConfirmModal
          open={isOpenDeleteModal}
          onCloseModal={closeModal}
          title="Are you sure you want to delete this product?"
          icon={<Delete fontSize="large" />}
          btnText={deleteMutation.isPending ? "Deleting..." : "Delete"}
          onClick={() => deleteMutation.mutate(selectedCard.id)}
        />
      )}
    </DashboardLayout>
  );
};

export default Products;
