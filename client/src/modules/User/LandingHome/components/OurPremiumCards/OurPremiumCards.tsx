import React, { useMemo, useState } from "react";
import { Box, Card, CardMedia, Typography, Chip } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../../supabase/supabase";
import { CardGiftcard } from "@mui/icons-material";
import useModal from "../../../../../hooks/useModal";
import type { CategoryType } from "../../../../../components/ProductPopup/ProductPopup";
import ProductPopup from "../../../../../components/ProductPopup/ProductPopup";
import { COLORS } from "../../../../../constant/color";

type ProductItem = {
  key: string; // "card:<id>" | "template:<id>"
  item_type: "card" | "template";
  item_id: string; // real id (cards.id / templetDesign.id)
  title: string;
  image: string;
  accessplan: "free" | "bundle" | "pro";
  category?: string;
};

const norm = (s: any) => String(s ?? "").trim();
const lc = (s: any) => norm(s).toLowerCase();

const getAccessPlan = (x: any): "free" | "bundle" | "pro" => {
  const v = lc(x?.accessplan ?? x?.accessPlan ?? x?.access ?? x?.plan_code);
  if (v === "pro" || v === "premium") return "pro";
  if (v === "bundle") return "bundle";
  return "free";
};

const pickImage = (x: any) =>
  x?.lastpageimageurl ||
  x?.lastpageImageUrl ||
  x?.imageUrl ||
  x?.imageurl ||
  x?.image_url ||
  x?.img_url ||
  x?.image ||
  "";

// ✅ light
async function fetchCardsLight(): Promise<any[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("id,cardname,imageurl,accessplan,cardcategory,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function fetchTemplatesLight(): Promise<any[]> {
  const { data, error } = await supabase
    .from("templetDesign")
    .select("id,title,img_url,accessplan,category,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ✅ IMPORTANT: Full rows (prices, sizes, description, subcats, polygonlayout/raw_stores etc.)
async function fetchCardFullById(id: string): Promise<any> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

async function fetchTemplateFullById(id: string): Promise<any> {
  const { data, error } = await supabase
    .from("templetDesign")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// ✅ bundle_items fetch (keys like card:<id> / template:<id>)
async function fetchBundleItemKeys(): Promise<string[]> {
  const { data, error } = await supabase.from("bundle_items").select("item_type,item_id");
  if (error) throw error;

  return (data ?? []).map((r: any) => {
    const t = lc(r.item_type);
    const type = t === "cards" ? "card" : t === "templets" ? "template" : t;
    return `${type}:${String(r.item_id)}`;
  });
}

const badgeSx = {
  position: "absolute" as const,
  top: 10,
  left: 10,
  fontWeight: 900,
};

const cardSx = {
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: 4,
  position: "relative" as const,
  cursor: "pointer",
};

const gridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
  gap: 2,
};

const OurPremiumCards: React.FC = () => {
  const qc = useQueryClient();

  // ✅ useModal
  const { open, openModal, closeModal } = useModal();

  // ✅ selected cate for popup
  const [selectedCate, setSelectedCate] = useState<CategoryType | undefined>();
  const [isTempletDesign, setIsTempletDesign] = useState(false);

  const { data: cards = [], isLoading: loadingCards } = useQuery({
    queryKey: ["premium:cards:light"],
    queryFn: fetchCardsLight,
    staleTime: 1000 * 60 * 10,
  });

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["premium:templates:light"],
    queryFn: fetchTemplatesLight,
    staleTime: 1000 * 60 * 10,
  });

  const { data: bundleKeys = [], isLoading: loadingBundleKeys } = useQuery({
    queryKey: ["bundle_items:keys"],
    queryFn: fetchBundleItemKeys,
    staleTime: 1000 * 60 * 2,
  });

  const allProducts = useMemo<ProductItem[]>(() => {
    const cardItems: ProductItem[] = (cards ?? []).map((c: any) => ({
      key: `card:${String(c.id)}`,
      item_type: "card",
      item_id: String(c.id), // ✅ real id
      title: norm(c.cardName ?? c.cardname) || "Card",
      image: pickImage(c),
      accessplan: getAccessPlan(c),
      category: norm(c.cardcategory ?? c.cardCategory) || "default",
    }));

    const tplItems: ProductItem[] = (templates ?? []).map((t: any) => ({
      key: `template:${String(t.id)}`,
      item_type: "template",
      item_id: String(t.id), // ✅ real id
      title: norm(t.title ?? t.name) || "Template",
      image: pickImage(t),
      accessplan: getAccessPlan(t),
      category: norm(t.category) || "general",
    }));

    return [...cardItems, ...tplItems].filter((x) => !!x.image);
  }, [cards, templates]);

  const matchedBundleItems = useMemo(() => {
    const allow = new Set(bundleKeys);
    return allProducts.filter((p) => allow.has(p.key));
  }, [allProducts, bundleKeys]);

  const isLoading = loadingCards || loadingTemplates || loadingBundleKeys;

  // ✅ Click: open popup instantly + background fetch full row + then update selectedCate with full data
  const handleOpenPopup = async (p: ProductItem) => {
    // 1) open modal immediately with light info
    const lightCate: any = {
      id: p.item_id,
      title: p.title,
      cardname: p.title,
      cardName: p.title,
      category: p.category,
      cardcategory: p.category,
      cardCategory: p.category,
      imageurl: p.image,
      lastpageimageurl: p.image,
      img_url: p.image,
      accessplan: p.accessplan,
      __type: p.item_type === "template" ? "template" : "card",
    };

    setSelectedCate(lightCate);
    setIsTempletDesign(p.item_type === "template");
    openModal();

    // 2) background prefetch
    const id = String(p.item_id);
    if (!id) return;

    try {
      if (p.item_type === "template") {
        // prefetch + get data
        const full = await qc.fetchQuery({
          queryKey: ["templet:full", id],
          queryFn: () => fetchTemplateFullById(id),
          staleTime: 1000 * 60 * 10,
        });

        // 3) update cate with FULL row (this is what ProductPopup needs)
        setSelectedCate((prev) => ({
          ...(prev ?? {}),
          ...(full ?? {}),
          __type: "template",
        }));
      } else {
        const full = await qc.fetchQuery({
          queryKey: ["card:full", id],
          queryFn: () => fetchCardFullById(id),
          staleTime: 1000 * 60 * 10,
        });

        setSelectedCate((prev) => ({
          ...(prev ?? {}),
          ...(full ?? {}),
          __type: "card",
        }));
      }
    } catch (err) {
      // popup will still show light data, but prices may be missing if DB not configured
      console.error("Failed to fetch full product:", err);
    }
  };

  const renderCard = (p: ProductItem) => (
    <Card key={p.key} sx={cardSx} onClick={() => handleOpenPopup(p)}>
      {/* ✅ badges (bundle icon + pro crown) */}
      {p.accessplan === "bundle" ? (
        <Chip
          icon={<CardGiftcard sx={{ fontSize: 18 }} />}
          label="Bundle"
          size="small"
          sx={{
            ...badgeSx,
            bgcolor: "#fff",
            border: "1px solid rgba(0,0,0,0.12)",
            "& .MuiChip-label": { fontWeight: 900 },
          }}
        />
      ) : p.accessplan === "pro" ? (
        <Box
          component="img"
          src="/assets/icons/premiumuser.png"
          alt="premium crown"
          sx={{
            position: "absolute",
            top: -30,
            left: "7%",
            transform: "translateX(-50%) rotate(-38deg)",
            width: 105,
            height: 105,
            objectFit: "contain",
            zIndex: 99,
            pointerEvents: "none",
            filter: "drop-shadow(0px 6px 6px rgba(0,0,0,0.25))",
          }}
        />
      ) : null}

      <CardMedia component="img" height="300" image={p.image} alt={p.title} sx={{ objectFit: "fill" }} />
    </Card>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontSize: { md: 35, sm: 30, xs: 20 }, fontWeight: 600, color: COLORS.black, lineHeight: 1.3, textAlign: 'center' }}>Personalise your Premiums or Bundles Cards </Typography>
      <Typography sx={{ fontSize: { md: 24, sm: 25, xs: 'auto' },mb:1,mt:1 }}>personalise your Premimum Cards or Bundles cards for our Ocassion.</Typography>


      {isLoading ? <Typography sx={{ opacity: 0.7 }}>Loading...</Typography> : null}

      <Box sx={gridSx}>{matchedBundleItems.map(renderCard)}</Box>

      {!isLoading && matchedBundleItems.length === 0 ? (
        <Typography sx={{ mt: 2, opacity: 0.7 }}>
          No bundle_items matched with cards/templates.
        </Typography>
      ) : null}

      {/* ✅ ProductPopup (NO CHANGES INSIDE IT) */}
      {open && selectedCate ? (
        <ProductPopup
          open={open}
          onClose={closeModal}
          cate={selectedCate}
          isTempletDesign={isTempletDesign}
        />
      ) : null}
    </Box>
  );
};

export default OurPremiumCards; 
