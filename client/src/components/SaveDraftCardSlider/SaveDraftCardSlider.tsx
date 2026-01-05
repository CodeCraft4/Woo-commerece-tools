import { Box, Typography, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import DraftPopup, { type DraftFullRow } from "../DraftPopup/DraftPopup";

const fetchMyDrafts = async (userId: string): Promise<DraftFullRow[]> => {
  const { data, error } = await supabase
    .from("draft")
    .select(
      [
        "card_id",
        "cover_screenshot",
        "title",
        "category",
        "description",
        "updated_at",
        // ✅ include full slide/layout so each draft can open with its own state
        "layout",
        "slide1",
        "slide2",
        "slide3",
        "slide4",
        "selected_size",
        "prices",
        "display_price",
        "is_on_sale",
      ].join(",")
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
};

type DraftSliderProps = {
  /** ✅ optional: auto open this card_id in DraftPopup (after saveDraft redirect) */
  autoOpenCardId?: string;
};

export default function DraftSlider({ autoOpenCardId }: DraftSliderProps) {
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();

  const [openDelete, setOpenDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // ✅ Draft popup state
  const [openDraft, setOpenDraft] = useState(false);
  const [activeDraft, setActiveDraft] = useState<DraftFullRow | null>(null);

  const queryKey = ["myDrafts", user?.id];

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => fetchMyDrafts(user!.id),
    enabled: !!user && !loading,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const openDraftModal = (d: DraftFullRow) => {
    setActiveDraft(d);
    setOpenDraft(true);
  };

  const closeDraftModal = () => {
    setOpenDraft(false);
    setActiveDraft(null);
  };

  // ✅ auto open just-saved draft once (after redirect)
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!autoOpenCardId) return;
    if (!data?.length) return;
    if (autoOpenedRef.current) return;

    const match = data.find((d) => d.card_id === autoOpenCardId);
    if (match) {
      autoOpenedRef.current = true;
      openDraftModal(match);
    }
  }, [autoOpenCardId, data]);

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

      const prev = queryClient.getQueryData<DraftFullRow[]>(queryKey) ?? [];
      queryClient.setQueryData<DraftFullRow[]>(queryKey, (old = []) =>
        old.filter((d) => d.card_id !== cardId)
      );

      return { prev };
    },

    onError: (err: any, _cardId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
      toast.error(err?.message ?? "Delete failed");
    },

    onSuccess: () => toast.success("Draft deleted ✅"),

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const openDeleteModal = (cardId: string) => {
    setPendingDeleteId(cardId);
    setOpenDelete(true);
  };

  const closeDeleteModal = () => {
    if (deleteMutation.isPending) return;
    setOpenDelete(false);
    setPendingDeleteId(null);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteMutation.mutate(pendingDeleteId, {
      onSuccess: () => {
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
        <Typography fontWeight={700} fontSize={22}>
          Continue Your Drafts Personalization
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", mt: 2, pb: 1 }}>
        {data.map((d) => {
          const isDeletingThis = deleteMutation.isPending && deleteMutation.variables === d.card_id;

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
              onClick={() => openDraftModal(d)}
            >
              <Box
                component="img"
                src={d.cover_screenshot ?? ""}
                sx={{
                  width: "100%",
                  height: 280,
                  objectFit: "fill",
                  bgcolor: "#fafafa",
                  transition: "transform .25s ease",
                  display: "block",
                }}
              />

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
                      openDraftModal(d);
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
                    sx={{ bgcolor: "white", "&:hover": { bgcolor: "#ffe5e5", color: "red" } }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Tooltip>
              </Box>

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

      {/* ✅ ProductPopup style draft modal */}
      <DraftPopup open={openDraft} onClose={closeDraftModal} draft={activeDraft} />

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
