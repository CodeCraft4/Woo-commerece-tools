import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { TuneOutlined } from "@mui/icons-material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import toast from "react-hot-toast";
import {
  fetchCardProductDetailsById,
  fetchTempletProductById,
} from "../../../source/source";

const VIEW_ALL = "View All Filters";
const MAX_LIST_ITEMS = 100;

// Legacy cards stored multi-megabyte base64 previews directly in Postgres.
// Keep their lightweight previews in the app until those rows are migrated
// to Supabase Storage. The original design image remains untouched in the DB.
const LEGACY_CARD_PREVIEWS: Record<string, string> = {
  "37": "/product-previews/card-37.webp",
};

const lc = (value: unknown) =>
  value == null ? "" : String(value).trim().toLowerCase();

const toAbs = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const canonicalCategory = (value: unknown) => {
  const normalized = lc(value);

  if (!normalized) return "";
  if (/(clothing|clothes|apparel)/i.test(normalized)) return "clothing";
  if (/invite/i.test(normalized)) return "invites";
  if (/(sticker|stciker)/i.test(normalized)) return "stickers";
  if (/mug/i.test(normalized)) return "mugs";
  if (/candle/i.test(normalized)) return "candles";
  if (/business\s*cards?/i.test(normalized)) return "business cards";
  if (/business\s*leaflets?/i.test(normalized)) return "business leaflets";
  if (/photo\s*art/i.test(normalized)) return "photo art";
  if (/wall\s*art/i.test(normalized)) return "wall art";
  if (/notebooks?/i.test(normalized)) return "notebooks";
  if (/coasters?/i.test(normalized)) return "coasters";
  if (/(tote\s*bag|bags?)/i.test(normalized)) return "bags";

  return normalized;
};

type LocationState = {
  categoryId?: string | number | null;
  categoryName?: string | null;
  subCategory?: string | null;
  subSubCategory?: string | null;
};

type ActiveTab = {
  id: string | number | null;
  name: string;
};

type QueryFilterInput = {
  categoryName: string;
  subCategory: string;
  subSubCategory: string;
  knownCardSubcategories: string[];
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

const getCardMainName = (card: any) =>
  card?.cardcategory ?? card?.cardCategory ?? "";

const getCardSubName = (card: any) =>
  card?.subCategory ?? card?.subcategory ?? card?.sub_category ?? "";

const getCardSubSubName = (card: any) =>
  card?.subSubCategory ?? card?.subsubcategory ?? card?.sub_subcategory ?? "";

const getCardCategoryCandidates = (card: any) =>
  [getCardMainName(card), getCardSubName(card), getCardSubSubName(card)].filter(
    (value) => String(value ?? "").trim().length > 0,
  );

const isCardsFamilyCandidate = (
  candidate: unknown,
  knownCardSubcategories: string[],
) => {
  const value = String(candidate ?? "").trim();

  if (!value) return false;

  const canonical = canonicalCategory(value);

  if (canonical === "cards") return true;
  if (NON_CARD_TOP_LEVEL_CATEGORIES.has(canonical)) return false;
  if (knownCardSubcategories.some((sub) => labelMatches(value, sub))) return true;

  return /\bcard(s)?\b/i.test(value);
};

const getTempletMainName = (template: any) =>
  template?.category ??
  template?.categoryName ??
  template?.templetCategory ??
  template?.cardcategory ??
  template?.cardCategory ??
  "";

const getTempletSubName = (template: any) =>
  template?.subCategory ?? template?.subcategory ?? template?.sub_category ?? "";

const getTempletSubSubName = (template: any) =>
  template?.subSubCategory ??
  template?.subsubcategory ??
  template?.sub_subcategory ??
  "";

const getTempletCategoryCandidates = (template: any) =>
  [
    getTempletMainName(template),
    getTempletSubName(template),
    getTempletSubSubName(template),
  ].filter((value) => String(value ?? "").trim().length > 0);

const isTemplateCardsFamily = (
  template: any,
  knownCardSubcategories: string[],
) => {
  const mainCanonical = canonicalCategory(getTempletMainName(template));

  if (mainCanonical === "cards") return true;
  if (NON_CARD_TOP_LEVEL_CATEGORIES.has(mainCanonical)) return false;

  return getTempletCategoryCandidates(template).some((candidate) =>
    isCardsFamilyCandidate(candidate, knownCardSubcategories),
  );
};

const getTempletTabName = (template: any) => getTempletMainName(template);

const getAccessPlan = (item: any): "free" | "bundle" | "pro" => {
  const value = lc(
    item?.accessplan ??
      item?.accessPlan ??
      item?.plan ??
      item?.plan_code ??
      item?.code,
  );

  if (value === "pro" || value === "premium") return "pro";
  if (value === "bundle") return "bundle";

  return "free";
};

/**
 * PostgREST's `.or()` receives a comma-separated filter string.
 * Remove characters that can break that syntax.
 */
const sanitizeFilterValue = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/[(),]/g, " ")
    .replace(/[%*]/g, "")
    .replace(/\s+/g, " ");

const uniqueNonEmpty = (values: unknown[]) =>
  Array.from(
    new Set(
      values
        .map(sanitizeFilterValue)
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

const getFilterTerms = ({
  categoryName,
  subCategory,
  subSubCategory,
  knownCardSubcategories,
}: QueryFilterInput) => {
  const category = canonicalCategory(categoryName);

  if (!categoryName || categoryName === VIEW_ALL) return [];

  if (category === "cards") {
    return uniqueNonEmpty([
      categoryName,
      "Cards",
      subCategory,
      subSubCategory,
      ...knownCardSubcategories,
    ]);
  }

  return uniqueNonEmpty([categoryName, subCategory, subSubCategory]);
};

const buildOrFilter = (columns: string[], terms: string[]) => {
  if (terms.length === 0) return "";

  return terms
    .flatMap((term) =>
      columns.map((column) => `${column}.ilike.*${term}*`),
    )
    .join(",");
};

const isSchemaDriftError = (error: any) => {
  const message = String(error?.message ?? "").toLowerCase();

  return (
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
};

async function fetchCategoriesLight(signal?: AbortSignal): Promise<any[]> {
  let query = supabase
    .from("categories")
    .select("id,name,subcategories")
    .order("name", { ascending: true });

  if (signal) query = query.abortSignal(signal);

  const { data, error } = await query;

  if (!error) return data ?? [];
  if (!isSchemaDriftError(error)) throw error;

  let fallbackQuery = supabase
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true });

  if (signal) fallbackQuery = fallbackQuery.abortSignal(signal);

  const fallback = await fallbackQuery;

  if (fallback.error) throw fallback.error;

  return fallback.data ?? [];
}

async function fetchCardsLight(
  filters: QueryFilterInput,
  signal?: AbortSignal,
): Promise<any[]> {
  const terms = getFilterTerms(filters);
  const orFilter = buildOrFilter(
    ["cardcategory", "subCategory", "subSubCategory"],
    terms,
  );

  let query = supabase
    .from("cards")
    .select(
      "id,cardname,accessplan,cardcategory,subCategory,subSubCategory,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(MAX_LIST_ITEMS);

  if (canonicalCategory(filters.categoryName) === "cards") {
    query = query.ilike("cardcategory", "Cards");
    if (filters.subCategory) query = query.ilike("subCategory", filters.subCategory);
    if (filters.subSubCategory) {
      query = query.ilike("subSubCategory", filters.subSubCategory);
    }
  } else if (orFilter) {
    query = query.or(orFilter);
  }
  if (signal) query = query.abortSignal(signal);

  const { data, error } = await query;

  if (!error) return data ?? [];
  if (!isSchemaDriftError(error)) throw error;

  // Schema-drift fallback: these common fields are known to exist in the old schema.
  let fallbackQuery = supabase
    .from("cards")
    .select("id,cardname,accessplan,created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_LIST_ITEMS);

  if (signal) fallbackQuery = fallbackQuery.abortSignal(signal);

  const fallback = await fallbackQuery;

  if (fallback.error) throw fallback.error;

  return fallback.data ?? [];
}

async function fetchTemplatesLight(
  filters: QueryFilterInput,
  signal?: AbortSignal,
): Promise<any[]> {
  const terms = getFilterTerms(filters);
  const orFilter = buildOrFilter(
    ["category", "subCategory", "subSubCategory"],
    terms,
  );

  let query = supabase
    .from("templetDesign")
    .select(
      "id,title,accessplan,category,subCategory,subSubCategory,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(MAX_LIST_ITEMS);

  if (canonicalCategory(filters.categoryName) === "cards") {
    query = query.ilike("category", "Cards");
    if (filters.subCategory) query = query.ilike("subCategory", filters.subCategory);
    if (filters.subSubCategory) {
      query = query.ilike("subSubCategory", filters.subSubCategory);
    }
  } else if (orFilter) {
    query = query.or(orFilter);
  }
  if (signal) query = query.abortSignal(signal);

  const { data, error } = await query;

  if (!error) return data ?? [];
  if (!isSchemaDriftError(error)) throw error;

  let fallbackQuery = supabase
    .from("templetDesign")
    .select("id,title,accessplan,category,created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_LIST_ITEMS);

  if (signal) fallbackQuery = fallbackQuery.abortSignal(signal);

  const fallback = await fallbackQuery;

  if (fallback.error) throw fallback.error;

  return fallback.data ?? [];
}

async function fetchCardImages(
  filters: QueryFilterInput,
  signal?: AbortSignal,
): Promise<any[]> {
  let query = supabase
    .from("cards")
    .select("id,imageurl")
    .limit(MAX_LIST_ITEMS);

  if (canonicalCategory(filters.categoryName) === "cards") {
    query = query.ilike("cardcategory", "Cards");
    if (filters.subCategory) query = query.ilike("subCategory", filters.subCategory);
    if (filters.subSubCategory) {
      query = query.ilike("subSubCategory", filters.subSubCategory);
    }
  }

  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function fetchTemplateImages(
  filters: QueryFilterInput,
  signal?: AbortSignal,
): Promise<any[]> {
  let query = supabase
    .from("templetDesign")
    .select("id,img_url")
    .limit(MAX_LIST_ITEMS);

  if (filters.categoryName && filters.categoryName !== VIEW_ALL) {
    query = query.ilike(
      "category",
      canonicalCategory(filters.categoryName) === "cards"
        ? "Cards"
        : filters.categoryName,
    );
    if (filters.subCategory) query = query.ilike("subCategory", filters.subCategory);
    if (filters.subSubCategory) {
      query = query.ilike("subSubCategory", filters.subSubCategory);
    }
  }

  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

const ViewAllCard = () => {
  const navigate = useNavigate();
  const { search } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  const state = (location.state ?? {}) as LocationState;

  const routeName = decodeURIComponent(search ?? "");
  const routeCategoryName = String(
    state.categoryName ?? routeName ?? "",
  ).trim();
  const routeCategoryId = state.categoryId ?? null;
  const routeSubCategory = String(state.subCategory ?? "").trim();
  const routeSubSubCategory = String(state.subSubCategory ?? "").trim();

  const title = routeCategoryName || "All Products";

  const {
    open: isCategoryModal,
    openModal,
    closeModal,
  } = useModal();

  const [selectedCate, setSelectedCate] = useState<any | undefined>();
  const [activeTab, setActiveTab] = useState<ActiveTab>({
    id: null,
    name: VIEW_ALL,
  });
  const [popupLoading, setPopupLoading] = useState(false);

  const {
    data: categories = [],
    isLoading: catLoading,
    isError: categoriesFailed,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories:light"],
    queryFn: ({ signal }) => fetchCategoriesLight(signal),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const allCategories = useMemo(
    () =>
      (categories ?? []).map((category: any) => ({
        id: category.id,
        name: category.name,
      })),
    [categories],
  );

  const cardsCategorySubcategories = useMemo(() => {
    const cardsCategory = (categories ?? []).find(
      (category: any) => canonicalCategory(category?.name) === "cards",
    );

    return Array.isArray(cardsCategory?.subcategories)
      ? cardsCategory.subcategories
          .map((value: unknown) => String(value ?? "").trim())
          .filter(Boolean)
      : [];
  }, [categories]);

  const queryFilters = useMemo<QueryFilterInput>(
    () => ({
      categoryName: routeCategoryName || VIEW_ALL,
      subCategory: routeSubCategory,
      subSubCategory: routeSubSubCategory,
      knownCardSubcategories: cardsCategorySubcategories,
    }),
    [
      routeCategoryName,
      routeSubCategory,
      routeSubSubCategory,
      cardsCategorySubcategories,
    ],
  );

  const filterKey = useMemo(
    () => [
      canonicalCategory(queryFilters.categoryName),
      normalizeLabel(queryFilters.subCategory),
      normalizeLabel(queryFilters.subSubCategory),
    ],
    [queryFilters],
  );

  const {
    data: cardData = [],
    isLoading: cardsLoading,
    isFetching: cardsFetching,
    isError: cardsFailed,
    error: cardsError,
  } = useQuery({
    queryKey: ["cards:light", ...filterKey],
    queryFn: ({ signal }) => fetchCardsLight(queryFilters, signal),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  const {
    data: templetCardData = [],
    isLoading: templetsLoading,
    isFetching: templatesFetching,
    isError: templatesFailed,
    error: templatesError,
  } = useQuery({
    queryKey: ["templates:light", ...filterKey],
    queryFn: ({ signal }) => fetchTemplatesLight(queryFilters, signal),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  const { data: cardImageRows = [], isFetching: cardImagesFetching } = useQuery({
    queryKey: ["cards:images", ...filterKey],
    queryFn: ({ signal }) => fetchCardImages(queryFilters, signal),
    enabled:
      cardData.length > 0 &&
      !cardsFetching &&
      cardData.some((card: any) => !LEGACY_CARD_PREVIEWS[String(card.id)]),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const { data: templateImageRows = [] } = useQuery({
    queryKey: ["templates:images", ...filterKey],
    queryFn: ({ signal }) => fetchTemplateImages(queryFilters, signal),
    enabled:
      templetCardData.length > 0 &&
      !templatesFetching &&
      !cardImagesFetching,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const cardImages = useMemo(
    () =>
      new Map(
        cardImageRows.map((row: any) => [String(row.id), row.imageurl ?? ""]),
      ),
    [cardImageRows],
  );

  const templateImages = useMemo(
    () =>
      new Map(
        templateImageRows.map((row: any) => [String(row.id), row.img_url ?? ""]),
      ),
    [templateImageRows],
  );

  useEffect(() => {
    const nextTab: ActiveTab = !routeCategoryName
      ? { id: null, name: VIEW_ALL }
      : (() => {
          const matchingCategory = allCategories.find(
            (category) => lc(category.name) === lc(routeCategoryName),
          );

          return {
            id: matchingCategory?.id ?? routeCategoryId ?? null,
            name: matchingCategory?.name ?? routeCategoryName,
          };
        })();

    // Avoid an unnecessary state update when the URL already represents the
    // current tab. This also protects against update-depth loops if a parent
    // recreates route state on each render.
    setActiveTab((current) => {
      if (
        current.id === nextTab.id &&
        lc(current.name) === lc(nextTab.name)
      ) {
        return current;
      }

      return nextTab;
    });
  }, [routeCategoryName, routeCategoryId, allCategories]);

  useEffect(() => {
    if (categoriesFailed) {
      console.error("Categories query failed:", categoriesError);
    }
  }, [categoriesFailed, categoriesError]);

  useEffect(() => {
    if (cardsFailed) {
      console.error("Cards query failed:", cardsError);
    }
  }, [cardsFailed, cardsError]);

  useEffect(() => {
    if (templatesFailed) {
      console.error("Templates query failed:", templatesError);
    }
  }, [templatesFailed, templatesError]);

  const clickViewAll = () => {
    navigate(toAbs(USER_ROUTES.VIEW_ALL), {
      replace: true,
      state: {
        categoryName: null,
        categoryId: null,
        subCategory: null,
        subSubCategory: null,
      },
    });
  };

  const clickTab = (category: { id: any; name: string }) => {
    navigate(
      `${toAbs(USER_ROUTES.VIEW_ALL)}/${encodeURIComponent(category.name)}`,
      {
        replace: true,
        state: {
          categoryName: category.name,
          categoryId: category.id,
          subCategory: null,
          subSubCategory: null,
        },
      },
    );
  };

  /**
   * Keep a small client-side validation layer because older database rows may
   * use inconsistent category spellings. Supabase now performs the heavy
   * filtering first, so this no longer processes the complete tables.
   */
  const filteredCards = useMemo(() => {
    const list = Array.isArray(cardData) ? cardData : [];

    if (activeTab.name === VIEW_ALL) return list;

    const wantedTab = canonicalCategory(activeTab.name);

    return list.filter((card) => {
      const mainCategory = getCardMainName(card);
      const subCategory = getCardSubName(card);
      const subSubCategory = getCardSubSubName(card);
      const candidates = getCardCategoryCandidates(card);

      if (wantedTab === "cards") {
        if (
          routeSubCategory &&
          !candidates.some((candidate) =>
            labelMatches(candidate, routeSubCategory),
          )
        ) {
          return false;
        }

        if (
          routeSubSubCategory &&
          !candidates.some((candidate) =>
            labelMatches(candidate, routeSubSubCategory),
          )
        ) {
          return false;
        }

        return candidates.some((candidate) =>
          isCardsFamilyCandidate(candidate, cardsCategorySubcategories),
        );
      }

      return (
        canonicalCategory(mainCategory) === wantedTab ||
        canonicalCategory(subCategory) === wantedTab ||
        canonicalCategory(subSubCategory) === wantedTab
      );
    });
  }, [
    cardData,
    activeTab.name,
    cardsCategorySubcategories,
    routeSubCategory,
    routeSubSubCategory,
  ]);

  const filteredTemplets = useMemo(() => {
    const list = Array.isArray(templetCardData) ? templetCardData : [];

    if (activeTab.name === VIEW_ALL) return list;

    const wantedTab = canonicalCategory(activeTab.name);

    if (wantedTab === "cards") {
      return list.filter((template) => {
        const candidates = getTempletCategoryCandidates(template);

        if (
          routeSubCategory &&
          !candidates.some((candidate) =>
            labelMatches(candidate, routeSubCategory),
          )
        ) {
          return false;
        }

        if (
          routeSubSubCategory &&
          !candidates.some((candidate) =>
            labelMatches(candidate, routeSubSubCategory),
          )
        ) {
          return false;
        }

        return isTemplateCardsFamily(
          template,
          cardsCategorySubcategories,
        );
      });
    }

    return list.filter(
      (template) =>
        canonicalCategory(getTempletTabName(template)) === wantedTab ||
        canonicalCategory(getTempletSubName(template)) === wantedTab ||
        canonicalCategory(getTempletSubSubName(template)) === wantedTab,
    );
  }, [
    templetCardData,
    activeTab.name,
    cardsCategorySubcategories,
    routeSubCategory,
    routeSubSubCategory,
  ]);

  const filteredData = useMemo(() => {
    const cards = filteredCards.map((item: any) => ({
      ...item,
      __type: "card" as const,
    }));

    const templates = filteredTemplets.map((item: any) => ({
      ...item,
      __type: "templet" as const,
    }));

    return [...templates, ...cards];
  }, [filteredCards, filteredTemplets]);

  const totalCount = filteredData.length;

  const openCategoryModalPopup = async (category: any) => {
    if (!category?.id) return;

    const categoryWithImage =
      category.__type === "templet"
        ? {
            ...category,
            img_url:
              getTempletImage(category) ||
              templateImages.get(String(category.id)) ||
              "",
          }
        : {
            ...category,
            imageurl:
              getCardImage(category) ||
              LEGACY_CARD_PREVIEWS[String(category.id)] ||
              cardImages.get(String(category.id)) ||
              "",
          };

    setSelectedCate(categoryWithImage);
    setPopupLoading(true);
    openModal();

    try {
      if (category.__type === "templet") {
        const fullTemplate = await queryClient.fetchQuery({
          queryKey: ["templet:full", String(category.id)],
          queryFn: () => fetchTempletProductById(String(category.id)),
          staleTime: 1000 * 60 * 10,
        });

        setSelectedCate((current: any) => ({
          ...(current ?? {}),
          ...(fullTemplate ?? {}),
          __type: "templet",
        }));
      } else {
        const fullCard = await queryClient.fetchQuery({
          queryKey: ["card:full", String(category.id)],
          queryFn: () => fetchCardProductDetailsById(String(category.id)),
          staleTime: 1000 * 60 * 10,
        });

        setSelectedCate((current: any) => ({
          ...(current ?? {}),
          ...(fullCard ?? {}),
          __type: "card",
        }));
      }
    } catch (error) {
      console.error("Full product fetch failed:", error);
      toast.error("Product details could not be loaded. Please try again.");
      closeModal();
    } finally {
      setPopupLoading(false);
    }
  };

  const initialLoading = catLoading || cardsLoading || templetsLoading;
  const backgroundFetching = cardsFetching || templatesFetching;
  const listFailed = cardsFailed && templatesFailed;

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
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Typography
            sx={{
              fontSize: { md: 30, sm: 30, xs: 24 },
              fontWeight: 900,
            }}
          >
            {title}
            <sub style={{ fontSize: 18, opacity: 0.75 }}>({totalCount})</sub>
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

        <Box
          sx={{
            display: "flex",
            gap: "14px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              width: "100%",
              gap: "5px",
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={clickViewAll}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 20,
                bgcolor:
                  activeTab.name === VIEW_ALL
                    ? COLORS.primary
                    : "transparent",
                color:
                  activeTab.name === VIEW_ALL ? COLORS.white : COLORS.black,
                border:
                  activeTab.name === VIEW_ALL
                    ? "1px solid transparent"
                    : `1px solid ${COLORS.black}`,
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "inherit",
              }}
            >
              <TuneOutlined fontSize="small" />
              {VIEW_ALL}
            </Box>

            {allCategories.map((category) => {
              const isActive =
                lc(activeTab.name) === lc(category.name);

              return (
                <Box
                  key={String(category.id)}
                  component="button"
                  type="button"
                  onClick={() => clickTab(category)}
                  sx={{
                    py: 1,
                    px: 3,
                    borderRadius: 20,
                    bgcolor: isActive ? COLORS.primary : "transparent",
                    color: isActive ? COLORS.white : COLORS.black,
                    border: isActive
                      ? "1px solid transparent"
                      : `1px solid ${COLORS.black}`,
                    cursor: "pointer",
                    fontSize: "14px",
                    fontFamily: "inherit",
                  }}
                >
                  {category.name}
                </Box>
              );
            })}
          </Box>
        </Box>

        {initialLoading ? (
          <Box
            sx={{
              width: "100%",
              height: 250,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress sx={{ color: COLORS.primary }} />
          </Box>
        ) : listFailed ? (
          <Box
            sx={{
              width: "100%",
              height: 200,
              display: "grid",
              placeItems: "center",
              color: "error.main",
              textAlign: "center",
            }}
          >
            Products could not be loaded. Please try again.
          </Box>
        ) : (
          <>
            {backgroundFetching && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size={22} sx={{ color: COLORS.primary }} />
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "21px",
                mt: 2,
              }}
            >
              {filteredData.length > 0 ? (
                filteredData.map((item: any, index: number) => {
                  const plan = getAccessPlan(item);
                  const source =
                    item.__type === "templet"
                      ? getTempletImage(item) ||
                        templateImages.get(String(item.id)) ||
                        ""
                      : getCardImage(item) ||
                        LEGACY_CARD_PREVIEWS[String(item.id)] ||
                        cardImages.get(String(item.id)) ||
                        "";

                  const templateCategory =
                    item?.category ??
                    item?.categoryName ??
                    item?.templetCategory ??
                    item?.cardcategory ??
                    item?.cardCategory ??
                    "";

                  const isMugs = /mug/i.test(String(templateCategory));
                  const isBusinessCard = /business\s*cards?/i.test(
                    String(templateCategory),
                  );
                  const isCandleCategory = /candle/i.test(
                    String(templateCategory),
                  );
                  const isBagCategory = /(tote\s*bag|bag)/i.test(
                    String(templateCategory),
                  );
                  const isStickerCategory = /sticker/i.test(
                    String(templateCategory),
                  );

                  const useContainThumb =
                    isCandleCategory ||
                    isMugs ||
                    isBagCategory ||
                    isStickerCategory;

                  const enableSmartCrop =
                    item.__type === "templet" &&
                    shouldSmartCropCategory(templateCategory);

                  const stableKey = `${item.__type}-${
                    item.id ?? item._id ?? index
                  }`;

                  return (
                    <Box
                      key={stableKey}
                      component="button"
                      type="button"
                      onClick={() => openCategoryModalPopup(item)}
                      aria-label={`Open ${
                        item.title ?? item.cardname ?? "product"
                      }`}
                      sx={{
                        position: "relative",
                        width: isMugs || isBusinessCard ? 380 : 248,
                        height: isMugs || isBusinessCard ? 150 : 350,
                        border: 0,
                        p: 0,
                        borderRadius: 2,
                        boxShadow: 3,
                        cursor: "pointer",
                        overflow: "hidden",
                        backgroundColor: "transparent",
                        fontFamily: "inherit",
                      }}
                    >
                      {plan === "bundle" && null}

                      {!source ? (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "grid",
                            placeItems: "center",
                            px: 2,
                            color: "#555",
                            background:
                              "linear-gradient(110deg, #f3f3f3 8%, #fafafa 18%, #f3f3f3 33%)",
                            backgroundSize: "200% 100%",
                          }}
                        >
                          <Typography fontWeight={700}>
                            {item.title || item.cardname || "Loading preview…"}
                          </Typography>
                        </Box>
                      ) : item.__type === "templet" ? (
                        <TemplateSvgThumbnail
                          template={item}
                          fallbackSrc={source}
                          alt={
                            item.title ||
                            item.name ||
                            item.cardname ||
                            "product"
                          }
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            backgroundColor: useContainThumb
                              ? "#fff"
                              : "transparent",
                          }}
                        />
                      ) : (
                        <SmartImage
                          src={source}
                          alt={
                            item.title ||
                            item.name ||
                            item.cardname ||
                            "product"
                          }
                          enable={enableSmartCrop}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: useContainThumb ? "contain" : "cover",
                            objectPosition: "center",
                            display: "block",
                            backgroundColor: useContainThumb
                              ? "#fff"
                              : "transparent",
                          }}
                        />
                      )}
                    </Box>
                  );
                })
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 200,
                    display: "grid",
                    placeItems: "center",
                    color: "gray",
                  }}
                >
                  Product not found
                </Box>
              )}
            </Box>
          </>
        )}

        {isCategoryModal && selectedCate && (
          <ProductPopup
            open={isCategoryModal}
            onClose={() => {
              setPopupLoading(false);
              setSelectedCate(undefined);
              closeModal();
            }}
            cate={selectedCate}
            isTempletDesign={selectedCate?.__type === "templet"}
            priceLoading={popupLoading}
          />
        )}
      </Box>
    </MainLayout>
  );
};

export default ViewAllCard;
