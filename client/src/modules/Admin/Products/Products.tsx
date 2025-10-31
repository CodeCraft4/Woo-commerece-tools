import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import OfferBanner from "./components/Banner/Banner";
import { supabase } from "../../../supabase/supabase";
import { COLORS } from "../../../constant/color";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import {
  Delete,
  FormatListBulletedOutlined,
  GridViewOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductCard from "./components/ProductCard/ProductCard";
import { useState, useMemo } from "react";

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
    <DashboardLayout>
      {/* <Typography sx={{ fontSize: "25px", fontWeight: 800 }}>OFFERS</Typography> */}
      {/* <OfferBanner /> */}

      {/* Header section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          // mt: 5,
        }}
      >
        <Typography sx={{ fontSize: "25px" }}>PRODUCTS LIST</Typography>

        {/* View Mode Switch */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "1px solid gray",
            borderRadius: 50,
            p: 0.5,
          }}
        >
          <IconButton
            onClick={() => setViewMode("grid")}
            sx={{
              color: viewMode === "grid" ? COLORS.seconday : "gray",
              backgroundColor:
                viewMode === "grid" ? "rgba(0,0,0,0.1)" : "transparent",
              borderRadius: "50%",
            }}
          >
            <GridViewOutlined />
          </IconButton>

          <IconButton
            onClick={() => setViewMode("list")}
            sx={{
              color: viewMode === "list" ? COLORS.seconday : "gray",
              backgroundColor:
                viewMode === "list" ? "rgba(0,0,0,0.1)" : "transparent",
              borderRadius: "50%",
            }}
          >
            <FormatListBulletedOutlined />
          </IconButton>
        </Box>
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
        {TABS.map((tab, index) => (
          <Box
            key={tab.name}
            onClick={() => setActiveTab(index)}
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
        ))}
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
          <TableContainer
            component={Paper}
            sx={{
              mt: 2,
              boxShadow: "4px 7px 21px gray",
              height: 600,
              overflowY: "scroll",
              "&::-webkit-scrollbar": {
                height: "6px",
                width:'6px'
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
                borderRadius: "20px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: COLORS.primary,
                borderRadius: "20px",
              },
            }}
          >
            <Table sx={{ width: "100%" }}>
              <TableHead
                sx={{ backgroundColor: "#f4f4f4", position: "sticky", top: 0 }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }} align="left">
                    id
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="left">
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="left">
                    Category
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="left">
                    ActualPrice
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    SalePrice
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCards.map((card: any) => (
                  <TableRow key={card.id} hover>
                    <TableCell align="left">{card.id}.</TableCell>
                    <TableCell align="left">{card.cardName}</TableCell>
                    <TableCell align="left">{card.cardCategory}</TableCell>
                    <TableCell align="left">£{card.actualPrice}</TableCell>
                    <TableCell align="center">£{card.salePrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
