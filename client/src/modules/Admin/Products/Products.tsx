import { Box, CircularProgress, Typography } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import OfferBanner from "./components/Banner/Banner";
import { supabase } from "../../../supabase/supabase";
import { COLORS } from "../../../constant/color";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductCard from "./components/ProductCard/ProductCard";
import { useState, useMemo } from "react";

// ---------------- Types ----------------
type Card = {
  id: number;
  card_name: string;
  // NOTE: This property must match the values in the database's card_category column
  card_category: string;
  sku: string;
  actual_price: number;
  sale_price: number;
  description: string;
  image_url: string;
  created_at: string;
};

// Map the display names in TABS to the actual card_category values in the database.
// 'All Cards' will use a special value to indicate no filtering.
const TABS = [
  { name: "All Cards", categoryValue: "ALL" }, // Use a special value like "ALL"
  // Assuming these are the exact values from the car.card_category column in your database
  { name: "Birthday Cards", categoryValue: "Birthday Cards" },
  { name: "Birthday Gift", categoryValue: "Birthday Gift" },
  { name: "Kids Birthday Cards", categoryValue: "Kids Birthday Cards" },
  { name: "Kids Birthday Gift", categoryValue: "Kids Birthday Gift" },
];

// ---------------- API Functions ----------------
const fetchCards = async (): Promise<Card[]> => {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });
  console.log(data, "--");

  if (error) throw new Error(error.message);
  return data as Card[];
};

const deleteCard = async (id: number) => {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return id;
};

// ---------------- Component ----------------
const Products = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const {
    open: isOpenDeleteModal,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const queryClient = useQueryClient();

  // Get cards with React Query
  const {
    data: cards = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // 1. Filter the cards based on the active tab
  const filteredCards = useMemo(() => {
    const selectedCategory = TABS[activeTab].categoryValue;

    if (selectedCategory === "ALL") {
      return cards; // Return all cards for the "All Cards" tab
    }

    // Filter cards where the card_category matches the selected category value
    return cards.filter((card) => card.card_category === selectedCategory);
  }, [cards, activeTab]); // Re-calculate when cards data or activeTab changes

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: (id) => {
      toast.success("Card deleted successfully");
      queryClient.setQueryData<Card[]>(["cards"], (old) =>
        old ? old.filter((c) => c.id !== id) : []
      );
      closeDeleteModal();
      setSelectedCard(null);
    },
    onError: () => toast.error("Error deleting card"),
  });

  // UI
  return (
    <DashboardLayout>
      <Typography sx={{ fontSize: "25px", fontWeight: 800 }}>OFFERS</Typography>
      <OfferBanner />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 5,
        }}
      >
        <Typography sx={{ fontSize: "25px" }}>PRODUCTS LIST</Typography>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
          mt: 4,
        }}
      >
        {TABS.map(
          (
            tab,
            index // Use TABS with categoryValue
          ) => (
            <Box
              key={tab.name}
              onClick={() => setActiveTab(index)} // 2. Update activeTab state on click
              sx={{
                px: { md: 3, sm: 3, xs: 1 },
                py: { md: 1.5, sm: "", xs: 0.5 },
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
          )
        )}
      </Box>

      {/* Product list */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: {md:"50vh",sm:"50vh",xs:'auto'},
            }}
          >
            <CircularProgress disableShrink sx={{ color: "black" }} />
            loading...
          </Box>
        ) : isError ? (
          <Typography color="error">
            Failed to load products. Try again later.
          </Typography>
        ) : filteredCards.length === 0 ? ( // Display message if no cards for the category
          <Typography>No products found for the selected category.</Typography>
        ) : (
          filteredCards.map(
            (
              card // 3. Render the filtered cards
            ) => (
              <ProductCard
                key={card.id}
                data={card}
                openDeleteModal={() => {
                  setSelectedCard(card);
                  openDeleteModal();
                }}
              />
            )
          )
        )}
      </Box>

      {/* Confirm Delete Modal */}
      {isOpenDeleteModal && selectedCard && (
        <ConfirmModal
          open={isOpenDeleteModal}
          onCloseModal={closeDeleteModal}
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
