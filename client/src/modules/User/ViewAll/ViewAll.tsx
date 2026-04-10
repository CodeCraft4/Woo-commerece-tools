import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { TuneOutlined } from "@mui/icons-material";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../supabase/supabase";
import { COLORS } from "../../../constant/color";
import useModal from "../../../hooks/useModal";
import ProductPopup from "../../../components/ProductPopup/ProductPopup";
import MainLayout from "../../../layout/MainLayout";
import { USER_ROUTES } from "../../../constant/route";
import SmartImage from "../../../components/SmartImage/SmartImage";
import { shouldSmartCropCategory } from "../../../lib/thumbnail";
import TemplateSvgThumbnail from "../../../components/TemplateSvgThumbnail/TemplateSvgThumbnail";

const VIEW_ALL = "View All Filters";
const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());
const toAbs = (p: string) => (p.startsWith("/") ? p : `/${p}`);
const canonicalCategory = (value: unknown) => {
  const v = lc(value);
  if (!v) return "";
  if (/(clothing|clothes|apparel)/i.test(v)) return "clothing";
  if (/invite/i.test(v)) return "invites";
  if (/(sticker|stciker)/i.test(v)) return "stickers";
  if (/mug/i.test(v)) return "mugs";
  if (/candle/i.test(v)) return "candles";
  if (/business\s*cards?/i.test(v)) return "business cards";
  if (/business\s*leaflets?/i.test(v)) return "business leaflets";
  if (/photo\s*art/i.test(v)) return "photo art";
  if (/wall\s*art/i.test(v)) return "wall art";
  if (/notebooks?/i.test(v)) return "notebooks";
  if (/coasters?/i.test(v)) return "coasters";
  if (/(tote\s*bag|bags?)/i.test(v)) return "bags";
  return v;
};


type LocationState = {
  categoryId?: string | number | null;
  categoryName?: string | null;
  subCategory?: string | null;
  subSubCategory?: string | null;
};

type ActiveTab = { id: string | number | null; name: string };

const getCardImage = (item: any) =>
  item?.imageUrl ??
  item?.imageurl ??
  item?.lastpageImageUrl ??
  item?.lastpageimageurl ??
  item?.poster ??
  "";

const getTempletImage = (item: any) =>
  item?.img_url ?? item?.imageUrl ?? item?.imageurl ?? item?.poster ?? "";

const normalizeLabel = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "");

const labelMatches = (candidate: unknown, expected: unknown) => {
  const left = normalizeLabel(candidate);
  const right = normalizeLabel(expected);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
};

const NON_CARD_TOP_LEVEL_CATEGORIES = new Set([
  "bags",
  "business cards",
  "business leaflets",
  "candles",
  "clothing",
  "coasters",
  "invites",
  "mugs",
  "photo art",
  "wall art",
  "notebooks",
  "stickers",
]);

const getCardMainName = (card: any) => card?.cardcategory ?? card?.cardCategory ?? "";
const getCardSubName = (card: any) => card?.subCategory ?? card?.subcategory ?? card?.sub_category ?? "";
const getCardSubSubName = (card: any) =>
  card?.subSubCategory ?? card?.subsubcategory ?? card?.sub_subcategory ?? "";
const getCardCategoryCandidates = (card: any) =>
  [getCardMainName(card), getCardSubName(card), getCardSubSubName(card)].filter(
    (value) => String(value ?? "").trim().length > 0,
  );
const isCardsFamilyCandidate = (candidate: unknown, knownCardSubcategories: string[]) => {
  const value = String(candidate ?? "").trim();
  if (!value) return false;

  const canonical = canonicalCategory(value);
  if (canonical === "cards") return true;
  if (NON_CARD_TOP_LEVEL_CATEGORIES.has(canonical)) return false;
  if (knownCardSubcategories.some((sub) => labelMatches(value, sub))) return true;

  return /\bcard(s)?\b/i.test(value);
};
const getTempletMainName = (t: any) =>
  t?.category ??
  t?.categoryName ??
  t?.templetCategory ??
  t?.cardcategory ??
  t?.cardCategory ??
  "";
const getTempletSubName = (t: any) => t?.subCategory ?? t?.subcategory ?? t?.sub_category ?? "";
const getTempletSubSubName = (t: any) =>
  t?.subSubCategory ?? t?.subsubcategory ?? t?.sub_subcategory ?? "";
const getTempletCategoryCandidates = (t: any) =>
  [getTempletMainName(t), getTempletSubName(t), getTempletSubSubName(t)].filter(
    (value) => String(value ?? "").trim().length > 0,
  );
const isTemplateCardsFamily = (t: any, knownCardSubcategories: string[]) => {
  const mainCanonical = canonicalCategory(getTempletMainName(t));
  if (mainCanonical === "cards") return true;
  if (NON_CARD_TOP_LEVEL_CATEGORIES.has(mainCanonical)) return false;
  return getTempletCategoryCandidates(t).some((candidate) =>
    isCardsFamilyCandidate(candidate, knownCardSubcategories)
  );
};
const getTempletTabName = (t: any) => getTempletMainName(t);

const getAccessPlan = (x: any): "free" | "bundle" | "pro" => {
  const v = lc(x?.accessplan ?? x?.accessPlan ?? x?.plan ?? x?.plan_code ?? x?.code);
  if (v === "pro" || v === "premium") return "pro";
  if (v === "bundle") return "bundle";
  return "free";
};

// const IconBadge = ({ kind }: { kind: "pro" | "bundle" }) => {
//   const isPro = kind === "pro";
//   return (
//     <Box
//       sx={{
//         position: "absolute",
//         top: 5,
//         left: 5,
//         zIndex: 2,
//         width: 50,
//         height: 50,
//         borderRadius: 999,
//         display: "grid",
//         placeItems: "center",
//         bgcolor: "rgba(255,255,255,0.92)",
//         boxShadow: 5,
//         transform: "rotate(-12deg)",
//         // border: "1px solid rgba(80, 80, 80, 0.73)",
//       }}
//     >
//       {isPro ? (
//         <Box component="img" src="/assets/icons/premiumuser.png" sx={{ width: 40, height: 40 }} />
//       ) : (
//         <CardGiftcard sx={{ color: COLORS.primary, fontSize: 24 }} />
//       )}
//     </Box>
//   );
// };

async function fetchCategoriesLight(): Promise<any[]> {
  const { data, error } = await supabase.from("categories").select("id,name,subcategories");
  if (!error) return data ?? [];

  const message = String(error.message ?? "").toLowerCase();
  const isSchemaDrift =
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("does not exist");

  if (!isSchemaDrift) throw error;

  const fallback = await supabase.from("categories").select("*");
  if (fallback.error) throw fallback.error;
  return fallback.data ?? [];
}

async function fetchCardsLight(): Promise<any[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("id,cardname,imageurl,accessplan,cardcategory,cardCategory,subCategory,subcategory,subSubCategory,subsubcategory,created_at")
    .order("created_at", { ascending: false });
  if (!error) return data ?? [];

  const message = String(error.message ?? "").toLowerCase();
  const isSchemaDrift =
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("does not exist");

  if (!isSchemaDrift) throw error;

  const fallback = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (fallback.error) throw fallback.error;
  return fallback.data ?? [];
}

async function fetchTemplatesLight(): Promise<any[]> {
  const { data, error } = await supabase
    .from("templetDesign")
    .select("id,title,img_url,accessplan,category,categoryName,templetCategory,subCategory,subcategory,subSubCategory,subsubcategory,created_at")
    .order("created_at", { ascending: false });
  if (!error) return data ?? [];

  const message = String(error.message ?? "").toLowerCase();
  const isSchemaDrift =
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("does not exist");

  if (!isSchemaDrift) throw error;

  const fallback = await supabase
    .from("templetDesign")
    .select("*")
    .order("created_at", { ascending: false });

  if (fallback.error) throw fallback.error;
  return fallback.data ?? [];
}

async function fetchCardFullById(id: string): Promise<any> {
  const { data, error } = await supabase.from("cards").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

async function fetchTemplateFullById(id: string): Promise<any> {
  const { data, error } = await supabase.from("templetDesign").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

const ViewAllCard = () => {
  const navigate = useNavigate(); // ✅ ADD
  const { search } = useParams();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const routeName = decodeURIComponent(search ?? "");
  const routeCategoryName = (state.categoryName ?? routeName ?? "").trim();
  const routeCategoryId = state.categoryId ?? null;
  const routeSubCategory = String(state.subCategory ?? "").trim();
  const routeSubSubCategory = String(state.subSubCategory ?? "").trim();

  // ✅ Title from URL (auto update when URL changes)
  const title = routeCategoryName || "All Products";

  const { open: isCategoryModal, openModal, closeModal } = useModal();
  const [selectedCate, setSelectedCate] = useState<any | undefined>();
  const [activeTab, setActiveTab] = useState<ActiveTab>({ id: null, name: VIEW_ALL });

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoriesLight,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: "always",
  });

  const allCategories = useMemo(
    () => (categories ?? []).map((c: any) => ({ id: c.id, name: c.name })),
    [categories]
  );
  const cardsCategorySubcategories = useMemo(() => {
    const cardsCategory = (categories ?? []).find(
      (c: any) => canonicalCategory(c?.name) === "cards",
    );
    return Array.isArray(cardsCategory?.subcategories)
      ? cardsCategory.subcategories
          .map((value: unknown) => String(value ?? "").trim())
          .filter(Boolean)
      : [];
  }, [categories]);

  const { data: cardData = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["allCards:light"],
    queryFn: fetchCardsLight,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: "always",
  });

  const { data: templetCardData = [], isLoading: templetsLoading } = useQuery({
    queryKey: ["templetCards:light"],
    queryFn: fetchTemplatesLight,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: "always",
  });

  // ✅ when URL changes => activeTab sync
  useEffect(() => {
    if (!routeCategoryName) {
      setActiveTab({ id: null, name: VIEW_ALL });
      return;
    }
    const hit = allCategories.find((c) => lc(c.name) === lc(routeCategoryName));
    setActiveTab({
      id: hit?.id ?? routeCategoryId ?? null,
      name: hit?.name ?? routeCategoryName,
    });
  }, [routeCategoryName, routeCategoryId, allCategories]);

  // ✅ CLICK handlers update URL + title automatically
  const clickViewAll = () => {
    setActiveTab({ id: null, name: VIEW_ALL });
    navigate(toAbs(USER_ROUTES.VIEW_ALL), {
      replace: true,
      state: { categoryName: null, categoryId: null },
    });
  };

  const clickTab = (c: { id: any; name: string }) => {
    setActiveTab({ id: c.id, name: c.name });
    navigate(`${toAbs(USER_ROUTES.VIEW_ALL)}/${encodeURIComponent(c.name)}`, {
      replace: true,
      state: { categoryName: c.name, categoryId: c.id },
    });
  };


  const filteredCards = useMemo(() => {
    const list = Array.isArray(cardData) ? cardData : [];
    if (activeTab.name === VIEW_ALL) return list;
    const wantTab = canonicalCategory(activeTab.name);
    return list.filter((card) => {
      const mainCategory = getCardMainName(card);
      const subCategory = getCardSubName(card);
      const subSubCategory = getCardSubSubName(card);
      const candidates = getCardCategoryCandidates(card);

      if (wantTab === "cards") {
        if (routeSubCategory && !candidates.some((candidate) => labelMatches(candidate, routeSubCategory))) {
          return false;
        }
        if (routeSubSubCategory && !candidates.some((candidate) => labelMatches(candidate, routeSubSubCategory))) {
          return false;
        }

        return candidates.some((candidate) => isCardsFamilyCandidate(candidate, cardsCategorySubcategories));
      }

      return (
        canonicalCategory(mainCategory) === wantTab ||
        canonicalCategory(subCategory) === wantTab ||
        canonicalCategory(subSubCategory) === wantTab
      );
    });
  }, [cardData, activeTab.name, cardsCategorySubcategories, routeSubCategory, routeSubSubCategory]);

  const filteredTemplets = useMemo(() => {
    const list = Array.isArray(templetCardData) ? templetCardData : [];
    if (activeTab.name === VIEW_ALL) return list;
    const wantTab = canonicalCategory(activeTab.name);
    if (wantTab === "cards") {
      return list.filter((t) => {
        const candidates = getTempletCategoryCandidates(t);
        if (routeSubCategory && !candidates.some((candidate) => labelMatches(candidate, routeSubCategory))) {
          return false;
        }
        if (routeSubSubCategory && !candidates.some((candidate) => labelMatches(candidate, routeSubSubCategory))) {
          return false;
        }
        return isTemplateCardsFamily(t, cardsCategorySubcategories);
      });
    }
    return list.filter((t) => canonicalCategory(getTempletTabName(t)) === wantTab);
  }, [templetCardData, activeTab.name, cardsCategorySubcategories, routeSubCategory, routeSubSubCategory]);

  const filteredData = useMemo(() => {
    const cards = filteredCards.map((x: any) => ({ ...x, __type: "card" as const }));
    const temps = filteredTemplets.map((x: any) => ({ ...x, __type: "templet" as const }));
    return [...temps, ...cards];
  }, [filteredCards, filteredTemplets]);

  // ✅ counts for title
  const cardsCount = filteredCards.length;
  const tempsCount = filteredTemplets.length;

  const [popupLoading, setPopupLoading] = useState(false);
  const qc = useQueryClient();

  const openCategoryModalPopup = async (cate: any) => {
    setSelectedCate(cate);
    openModal();
    setPopupLoading(true);

    try {
      if (cate?.__type === "templet") {
        const full = await qc.fetchQuery({
          queryKey: ["templet:full", String(cate.id)],
          queryFn: () => fetchTemplateFullById(String(cate.id)),
          staleTime: 1000 * 60 * 10,
        });

        setSelectedCate((prev: any) => ({ ...(prev ?? {}), ...(full ?? {}), __type: "templet" }));
      } else {
        const full = await qc.fetchQuery({
          queryKey: ["card:full", String(cate.id)],
          queryFn: () => fetchCardFullById(String(cate.id)),
          staleTime: 1000 * 60 * 10,
        });

        setSelectedCate((prev: any) => ({ ...(prev ?? {}), ...(full ?? {}), __type: "card" }));
      }
    } catch (e) {
      console.error("Full fetch failed:", e);
    } finally {
      setPopupLoading(false);
    }
  };

  const loading = catLoading || cardsLoading || templetsLoading;

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          width: { lg: "1340px", md: "100%", sm: "100%", xs: "100%" },
          justifyContent: "center",
          m: "auto",
          p: { lg: 3, md: 3, sm: 3, xs: 1 },
        }}
      >
        {/* ✅ Title auto changes (because params change) */}
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Typography sx={{ fontSize: { md: 30, sm: 30, xs: 24 }, fontWeight: 900 }}>
            {title}
            <sub style={{ fontSize: 18, opacity: 0.75 }}>
              ({cardsCount || tempsCount})
            </sub>
          </Typography>

          <Typography sx={{ fontSize: { md: 14, xs: 10 }, opacity: 0.8 }}>
            {routeCategoryName ? (
              <>
                Browse all products under <b>{routeCategoryName}</b> category.
              </>
            ) : (
              <>Browse all products.</>
            )}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ display: "flex", gap: "14px", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", width: "100%", gap: "5px" }}>
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
                }}
              >
                {c.name}
              </Box>
            ))}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ width: "100%", height: 250, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "21px", mt: 2 }}>
            {filteredData.length > 0 ? (
              filteredData.map((e: any, idx: number) => {
                const plan = getAccessPlan(e);
                const src = e.__type === "templet" ? getTempletImage(e) : getCardImage(e);

                const MUGS = e.category === "Mugs";
                const B_CARD = e.category == 'Business Cards'
                const templetCategory =
                  e?.category ?? e?.categoryName ?? e?.templetCategory ?? e?.cardcategory ?? e?.cardCategory ?? "";
                const enableSmartCrop = e.__type === "templet" && shouldSmartCropCategory(templetCategory);
                const isCandleCategory = /candle/i.test(String(templetCategory ?? ""));
                const isMugCategory = /mug/i.test(String(templetCategory ?? ""));
                const isBagCategory = /(tote\s*bag|bag)/i.test(String(templetCategory ?? ""));
                const isStickerCategory = /sticker/i.test(String(templetCategory ?? ""));
                const useContainThumb = isCandleCategory || isMugCategory || isBagCategory || isStickerCategory;

                return (
                  <Box
                    key={e.id ?? e._id ?? `${idx}-${Math.random()}`}
                    onClick={() => openCategoryModalPopup(e)}
                    sx={{
                      position: "relative",
                      width: MUGS || B_CARD ? 380 : 248,
                      height: MUGS || B_CARD ? 150 : 350,
                      // width: 248,
                      // height: 350,
                      borderRadius: 2,
                      boxShadow: 3,
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    {/* {plan === "pro" && <IconBadge kind="pro" /> : null} */}
                    {plan === "bundle" && null}

                    {e.__type === "templet" ? (
                      <TemplateSvgThumbnail
                        template={e}
                        fallbackSrc={src}
                        alt={e.title || e.name || e.cardname || "product"}
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          backgroundColor: useContainThumb ? "#fff" : "transparent",
                        }}
                      />
                    ) : (
                      <SmartImage
                        src={src}
                        alt={e.title || e.name || e.cardname || "product"}
                        enable={enableSmartCrop}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: useContainThumb ? "contain" : "cover",
                          objectPosition: "center",
                          display: "block",
                          backgroundColor: useContainThumb ? "#fff" : "transparent",
                        }}
                      />
                    )}
                  </Box>
                );
              })
            ) : (
              <Box sx={{ width: "100%", height: 200, display: "grid", placeItems: "center", color: "gray" }}>
                Product not found
              </Box>
            )}
          </Box>
        )}

        {isCategoryModal && selectedCate && (
          <ProductPopup
            open={isCategoryModal}
            onClose={() => {
              setPopupLoading(false);
              closeModal();
            }}
            cate={selectedCate}
            isTempletDesign={(selectedCate as any)?.__type === "templet"}
            priceLoading={popupLoading}
          />
        )}
      </Box>
    </MainLayout>
  );
};

export default ViewAllCard;
