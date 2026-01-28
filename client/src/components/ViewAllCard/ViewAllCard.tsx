import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Skeleton, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";
import { TuneOutlined, CardGiftcard } from "@mui/icons-material";
import useModal from "../../hooks/useModal";
import type { CategoryType } from "../ProductPopup/ProductPopup";
import ProductPopup from "../ProductPopup/ProductPopup";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";

const VIEW_ALL = "View All Filters";
const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());

type ActiveTab = { id: string | number | null; name: string };

type ViewAllCardProps = {
  /** current category name from URL (ViewAll page) */
  activeCategoryName?: string;
  /** current category id from URL state (optional) */
  activeCategoryId?: string | number | null;
  /** when tabs change, call this to update URL in parent */
  onTabChange?: (name: string, id?: any) => void;
  /** if true => only cards show (templates hidden) */
  showOnlyCards?: boolean;
};

const getCardImage = (item: any) =>
  item?.imageUrl ??
  item?.imageurl ??
  item?.lastpageImageUrl ??
  item?.lastpageimageurl ??
  item?.poster ??
  "";

const getTempletImage = (item: any) =>
  item?.img_url ?? item?.imageUrl ?? item?.imageurl ?? item?.poster ?? "";

const getCardTabName = (card: any) => card?.cardcategory ?? card?.cardCategory ?? "";
const getTempletTabName = (t: any) => t?.category ?? t?.categoryName ?? t?.templetCategory ?? "";

const getAccessPlan = (x: any): "free" | "bundle" | "pro" => {
  const v = lc(x?.accessplan ?? x?.accessPlan ?? x?.plan ?? x?.plan_code ?? x?.code);
  if (v === "pro" || v === "premium") return "pro";
  if (v === "bundle") return "bundle";
  return "free";
};

const IconBadge = ({ kind }: { kind: "pro" | "bundle" }) => {
  const isPro = kind === "pro";
  return (
    <Box
      sx={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 2,
        width: 75,
        height: 75,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(255,255,255,0.92)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
        transform: "rotate(-12deg)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {isPro ? (
        <Box component="img" src="/assets/icons/premiumuser.png" sx={{ width: 70, height: 70 }} />
      ) : (
        <CardGiftcard sx={{ color: COLORS.primary, fontSize: 24 }} />
      )}
    </Box>
  );
};

/** ✅ light categories */
async function fetchCategoriesLight(): Promise<any[]> {
  const { data, error } = await supabase.from("categories").select("id,name");
  if (error) throw error;
  return data ?? [];
}

/** ✅ light cards */
async function fetchCardsLight(): Promise<any[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("id,cardname,cardName,imageurl,image_url,lastpageimageurl,lastpageImageUrl,accessplan,cardcategory,cardCategory,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** ✅ light templates */
async function fetchTemplatesLight(): Promise<any[]> {
  const { data, error } = await supabase
    .from("templetDesign")
    .select("id,title,name,img_url,imageurl,image_url,accessplan,category,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** ✅ full card row (prices, polygonlayout etc.) */
async function fetchCardFullById(id: string): Promise<any> {
  const { data, error } = await supabase.from("cards").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

/** ✅ full template row (raw_stores etc.) */
async function fetchTemplateFullById(id: string): Promise<any> {
  const { data, error } = await supabase.from("templetDesign").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

const ViewAllCard = ({
  activeCategoryName,
  activeCategoryId,
  onTabChange,
  showOnlyCards = false,
}: ViewAllCardProps) => {
  // (kept for backward compatibility if you still navigate with route param directly)
  const { search } = useParams();

  const routeName = decodeURIComponent(search ?? "");
  const routeCategoryName = (activeCategoryName ?? routeName ?? "").trim();

  const { open: isCategoryModal, openModal, closeModal } = useModal();
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>();
  const [popupLoading, setPopupLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>({ id: null, name: VIEW_ALL });

  const qc = useQueryClient();

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories:light"],
    queryFn: fetchCategoriesLight,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const allCategories = useMemo(
    () => (categories ?? []).map((c: any) => ({ id: c.id, name: c.name })),
    [categories]
  );

  const { data: cardData = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["allCards:light"],
    queryFn: fetchCardsLight,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const { data: templetCardData = [], isLoading: templetsLoading } = useQuery({
    queryKey: ["templetCards:light"],
    queryFn: fetchTemplatesLight,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // ✅ sync tab from URL category name
  useEffect(() => {
    if (!routeCategoryName) {
      setActiveTab({ id: null, name: VIEW_ALL });
      return;
    }
    const hit = allCategories.find((c) => lc(c.name) === lc(routeCategoryName));
    setActiveTab({
      id: hit?.id ?? activeCategoryId ?? null,
      name: hit?.name ?? routeCategoryName,
    });
  }, [routeCategoryName, activeCategoryId, allCategories]);

  const clickViewAll = () => {
    setActiveTab({ id: null, name: VIEW_ALL });
    onTabChange?.("", null); // ✅ parent navigates to /view-all
  };

  const clickTab = (c: { id: any; name: string }) => {
    setActiveTab({ id: c.id, name: c.name });
    onTabChange?.(c.name, c.id); // ✅ parent navigates to /view-all/<name>
  };

  const filteredCards = useMemo(() => {
    const list = Array.isArray(cardData) ? cardData : [];
    if (activeTab.name === VIEW_ALL) return list;
    const wantTab = lc(activeTab.name);
    return list.filter((card) => lc(getCardTabName(card)) === wantTab);
  }, [cardData, activeTab.name]);

  const filteredTemplets = useMemo(() => {
    const list = Array.isArray(templetCardData) ? templetCardData : [];
    if (activeTab.name === VIEW_ALL) return list;
    const wantTab = lc(activeTab.name);
    return list.filter((t) => lc(getTempletTabName(t)) === wantTab);
  }, [templetCardData, activeTab.name]);

  const filteredData = useMemo(() => {
    const cards = filteredCards.map((x: any) => ({ ...x, __type: "card" as const }));
    if (showOnlyCards) return cards;
    const temps = filteredTemplets.map((x: any) => ({ ...x, __type: "templet" as const }));
    return [...temps, ...cards];
  }, [filteredCards, filteredTemplets, showOnlyCards]);

  const cardsCount = filteredCards.length;
  const tempsCount = filteredTemplets.length;

  const openCategoryModalPopup = async (cate: any) => {
    // ✅ open instantly with light row (image etc.)
    setSelectedCate(cate);
    openModal();

    // ✅ show skeleton while we fetch full data for prices/raw_stores/polygonlayout
    setPopupLoading(true);

    try {
      if (cate?.__type === "templet") {
        const full = await qc.fetchQuery({
          queryKey: ["templet:full", String(cate.id)],
          queryFn: () => fetchTemplateFullById(String(cate.id)),
          staleTime: 1000 * 60 * 10,
        });

        setSelectedCate((prev: any) => ({
          ...(prev ?? {}),
          ...(full ?? {}),
          __type: "templet",
        }));
      } else {
        const full = await qc.fetchQuery({
          queryKey: ["card:full", String(cate.id)],
          queryFn: () => fetchCardFullById(String(cate.id)),
          staleTime: 1000 * 60 * 10,
        });

        setSelectedCate((prev: any) => ({
          ...(prev ?? {}),
          ...(full ?? {}),
          __type: "card",
        }));
      }
    } catch (e) {
      console.error("Full fetch failed:", e);
    } finally {
      setPopupLoading(false);
    }
  };

  const loading = catLoading || cardsLoading || (showOnlyCards ? false : templetsLoading);

  return (
    <Box>
      {/* ✅ Tabs */}
      <Box
        sx={{
          mt: { md: 2 },
          display: "flex",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            width: "100%",
            gap: "6px",
          }}
        >
          <Box
            component="div"
            onClick={clickViewAll}
            sx={{
              py: 1,
              px: 3,
              borderRadius: 20,
              bgcolor: activeTab.name === VIEW_ALL ? COLORS.primary : "transparent",
              color: activeTab.name === VIEW_ALL ? COLORS.white : COLORS.black,
              border: activeTab.name === VIEW_ALL ? `1px solid transparent` : `1px solid ${COLORS.black}`,
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 800,
            }}
          >
            <TuneOutlined fontSize="small" />
            {VIEW_ALL}
          </Box>

          {allCategories.map((c) => (
            <Box
              key={c.id}
              component="div"
              onClick={() => clickTab(c)}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 20,
                bgcolor: lc(activeTab.name) === lc(c.name) ? COLORS.primary : "transparent",
                color: lc(activeTab.name) === lc(c.name) ? COLORS.white : COLORS.black,
                border: lc(activeTab.name) === lc(c.name) ? `1px solid transparent` : `1px solid ${COLORS.black}`,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 800,
              }}
            >
              {c.name}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ✅ Title + sup counts */}
      <Typography sx={{ fontWeight: 900, fontSize: 18, mt: 2 }}>
        {activeTab.name === VIEW_ALL ? "All Products" : activeTab.name}{" "}
        <sup style={{ fontSize: 12, opacity: 0.75 }}>
          {showOnlyCards ? `Cards: ${cardsCount}` : `Cards: ${cardsCount} • Templates: ${tempsCount}`}
        </sup>
      </Typography>

      {loading ? (
        <Box sx={{ width: "100%", height: 250, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: { md: "flex-start", sm: "flex-start", xs: "center" },
            gap: "21px",
            mt: { md: 3, sm: 3, xs: 2 },
          }}
        >
          {filteredData.length > 0 ? (
            filteredData.map((e: any, idx: number) => {
              const plan = getAccessPlan(e);
              const src = e.__type === "templet" ? getTempletImage(e) : getCardImage(e);

              return (
                <Box
                  key={e.id ?? e._id ?? `${idx}-${Math.random()}`}
                  onClick={() => openCategoryModalPopup(e)}
                  sx={{
                    position: "relative",
                    width: 248,
                    height: 350,
                    borderRadius: 2,
                    boxShadow: 3,
                    cursor: "pointer",
                    overflow: "hidden",
                    bgcolor: "#fff",
                  }}
                >
                  {plan === "pro" ? <IconBadge kind="pro" /> : null}
                  {plan === "bundle" ? <IconBadge kind="bundle" /> : null}

                  <Box
                    component="img"
                    src={src}
                    alt={e.title || e.name || e.cardname || "product"}
                    sx={{ width: "100%", height: "100%", objectFit: "fill" }}
                  />
                </Box>
              );
            })
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: 200,
                fontSize: "20px",
                fontWeight: 500,
                color: "gray",
              }}
            >
              Product not found
            </Box>
          )}
        </Box>
      )}

      {/* ✅ ProductPopup (NO CHANGES inside ProductPopup) */}
      {isCategoryModal && selectedCate && (
        <>
          {/* ✅ Skeleton overlay while full row is fetching */}
          {popupLoading ? (
            <Box
              sx={{
                position: "fixed",
                inset: 0,
                zIndex: 1400,
                display: "grid",
                placeItems: "center",
                pointerEvents: "none",
              }}
            >
              <Box
                sx={{
                  width: { md: 800, sm: 700, xs: "90%" },
                  bgcolor: "#fff",
                  borderRadius: 3,
                  p: 2,
                  boxShadow: 10,
                }}
              >
                <Box sx={{ display: { md: "flex", sm: "flex", xs: "block" }, gap: 2 }}>
                  <Skeleton variant="rounded" width={360} height={420} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="rounded" height={70} sx={{ my: 1 }} />
                    <Skeleton variant="rounded" height={70} sx={{ my: 1 }} />
                    <Skeleton variant="rounded" height={70} sx={{ my: 1 }} />
                    <Skeleton variant="rounded" height={90} sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                      <Skeleton variant="rounded" width={150} height={45} />
                      <Skeleton variant="rounded" width={150} height={45} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : null}

          <ProductPopup
            open={isCategoryModal}
            onClose={() => {
              setPopupLoading(false);
              closeModal();
            }}
            cate={selectedCate}
            isTempletDesign={(selectedCate as any)?.__type === "templet"}
          />
        </>
      )}
    </Box>
  );
};

export default ViewAllCard;
