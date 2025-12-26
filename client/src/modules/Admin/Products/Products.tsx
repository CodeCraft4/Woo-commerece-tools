// src/pages/Products/Products.tsx
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Tabs,
  Tab,
  Badge,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Tooltip,
  IconButton,
  Collapse,
} from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import { supabase } from "../../../supabase/supabase";
import useModal from "../../../hooks/useModal";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { Delete, Style as CardsIcon, Category as TemplatesIcon, FilterList } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductCard from "./components/ProductCard/ProductCard";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../constant/route";
import {
  fetchAllCardsFromDB,
  fetchAllCategoriesFromDB,
  fetchAllTempletDesigns,
} from "../../../source/source";
import { COLORS } from "../../../constant/color";

type CardRow = {
  id: number;
  cardName?: string; cardname?: string;
  cardcategory?: string; card_category?: string;
  subCategory?: string; subcategory?: string;
  subSubCategory?: string; sub_subcategory?: string;
  sku?: string;
  actualPrice?: number; actualprice?: number;
  salePrice?: number; saleprice?: number;
  description?: string;
  image_url?: string; imageUrl?: string; imageurl?: string;
  lastpageImageUrl?: string; lastpageimageurl?: string;
  created_at?: string;
  polygon_shape?: string;
};

type Category = {
  id: number | string;
  name: string;
  subcategories?: string[];
  sub_subcategories?: Record<string, string[]>;
};

type TemplateDesign = {
  id: number | string;
  title?: string; name?: string;
  category?: string;
  img_url?: string; image_url?: string; imageurl?: string;
  lastpageImageUrl?: string; lastpageimageurl?: string;
  polygon_shape?: string;
  created_at?: string;
  description?: string;
  sku?: string;
  actual_price?: number; actualprice?: number;
  sale_price?: number; saleprice?: number;
  // optional new columns
  subCategory?: string; subcategory?: string;
  subSubCategory?: string; sub_subcategory?: string;
};

type TemplateFilterSidebarProps = {
  open: boolean;
  onToggle: () => void;
  ALL: string;
  mainCats: string[];
  tMainCat: string;
  setTMainCat: (v: string) => void;
  tSubcats: string[];
  tSubCat: string;
  setTSubCat: (v: string) => void;

  // ✅ add and type both of these properly
  tSubSubs: Set<string>;
  setTSubSubs: React.Dispatch<React.SetStateAction<Set<string>>>;

  tVisibleSubSubs: string[];
};

const ALL = "ALL";
type ActiveTab = "cards" | "templates";
type DeletePick = { id: number | string; source: ActiveTab };

/* ---------------- Helpers ---------------- */

// delete helpers
const deleteCardById = async (id: number | string) => {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return id;
};
const deleteTemplateById = async (id: number | string) => {
  const { error } = await supabase.from("templetDesign").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return id;
};
const getTabIndex = (t: ActiveTab) => (t === "cards" ? 0 : 1);
const indexToTab = (i: number): ActiveTab => (i === 0 ? "cards" : "templates");

// cards normalize helpers
const getSub = (r: CardRow) => (r.subCategory ?? r.subcategory ?? "").trim();
const getSubSub = (r: CardRow) => (r.subSubCategory ?? r.sub_subcategory ?? "").trim();

// fallback tree from rows (for cards)
function buildCardTreesFromRows(rows: CardRow[]) {
  const subs = new Set<string>();
  const map: Record<string, Set<string>> = {};
  for (const r of rows) {
    const sub = getSub(r);
    const subsub = getSubSub(r);
    if (!sub) continue;
    subs.add(sub);
    if (!map[sub]) map[sub] = new Set();
    if (subsub) map[sub].add(subsub);
  }
  const subcategories = Array.from(subs).sort();
  const sub_subcategories: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(map)) sub_subcategories[k] = Array.from(v).sort();
  return { subcategories, sub_subcategories };
}

/* ---------------- Filter Sidebars ---------------- */

// Cards filter (unchanged)
function CardsFilterSidebar({
  open,
  onToggle,
  ALL,
  cardSubcategories,
  selectedSubCat,
  setSelectedSubCat,
  selectedSubSubs,
  toggleSubSub,
  clearSubSub,
  visibleSubSubs,
}: {
  open: boolean;
  onToggle: () => void;
  ALL: string;
  cardSubcategories: string[];
  selectedSubCat: string;
  setSelectedSubCat: (v: string) => void;
  selectedSubSubs: Set<string>;
  toggleSubSub: (v: string) => void;
  clearSubSub: () => void;
  visibleSubSubs: string[];
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: open ? 180 : 50,
        p: 1,
        border: `1px solid ${COLORS.seconday}`,
        borderRadius: 2,
        alignSelf: "flex-start",
        transition: (theme) =>
          theme.transitions.create(["width", "padding"], { duration: theme.transitions.duration.shortest }),
        position: "sticky",
        top: 0,
      }}
    >
      {open ? (
        <Box onClick={onToggle} sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", mb: 1, userSelect: "none" }}>
          <FilterList fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Filters</Typography>
        </Box>
      ) : (
        <Tooltip title="Open filters">
          <IconButton onClick={onToggle} size="small" sx={{ mx: "auto", display: "block" }}>
            <FilterList />
          </IconButton>
        </Tooltip>
      )}

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
          categories
        </Typography>

        <Box sx={{ display: "flex", height: 320, overflowY: "auto", }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            value={[ALL, ...cardSubcategories].indexOf(selectedSubCat)}
            onChange={(_, idx: number) => {
              const name = [ALL, ...cardSubcategories][idx] ?? ALL;
              setSelectedSubCat(name);
            }}
            sx={{
              borderRight: 1,
              borderColor: "transparent",
              maxHeight: 320,
              width: '100%',
              "& .MuiTabs-scroller": { overflowY: "auto" },
              "& .MuiTab-root": { alignItems: "flex-start", textTransform: "none" },
            }}
          >
            <Tab label="All" />
            {cardSubcategories.map((name) => (
              <Tab key={name} label={name} />
            ))}
          </Tabs>
        </Box>

        {selectedSubCat !== ALL && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: 'column', }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
                {selectedSubCat} – Sub-filters
              </Typography>
              {selectedSubSubs.size > 0 && (
                <Button size="small" onClick={clearSubSub} sx={{ textTransform: "none" }}>
                  Clear
                </Button>
              )}
            </Box>

            <FormGroup sx={{ mt: 1, maxHeight: 350, overflowY: "hidden", width: '100%', display: 'flex', flexDirection: 'column' }}>
              {visibleSubSubs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No sub-subcategories.
                </Typography>
              ) : (
                visibleSubSubs.map((name) => (
                  <FormControlLabel
                    key={name}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedSubSubs.has(name)}
                        onChange={() => toggleSubSub(name)}
                      />
                    }
                    label={name}
                  />
                ))
              )}
            </FormGroup>
          </>
        )}

        {/* <Typography>
          Sale Card
        </Typography> */}
      </Collapse>
    </Paper>
  );
}

// NEW: Templates filter
function TemplateFilterSidebar({
  open,
  onToggle,
  ALL,
  mainCats,
  tMainCat, setTMainCat,
  tSubcats,
  tSubCat, setTSubCat,
  tSubSubs, setTSubSubs,
  tVisibleSubSubs,
}: TemplateFilterSidebarProps) {
  const toggleSubSub = (name: string) => {
    setTSubSubs((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };
  const clearSubSub = () => setTSubSubs(new Set());

  return (
    <Paper
      elevation={0}
      sx={{
        width: open ? 180 : 50,
        p: open ? 2 : 1,
        border: `1px solid ${COLORS.seconday}`,
        borderRadius: 2,
        alignSelf: "flex-start",
        transition: (theme) =>
          theme.transitions.create(["width", "padding"], { duration: theme.transitions.duration.shortest }),
        position: "sticky",
        top: 0,
      }}
    >
      {open ? (
        <Box onClick={onToggle} sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", mb: 1, userSelect: "none" }}>
          <FilterList fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Filters</Typography>
        </Box>
      ) : (
        <Tooltip title="Open filters">
          <IconButton onClick={onToggle} size="small" sx={{ mx: "auto", display: "block" }}>
            <FilterList />
          </IconButton>
        </Tooltip>
      )}

      <Collapse in={open} timeout="auto" unmountOnExit>
        {/* Main Category */}
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
          Category
        </Typography>
        <Box sx={{ display: "flex", height: 280, overflowY: "auto", mt: 1 }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            value={[ALL, ...mainCats].indexOf(tMainCat)}
            onChange={(_, idx: number) => {
              const name = [ALL, ...mainCats][idx] ?? ALL;
              setTMainCat(name);
              setTSubCat(ALL);
              setTSubSubs(new Set());
            }}
            sx={{
              borderRight: 1, borderColor: "transparent", maxHeight: 300,
              width: '100%',
              "& .MuiTabs-scroller": { overflowY: "auto" },
              "& .MuiTab-root": { alignItems: "flex-start", textTransform: "none" },
            }}
          >
            <Tab label="All" />
            {mainCats.map((name) => <Tab key={name} label={name} />)}
          </Tabs>
        </Box>

        {/* SubCategory */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
          Subcategory
        </Typography>
        <Box sx={{ display: "flex", height: 300, overflowY: "auto", mt: 1 }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            scrollButtons="auto"
            value={[ALL, ...tSubcats].indexOf(tSubCat)}
            onChange={(_, idx: number) => {
              const name = [ALL, ...tSubcats][idx] ?? ALL;
              setTSubCat(name);
              setTSubSubs(new Set());
            }}
            sx={{
              borderRight: 1, borderColor: "transparent", maxHeight: 300,
              width: '100%',
              "& .MuiTabs-scroller": { overflowY: "auto" },
              "& .MuiTab-root": { alignItems: "flex-start", textTransform: "none" },
            }}
          >
            <Tab label="All" />
            {tSubcats.map((name) => <Tab key={name} label={name} />)}
          </Tabs>
        </Box>

        {/* Sub-SubCategory */}
        {tSubCat !== ALL && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
                {tSubCat} – Sub-filters
              </Typography>
              {tSubSubs.size > 0 && (
                <Button size="small" onClick={clearSubSub} sx={{ textTransform: "none" }}>
                  Clear
                </Button>
              )}
            </Box>

            <FormGroup sx={{ mt: 1, maxHeight: 350, overflowY: "auto" }}>
              {tVisibleSubSubs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No sub-subcategories.</Typography>
              ) : (
                tVisibleSubSubs.map((name) => (
                  <FormControlLabel
                    key={name}
                    control={
                      <Checkbox
                        size="small"
                        checked={tSubSubs.has(name)}
                        onChange={() => toggleSubSub(name)}
                      />
                    }
                    label={name}
                  />
                ))
              )}
            </FormGroup>
          </>
        )}
      </Collapse>
    </Paper>
  );
}

/* ---------------- Page ---------------- */
const Products = () => {
  // state
  const [activeTab, setActiveTab] = useState<ActiveTab>("cards");

  // cards filter state
  const [selectedSubCat, setSelectedSubCat] = useState<string>(ALL);
  const [selectedSubSubs, setSelectedSubSubs] = useState<Set<string>>(new Set());

  // templates filter state
  const [tMainCat, setTMainCat] = useState<string>(ALL);
  const [tSubCat, setTSubCat] = useState<string>(ALL);
  const [tSubSubs, setTSubSubs] = useState<Set<string>>(new Set());

  const [selectedToDelete, setSelectedToDelete] = useState<DeletePick | null>(null);

  // (kept to reuse ConfirmModal UX)
  const { open: _isTemplateModalOpen, closeModal: _closeTemplateModal } = useModal();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const toggleFilters = () => setFiltersOpen((v) => !v);

  // queries
  const { data: cards = [], isLoading: isLoadingCards, isError: isErrorCards } = useQuery<CardRow[]>({
    queryKey: ["cards"],
    queryFn: fetchAllCardsFromDB,
    staleTime: 1000 * 60 * 5,
  });
  const { data: templates = [], isLoading: isLoadingTemplates, isError: isErrorTemplates } =
    useQuery<TemplateDesign[]>({
      queryKey: ["templates"],
      queryFn: fetchAllTempletDesigns,
      staleTime: 1000 * 60 * 5,
    });
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchAllCategoriesFromDB,
    staleTime: 1000 * 60 * 30,
  });

  // categories helpers
  const cardsTree = useMemo(
    () => categories.find((c) => (c?.name ?? "").trim() === "Cards") || null,
    [categories]
  );
  const templateMainCats = useMemo(
    () => categories.map((c) => (c?.name ?? "").trim()).filter((n) => n && n !== "Cards"),
    [categories]
  );

  // cards: usable subcats/sub-subcats with fallback
  const { cardSubcategories, subSubMap } = useMemo(() => {
    const built = buildCardTreesFromRows(cards);
    const apiSubs = cardsTree?.subcategories ?? [];
    const apiMap = cardsTree?.sub_subcategories ?? {};

    const mergedSubs = Array.from(new Set([...apiSubs, ...built.subcategories])).sort();

    const mergedMap: Record<string, string[]> = {};
    const allSubs = new Set<string>([
      ...Object.keys(apiMap),
      ...Object.keys(built.sub_subcategories),
      ...mergedSubs,
    ]);
    for (const sub of allSubs) {
      const fromApi = apiMap[sub] ?? [];
      const fromBuilt = built.sub_subcategories[sub] ?? [];
      mergedMap[sub] = Array.from(new Set([...fromApi, ...fromBuilt])).sort();
    }

    return { cardSubcategories: mergedSubs, subSubMap: mergedMap };
  }, [cardsTree, cards]);

  const visibleSubSubs = useMemo(
    () => (selectedSubCat !== ALL ? (subSubMap[selectedSubCat] ?? []) : []),
    [selectedSubCat, subSubMap]
  );

  // templates: derive subcats/sub-subcats based on chosen main category
  const tSubcats = useMemo(() => {
    if (tMainCat === ALL) return [];
    const row = categories.find(c => (c?.name ?? "").trim() === tMainCat);
    return (row?.subcategories ?? []).slice().sort();
  }, [categories, tMainCat]);

  const tSubSubMap = useMemo(() => {
    if (tMainCat === ALL) return {};
    const row = categories.find(c => (c?.name ?? "").trim() === tMainCat);
    return row?.sub_subcategories ?? {};
  }, [categories, tMainCat]);

  const tVisibleSubSubs = useMemo(
    () => (tSubCat !== ALL ? (tSubSubMap[tSubCat] ?? []) : []),
    [tSubCat, tSubSubMap]
  );

  // reset on tab change
  useEffect(() => {
    // cards
    setSelectedSubCat(ALL);
    setSelectedSubSubs(new Set());
    // templates
    setTMainCat(ALL);
    setTSubCat(ALL);
    setTSubSubs(new Set());
  }, [activeTab]);

  // domain items
  const domainItems = activeTab === "cards" ? cards : templates;


  const norm = (s?: string | null) => (s ?? "").trim();
  const ciEq = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

  const tplGetCat = (t: any) => norm(t.category);
  const tplGetSub = (t: any) => norm(t.subCategory ?? t.subcategory);
  const tplGetSubSub = (t: any) => norm(t.subSubCategory ?? t.sub_subcategory);


  // filtering
  const filteredItems = useMemo(() => {
    if (activeTab === "cards") {
      let out = (domainItems as CardRow[]).slice();

      if (selectedSubCat !== ALL) {
        out = out.filter((r) => ciEq(getSub(r), selectedSubCat));
      }
      if (selectedSubSubs.size > 0) {
        out = out.filter((r) => {
          const s = getSubSub(r);
          return !!s && Array.from(selectedSubSubs).some((v) => ciEq(s, v));
        });
      }
      return out;
    }

    // ===== templates =====
    let out = (domainItems as TemplateDesign[]).slice();

    // main category
    if (tMainCat !== ALL) {
      out = out.filter((t) => ciEq(tplGetCat(t), tMainCat));
    }

    // subCategory (only apply if a specific sub was chosen)
    if (tSubCat !== ALL) {
      out = out.filter((t) => ciEq(tplGetSub(t), tSubCat));
    }

    // subSubCategory (only apply if any boxes checked AND a subCategory is chosen)
    if (tSubCat !== ALL && tSubSubs.size > 0) {
      out = out.filter((t) => {
        const s = tplGetSubSub(t);
        return !!s && Array.from(tSubSubs).some((v) => ciEq(s, v));
      });
    }

    return out;
  }, [
    domainItems,
    activeTab,
    // cards deps
    selectedSubCat,
    selectedSubSubs,
    // templates deps
    tMainCat,
    tSubCat,
    tSubSubs,
  ]);


  // mutations
  const deleteCardMutation = useMutation({
    mutationFn: deleteCardById,
    onSuccess: (id) => {
      toast.success("Card deleted successfully");
      queryClient.setQueryData<CardRow[]>(["cards"], (old) => (old ? old.filter((c) => c.id !== id) : []));
      setSelectedToDelete(null);
    },
    onError: () => toast.error("Error deleting card"),
  });
  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTemplateById,
    onSuccess: (id) => {
      toast.success("Template deleted successfully");
      queryClient.setQueryData<TemplateDesign[]>(["templates"], (old) => (old ? old.filter((t) => t.id !== id) : []));
      setSelectedToDelete(null);
    },
    onError: () => toast.error("Error deleting template"),
  });

  const handleConfirmDelete = () => {
    if (!selectedToDelete) return;
    if (selectedToDelete.source === "cards") deleteCardMutation.mutate(selectedToDelete.id);
    else deleteTemplateMutation.mutate(selectedToDelete.id);
  };

  // utils
  const imageForEdit = (x: {
    lastpageimageurl?: string;
    imageurl?: string;
    image_url?: string;
    img_url?: string;
    lastpageImageUrl?: string;
  }) =>
    x.lastpageimageurl ||
    x.lastpageImageUrl ||
    x.imageurl ||
    x.image_url ||
    x.img_url ||
    "";

  const onEditCard = (row: any) => {
    navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS, {
      state: {
        mode: "edit",
        id: row.id,
        product: {
          cardName: row.cardname ?? row.cardName,
          cardCategory: row.cardcategory ?? row.card_category,
          subCategory: row.subCategory ?? row.subcategory ?? "",
          subSubCategory: row.subSubCategory ?? row.sub_subcategory ?? "",
          sku: row.sku,
          actualPrice: row.actualprice ?? row.actualPrice,
          a4price: row.a4price,
          a5price: row.a5price,
          usletter: row.usletter,
          salePrice: row.saleprice ?? row.salePrice,
          salea4price: row.salea4price,
          salea5price: row.salea5price,
          saleusletter: row.saleusletter,
          description: row.description ?? "",
          imageUrl: imageForEdit(row),
          polygon_shape: row.polygon_shape ?? "",
          lastpageImageUrl: row.lastpageImageUrl ?? row.lastpageimageurl ?? "",
          polyganLayout: row.polygonlayout ?? row.polyganLayout ?? null,
        },
      },
    });
  };


  // NEW: open TempletForm with prefill + preview in left box
  const safeParse = (v: any) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return null; }
  }
  return null;
};

const onEditTemplate = (tpl: TemplateDesign & any) => {
  const rawStores = safeParse(
    tpl.raw_stores ?? tpl.rawStores ?? tpl.rawstores ?? null
  );

  navigate(ADMINS_DASHBOARD.ADD_NEW_TEMPLETS_CARDS, {
    state: {
      mode: "edit",
      id: tpl.id,

      rawStores, // ✅ normalized

      imgUrl:
        tpl.img_url ??
        tpl.image_url ??
        tpl.imageurl ??
        tpl.lastpageImageUrl ??
        tpl.lastpageimageurl ??
        "",

      product: {
        cardname: tpl.title ?? tpl.name ?? "",
        cardcategory: tpl.category ?? "",

        subCategory: tpl.subCategory ?? tpl.subcategory ?? "",
        subSubCategory: tpl.subSubCategory ?? tpl.sub_subcategory ?? "",

        sku: tpl.sku ?? "",
        actualprice: tpl.actualprice ?? tpl.actualPrice ?? "",
        a4price: tpl.a4price ?? "",
        a5price: tpl.a5price ?? "",
        usletter: tpl.usletter ?? "",

        saleprice: tpl.saleprice ?? tpl.salePrice ?? "",
        salea4price: tpl.salea4price ?? "",
        salea5price: tpl.salea5price ?? "",
        saleusletter: tpl.saleusletter ?? "",

        description: tpl.description ?? "",
      },
    },
  });
};



  // checkbox handlers (cards)
  const toggleSubSub = (name: string) => {
    setSelectedSubSubs((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };
  const clearSubSub = () => setSelectedSubSubs(new Set());

  return (
    <DashboardLayout
      title="Products"
      addBtn={activeTab === "cards" ? "Add Card" : "Add Template"}
      onClick={() =>
        navigate(activeTab === "cards" ? ADMINS_DASHBOARD.ADD_NEW_CARDS : ADMINS_DASHBOARD.ADMIN_CATEGORIES_EDITOR)
      }
    >
      {/* Header Tabs */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Tabs
          value={getTabIndex(activeTab)}
          onChange={(_, idx: number) => setActiveTab(indexToTab(idx))}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 40,
            "& .MuiTab-root": { textTransform: "none", minHeight: 40, fontWeight: 700 },
          }}
        >
          <Tab
            icon={<CardsIcon fontSize="small" />}
            iconPosition="start"
            label={<Badge color="error" badgeContent={cards.length}>Cards</Badge>}
          />
          <Tab
            icon={<TemplatesIcon fontSize="small" />}
            iconPosition="start"
            label={<Badge color="error" badgeContent={templates.length}>Templates</Badge>}
          />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        {/* Sidebar Filters */}
        {activeTab === "cards" ? (
          <CardsFilterSidebar
            open={filtersOpen}
            onToggle={toggleFilters}
            ALL={ALL}
            cardSubcategories={cardSubcategories}
            selectedSubCat={selectedSubCat}
            setSelectedSubCat={(v) => {
              setSelectedSubCat(v);
              setSelectedSubSubs(new Set());
            }}
            selectedSubSubs={selectedSubSubs}
            toggleSubSub={toggleSubSub}
            clearSubSub={clearSubSub}
            visibleSubSubs={visibleSubSubs}
          />
        ) : (
          <TemplateFilterSidebar
            open={filtersOpen}
            onToggle={toggleFilters}
            ALL={ALL}
            mainCats={templateMainCats}
            tMainCat={tMainCat} setTMainCat={setTMainCat}
            tSubcats={tSubcats}
            tSubCat={tSubCat} setTSubCat={setTSubCat}
            tSubSubs={tSubSubs} setTSubSubs={setTSubSubs}
            tVisibleSubSubs={tVisibleSubSubs}
          />
        )}

        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {(activeTab === "cards" ? isLoadingCards : isLoadingTemplates) ? (
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
              <CircularProgress disableShrink sx={{ color: "black" }} />
              loading...
            </Box>
          ) : (activeTab === "cards" ? isErrorCards : isErrorTemplates) ? (
            <Typography color="error">Failed to load {activeTab === "cards" ? "cards" : "templates"}.</Typography>
          ) : filteredItems.length === 0 ? (
            <Typography>No items found.</Typography>
          ) : (
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {filteredItems.map((item: any) => (
                <ProductCard
                  key={`${activeTab}-${item.id}`}
                  data={
                    activeTab === "cards"
                      ? ({
                        id: item.id,
                        card_name: item.cardName ?? item.card_name ?? item.cardname ?? "Card",
                        card_category: item.cardcategory ?? item.card_category ?? "",
                        subCategory: item.subCategory ?? item.subcategory ?? null,
                        subSubCategory: item.subSubCategory ?? item.sub_subcategory ?? null,
                        sku: item.sku ?? "",
                        actual_price: item.actualPrice ?? item.actual_price ?? item.actualprice ?? 0,
                        sale_price: item.salePrice ?? item.sale_price ?? item.saleprice ?? 0,
                        description: item.description ?? "",
                        created_at: item.created_at ?? new Date().toISOString(),
                        img_url:
                          item.lastpageimageurl ??
                          item.imageUrl ??
                          item.imageurl ??
                          item.image_url ??
                          item.lastpageImageUrl ??
                          "",
                        lastpageImageUrl: item.lastpageImageUrl ?? item.lastpageimageurl ?? "",
                        polygon_shape: item.polygon_shape ?? null,
                      } as any)
                      : ({
                        id: item.id,
                        card_name: item.title ?? item.name ?? "Template",
                        card_category: item.category ?? "",
                        sku: item.sku ?? "",
                        actual_price: item.actualPrice ?? item.actual_price ?? item.actualprice ?? 0,
                        sale_price: item.salePrice ?? item.sale_price ?? item.saleprice ?? 0,
                        description: item.description ?? "",
                        created_at: item.created_at ?? new Date().toISOString(),
                        img_url: item.img_url ?? item.image_url ?? item.imageurl ?? item.lastpageimageurl ?? "",
                        lastpageImageUrl: item.lastpageImageUrl ?? item.lastpageimageurl ?? "",
                        polygon_shape: item.polygon_shape,
                        subCategory: item.subCategory ?? item.subcategory ?? null,
                        subSubCategory: item.subSubCategory ?? item.sub_subcategory ?? null,
                      } as const)
                  }
                  onEdit={activeTab === "cards" ? () => onEditCard(item as CardRow) : () => onEditTemplate(item as TemplateDesign)}
                  openDeleteModal={(id: number | string) => setSelectedToDelete({ id, source: activeTab })}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Delete confirm */}
      {selectedToDelete && (
        <ConfirmModal
          open={Boolean(selectedToDelete)}
          onCloseModal={() => setSelectedToDelete(null)}
          title={`Delete this ${selectedToDelete.source === "cards" ? "card" : "template"}?`}
          icon={<Delete fontSize="large" />}
          btnText={
            (selectedToDelete.source === "cards" ? deleteCardMutation.isPending : deleteTemplateMutation.isPending)
              ? "Deleting..."
              : "Delete"
          }
          onClick={handleConfirmDelete}
        />
      )}
    </DashboardLayout>
  );
};

export default Products;
