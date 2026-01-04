import { Box, Typography, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "../../supabase/supabase";
import { USER_ROUTES } from "../../constant/route";
import { setDraftCardId } from "../../lib/draftCardId";
import LandingButton from "../LandingButton/LandingButton";
import { useAuth } from "../../context/AuthContext";

// ✅ your modal component
import ConfirmModal from "../ConfirmModal/ConfirmModal";

type DraftRow = {
  card_id: string;
  cover_screenshot: string | null;
  title: string | null;
  category: string | null;
  description: string | null;
  updated_at: string;
};

const fetchMyDrafts = async (userId: string): Promise<DraftRow[]> => {
  const { data, error } = await supabase
    .from("draft")
    .select("card_id, cover_screenshot, title, category, description, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DraftRow[];
};

export default function DraftSlider() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();

  // ✅ confirm modal state
  const [openDelete, setOpenDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const queryKey = ["myDrafts", user?.id];

  const { data = [], isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchMyDrafts(user!.id),
    enabled: !!user && !loading,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const goEdit = (d: DraftRow) => {
    setDraftCardId(d.card_id);
    navigate(`${USER_ROUTES.HOME}/${d.card_id}`, {
      state: {
        draft: d,
        meta: {
          title: d.title ?? "",
          category: d.category ?? "",
          description: d.description ?? "",
        },
      },
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (cardId: string) => {
      if (!user?.id) throw new Error("No user");

      const { error } = await supabase
        .from("draft")
        .delete()
        .eq("user_id", user.id)
        .eq("card_id", cardId);

      if (error) throw error;
      return cardId;
    },

    onMutate: async (cardId: string) => {
      await queryClient.cancelQueries({ queryKey });

      const prev = queryClient.getQueryData<DraftRow[]>(queryKey) ?? [];

      // ✅ remove immediately from UI
      queryClient.setQueryData<DraftRow[]>(queryKey, (old = []) =>
        old.filter((d) => d.card_id !== cardId)
      );

      return { prev };
    },

    onError: (err: any, _cardId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
      toast.error(err?.message ?? "Delete failed");
    },

    onSuccess: () => {
      toast.success("Draft deleted ✅");
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const openDeleteModal = (cardId: string) => {
    setPendingDeleteId(cardId);
    setOpenDelete(true);
  };

  const closeDeleteModal = () => {
    if (deleteMutation.isPending) return; // optional: block closing while deleting
    setOpenDelete(false);
    setPendingDeleteId(null);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteMutation.mutate(pendingDeleteId, {
      onSuccess: () => {
        // close modal after success
        setOpenDelete(false);
        setPendingDeleteId(null);
      },
    });
  };

  if (loading) return null;
  if (!user) return null;
  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography>Failed to load drafts</Typography>;
  if (!data.length) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography fontWeight={700} fontSize={22}>Your Drafts</Typography>
        <LandingButton title="View All" onClick={() => navigate(USER_ROUTES.VIEW_ALL)} />
      </Box>

      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", mt: 2, pb: 1 }}>
        {data.map((d) => {
          const isDeletingThis =
            deleteMutation.isPending && deleteMutation.variables === d.card_id;

          return (
            <Box
              key={d.card_id}
              sx={{
                minWidth: 220,
                border: "1px solid #eee",
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                "&:hover .draftOverlay": { opacity: 1 },
                "&:hover img": { transform: "scale(1.03)" },
                opacity: isDeletingThis ? 0.6 : 1,
              }}
              onClick={() => goEdit(d)}
            >
              <Box
                component="img"
                src={d.cover_screenshot ?? ""}
                sx={{
                  width: "100%",
                  height: 250,
                  objectFit: "cover",
                  bgcolor: "#fafafa",
                  transition: "transform .25s ease",
                  display: "block",
                }}
              />

              {/* ✅ Hover Overlay */}
              <Box
                className="draftOverlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  opacity: 0,
                  transition: "opacity .2s ease",
                  background: "rgba(0,0,0,0.45)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip title="Edit">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      goEdit(d);
                    }}
                    sx={{ bgcolor: "white", "&:hover": { bgcolor: "white" } }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(d.card_id);
                    }}
                    sx={{
                      bgcolor: "white",
                      "&:hover": { bgcolor: "#ffe5e5", color: "red" },
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* optional loader overlay */}
              {isDeletingThis && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(255,255,255,0.35)",
                  }}
                >
                  <CircularProgress size={26} />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* ✅ Confirm Modal */}
      <ConfirmModal
        open={openDelete}
        onCloseModal={closeDeleteModal}
        title="Do you want to delete this draft?"
        btnText={deleteMutation.isPending ? "Deleting..." : "Delete"}
        onClick={confirmDelete}
        icon={<DeleteOutline />}
      />
    </Box>
  );
}
