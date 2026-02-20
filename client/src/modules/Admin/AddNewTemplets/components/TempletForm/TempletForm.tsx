// path: src/pages/admin/.../TempletForm.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllCategoriesFromDB,
  fetchTempletDesignFullById,
} from "../../../../../source/source";
import CustomInput from "../../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import {
  useCategoriesEditorState,
  type PublishMeta,
} from "../../../../../context/CategoriesEditorContext";
import * as htmlToImage from "html-to-image";
import { ADMINS_DASHBOARD } from "../../../../../constant/route";
import { buildGoogleFontsUrls, loadGoogleFontsOnce } from "../../../../../constant/googleFonts";

type SizeKey =
  | "A5"
  | "A4"
  | "A3"
  | "US_LETTER"
  | "HALF_US_LETTER"
  | "US_TABLOID"
  | "MUG_WRAP_11OZ"
  | "COASTER_95";

type PricingMap = Partial<Record<SizeKey, string>>;

type FormValue = {
  cardname: string;
  cardcategory: string;
  subCategory?: string;
  subSubCategory?: string;
  sku: string;

  // legacy (kept for compatibility)
  actualprice?: string;
  a4price?: string;
  a5price?: string;
  usletter?: string;
  saleprice?: string;
  salea4price?: string;
  salea5price?: string;
  saleusletter?: string;

  // UI-only maps
  pricing: PricingMap;
  salePricing: PricingMap;

  description: string;
  cardImage?: FileList;
  polygon_shape: string;
};

type PricingFieldPath = `pricing.${SizeKey}`;
type SalePricingFieldPath = `salePricing.${SizeKey}`;

type CategoryRow = {
  id: string;
  name: string;
  subcategories: string[];
  sub_subcategories: Record<string, string[]>;
};

type SizeDef = { key: SizeKey; label: string; helper?: string };
type CategoryPricingConfig = {
  title?: string;
  note?: string;
  sizes: SizeDef[];
};

type EditProductLike = Partial<FormValue> & {
  a3price?: string;
  halfusletter?: string;
  ustabloid?: string;
  salea3price?: string;
  salehalfusletter?: string;
  saleustabloid?: string;
};

type Option = { label: string; value: string };

const normalizeNumberInput = (v: unknown) =>
  typeof v === "string" ? v.replace(/,/g, "").trim() : String(v ?? "").trim();

const isBlank = (v: unknown) => v == null || String(v).trim() === "";

const toTextNumberOrEmpty = (v?: string) => {
  const raw = normalizeNumberInput(v);
  if (!raw) return "";
  const n = Number(raw);
  return Number.isFinite(n) ? String(n) : "";
};

const normalizePricingKey = (key: string): SizeKey | null => {
  const raw = String(key ?? "").trim();
  if (!raw) return null;
  const u = raw.toUpperCase().replace(/[\s-]+/g, "_");
  switch (u) {
    case "A5":
    case "A4":
    case "A3":
      return u as SizeKey;
    case "US_LETTER":
    case "USLETTER":
      return "US_LETTER";
    case "HALF_US_LETTER":
    case "HALFUSLETTER":
      return "HALF_US_LETTER";
    case "US_TABLOID":
    case "USTABLOID":
    case "US_TABLOID_11_X_17_IN":
      return "US_TABLOID";
    case "MUG_WRAP_11OZ":
    case "MUG_WRAP_11_OZ":
      return "MUG_WRAP_11OZ";
    case "COASTER_95":
      return "COASTER_95";
    default:
      return null;
  }
};

const readPricingMap = (source: unknown): PricingMap => {
  if (!source || typeof source !== "object") return {};
  const out: PricingMap = {};
  for (const [k, v] of Object.entries(source as Record<string, unknown>)) {
    const nk = normalizePricingKey(k);
    if (!nk) continue;
    out[nk] = v != null ? String(v) : "";
  }
  return out;
};

const normalizeFontFamily = (value?: string | null) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const first = raw.split(",")[0]?.trim() ?? "";
  return first.replace(/^['"]|['"]$/g, "");
};

const collectFontsFromRawStores = (rawStores: any): string[] => {
  const fonts = new Set<string>();
  const list = rawStores?.textElements;
  if (!Array.isArray(list)) return [];
  for (const t of list) {
    const fam = normalizeFontFamily(t?.fontFamily);
    if (!fam) continue;
    const lower = fam.toLowerCase();
    if (["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"].includes(lower)) continue;
    fonts.add(fam);
  }
  return Array.from(fonts);
};

// const chunk = <T,>(arr: T[], size: number) => {
//     const out: T[][] = [];
//     for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//     return out;
// };

const SIZES: Record<SizeKey, SizeDef> = {
  A5: { key: "A5", label: "A5" },
  A4: { key: "A4", label: "A4" },
  A3: { key: "A3", label: "A3" },
  US_LETTER: { key: "US_LETTER", label: "US Letter" },
  HALF_US_LETTER: { key: "HALF_US_LETTER", label: "Half US Letter" },
  US_TABLOID: { key: "US_TABLOID", label: "US Tabloid" },
  MUG_WRAP_11OZ: { key: "MUG_WRAP_11OZ", label: " (11oz mug)" },
  COASTER_95: { key: "COASTER_95", label: "(×2 coasters)" },
};

const getPricingConfig = (categoryName?: string): CategoryPricingConfig => {
  const name = (categoryName ?? "").trim().toLowerCase();

  if (name.includes("invite")) {
    return {
      title: "Prices by Size",
      note: "Invite sizing options are unique.",
      sizes: [
        { ...SIZES.A5, helper: "2 per A4 sheet" },
        { ...SIZES.A4, helper: "1 per A4 sheet" },
        { ...SIZES.HALF_US_LETTER, helper: "2 per US Letter sheet" },
        { ...SIZES.US_LETTER, helper: "1 per US Letter sheet" },
      ],
    };
  }

  if (name.includes("business leaflet"))
    return {
      title: "Prices by Size",
      sizes: [
        { ...SIZES.A5, helper: "2 per A4 sheet" },
        { ...SIZES.A4, helper: "1 per A4 sheet" },
        { ...SIZES.HALF_US_LETTER, helper: "2 per US Letter sheet" },
        { ...SIZES.US_LETTER, helper: "1 per US Letter sheet" },
      ],
    };

  if (name.includes("business card"))
    return {
      title: "Prices by Size",
      sizes: [
        { ...SIZES.A4, helper: "1 per A4 sheet" },
        { ...SIZES.US_LETTER, helper: "1 per US Letter sheet" },
      ],
    };

  if (name.includes("candle"))
    return {
      title: "Prices by Size",
      sizes: [
        { ...SIZES.A4, helper: "6 labels per A4 sheet (70mm × 70mm)" },
        { ...SIZES.US_TABLOID, helper: "6 labels per sheet (70mm × 70mm)" },
      ],
    };

  if (name.includes("clothing"))
    return {
      title: "Prices by Size",
      sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER, SIZES.US_TABLOID],
    };
  if (name.includes("mug"))
    return { title: "Prices by Size", sizes: [SIZES.MUG_WRAP_11OZ] };
  if (name.includes("coaster"))
    return { title: "Prices by Size", sizes: [SIZES.COASTER_95] };
  if (name.includes("sticker"))
    return {
      title: "Prices by Size",
      sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER],
    };
  if (name.includes("notebook"))
    return {
      title: "Prices by Size",
      sizes: [SIZES.A5, SIZES.A4, SIZES.HALF_US_LETTER, SIZES.US_LETTER],
    };
  if (name.includes("wall art"))
    return {
      title: "Prices by Size",
      sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER, SIZES.US_TABLOID],
    };
  if (name.includes("photo art"))
    return {
      title: "Prices by Size",
      sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER, SIZES.US_TABLOID],
    };
  if (name.includes("bag"))
    return {
      title: "Prices by Size",
      sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER, SIZES.US_TABLOID],
    };

  // Default: Cards
  return {
    title: "Prices by Size",
    sizes: [
      SIZES.A5,
      SIZES.A4,
      SIZES.HALF_US_LETTER,
      SIZES.US_LETTER,
      { ...SIZES.US_TABLOID, helper: "Folded half: 11 × 8.5 in" },
    ],
  };
};

const getNestedError = (
  errors: FieldErrors<FormValue>,
  path: string,
): string | undefined => {
  const parts = path.split(".");
  let cur: any = errors;
  for (const p of parts) {
    if (!cur) return undefined;
    cur = cur[p];
  }
  return cur?.message as string | undefined;
};

const TempletForm = () => {
  const { saveDesign, loading, setLoading, resetState } =
    useCategoriesEditorState();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as any;


  const mode: string | undefined = navState?.mode;
  const templateId: string | undefined = navState?.id ?? undefined;
  const prevImg: string | undefined = navState?.imgUrl ?? undefined;
  const isEditMode = mode === "edit" || !!templateId;

  const [rawStoresState, setRawStoresState] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<EditProductLike | undefined>(
    (location.state as any)?.product,
  );
  const [previewImage, setPreviewImage] = useState<string | undefined>(prevImg);
  // const [previewImageRatio, setPreviewImageRatio] = useState<number | null>(null);

  useEffect(() => {
    const rs = navState?.rawStores;
    if (!rs) return;

    const normalized =
      typeof rs === "string"
        ? (() => {
            try {
              return JSON.parse(rs);
            } catch {
              return null;
            }
          })()
        : rs;

    setRawStoresState(normalized);
  }, [navState?.rawStores]);


  useEffect(() => {
    if (!isEditMode || !templateId) return;
    let mounted = true;

    const load = async () => {
      try {
        const row: any = await fetchTempletDesignFullById(templateId);
        if (!mounted || !row) return;

        const normalizedProduct: EditProductLike = {
          cardname: row.title ?? row.name ?? row.cardname ?? "",
          cardcategory: row.category ?? row.cardcategory ?? "",
          subCategory: row.subCategory ?? row.subcategory ?? "",
          subSubCategory: row.subSubCategory ?? row.sub_subcategory ?? "",
          sku: row.sku ?? "",
          description: row.description ?? "",

          actualprice: row.actualprice ?? row.actual_price ?? "",
          a4price: row.a4price ?? "",
          a5price: row.a5price ?? "",
          usletter: row.usletter ?? "",
          saleprice: row.saleprice ?? row.sale_price ?? "",
          salea4price: row.salea4price ?? "",
          salea5price: row.salea5price ?? "",
          saleusletter: row.saleusletter ?? "",

          a3price: row.a3price ?? "",
          halfusletter: row.halfusletter ?? "",
          ustabloid: row.ustabloid ?? "",
          salea3price: row.salea3price ?? "",
          salehalfusletter: row.salehalfusletter ?? "",
          saleustabloid: row.saleustabloid ?? "",

          pricing: row.pricing ?? undefined,
          salePricing: row.salePricing ?? undefined,
        };

        setEditProduct(normalizedProduct);

        const rs = row.raw_stores ?? row.rawStores ?? row.rawstores ?? null;
        if (rs) {
          const normalized =
            typeof rs === "string"
              ? (() => {
                  try {
                    return JSON.parse(rs);
                  } catch {
                    return null;
                  }
                })()
              : rs;

          const snapshotSlides =
            typeof row?.slides === "string"
              ? (() => {
                  try {
                    return JSON.parse(row.slides);
                  } catch {
                    return null;
                  }
                })()
              : row?.slides ?? null;

          setRawStoresState(
            normalized && snapshotSlides
              ? { ...normalized, snapshotSlides }
              : normalized
          );
        }

        const img =
          row.img_url ??
          row.image_url ??
          row.imageurl ??
          row.lastpageImageUrl ??
          row.lastpageimageurl ??
          undefined;
        if (img) setPreviewImage(img);

        didPrefillRef.current = false;
      } catch (e) {
        console.error("Failed to fetch template full details:", e);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isEditMode, templateId]);

  useEffect(() => {
    if (!rawStoresState) return;
    const fonts = collectFontsFromRawStores(rawStoresState);
    if (!fonts.length) return;
    loadGoogleFontsOnce(buildGoogleFontsUrls(fonts));
  }, [rawStoresState]);

  // useEffect(() => {
  //     if (!previewImage) {
  //         setPreviewImageRatio(null);
  //         return;
  //     }
  //     const img = new Image();
  //     img.onload = () => {
  //         const ratio = img.width && img.height ? img.width / img.height : null;
  //         setPreviewImageRatio(ratio && Number.isFinite(ratio) ? ratio : null);
  //     };
  //     img.onerror = () => setPreviewImageRatio(null);
  //     img.src = previewImage;
  // }, [previewImage]);

  const rawStores = rawStoresState;

  const previewRef = useRef<HTMLDivElement | null>(null);
  const [previewUrl] = useState<string | undefined>(undefined);

  const didPrefillRef = useRef(false);

 useEffect(() => {
  const incomingProduct = (location.state as any)?.product;

  if (incomingProduct) {
    // Only update if it's truly different
    setEditProduct((prev) => {
      if (prev === incomingProduct) return prev;
      didPrefillRef.current = false; // allow prefill to run
      return incomingProduct;
    });
  }
}, [location.state?.product]);



  const {
    data: categories = [],
    isLoading: isLoadingCats,
    isError: isErrorCats,
  } = useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: fetchAllCategoriesFromDB,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
    setValue,
    getValues,
  } = useForm<FormValue>({
    defaultValues: {
      cardname: "",
      cardcategory: "",
      subCategory: "",
      subSubCategory: "",
      sku: "",

      actualprice: "",
      a4price: "",
      a5price: "",
      usletter: "",
      saleprice: "",
      salea4price: "",
      salea5price: "",
      saleusletter: "",

      pricing: {},
      salePricing: {},

      description: "",
      polygon_shape: "",
    },
  });

  const product = editProduct;

  const selectedCategoryName = watch("cardcategory");
  const selectedSubCategory = watch("subCategory");

  const categoryOptions: Option[] = useMemo(() => {
    const normalized = categories
      .map((c) => (c?.name ?? "").trim())
      .filter(Boolean)
      .filter((name) => name.trim().toLowerCase() !== "cards");
    const unique = Array.from(new Set(normalized));
    unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return unique.map((name) => ({ label: name, value: name }));
  }, [categories]);

  const categoryOptionsWithEmpty: Option[] = useMemo(
    () => [{ label: "Select category", value: "" }, ...categoryOptions],
    [categoryOptions],
  );

  const pricingConfig = useMemo(
    () => getPricingConfig(selectedCategoryName),
    [selectedCategoryName],
  );
  const sizes = pricingConfig.sizes;

  // const perRow = useMemo(() => {
  //     const hasTabloid = sizes.some((s) => s.key === "US_TABLOID");
  //     return hasTabloid && sizes.length >= 5 ? 5 : 4;
  // }, [sizes]);

  // const sizeChunks = useMemo(() => chunk(sizes, perRow), [sizes, perRow]);

  // ✅ Prefill ONLY ONCE (prevents category snapping back)
  useEffect(() => {
  if (!product) return;
  if (didPrefillRef.current) return;
  didPrefillRef.current = true;
  
    const productConfig = getPricingConfig(product.cardcategory);
    const productSizes = productConfig.sizes;
    const hasA5 = productSizes.some((s) => s.key === "A5");
    const hasA3 = productSizes.some((s) => s.key === "A3");
    const firstKey = productSizes[0]?.key;

    const incomingPricing: PricingMap = {};
    const incomingSalePricing: PricingMap = {};

    Object.assign(incomingPricing, readPricingMap((product as any).pricing));
    Object.assign(incomingSalePricing, readPricingMap((product as any).salePricing));

    // raw_stores fallback (if present)
    const rawPricing = readPricingMap((rawStoresState as any)?.pricing);
    for (const [k, v] of Object.entries(rawPricing) as [SizeKey, string][]) {
      if (isBlank(incomingPricing[k]) && !isBlank(v)) incomingPricing[k] = v;
    }

    const rawSalePricing = readPricingMap((rawStoresState as any)?.salePricing);
    for (const [k, v] of Object.entries(rawSalePricing) as [SizeKey, string][]) {
      if (isBlank(incomingSalePricing[k]) && !isBlank(v)) incomingSalePricing[k] = v;
    }

    if (firstKey && !incomingPricing[firstKey] && product.actualprice != null) {
      incomingPricing[firstKey] = String(product.actualprice);
    }
    if (
      firstKey &&
      !incomingSalePricing[firstKey] &&
      product.saleprice != null
    ) {
      incomingSalePricing[firstKey] = String(product.saleprice);
    }

    // DB fallback
    if (isBlank(incomingPricing.A4) && product.a4price != null)
      incomingPricing.A4 = String(product.a4price);
    if (isBlank(incomingPricing.US_LETTER) && product.usletter != null)
      incomingPricing.US_LETTER = String(product.usletter);
    if (isBlank(incomingPricing.A3) && product.a3price != null)
      incomingPricing.A3 = String(product.a3price);
    if (isBlank(incomingPricing.HALF_US_LETTER) && product.halfusletter != null)
      incomingPricing.HALF_US_LETTER = String(product.halfusletter);
    if (isBlank(incomingPricing.US_TABLOID) && product.ustabloid != null)
      incomingPricing.US_TABLOID = String(product.ustabloid);

    // legacy a5price ambiguity
    if (isBlank(incomingPricing.A5) && hasA5 && product.a5price != null)
      incomingPricing.A5 = String(product.a5price);
    if (
      isBlank(incomingPricing.A3) &&
      hasA3 &&
      product.a3price == null &&
      product.a5price != null
    )
      incomingPricing.A3 = String(product.a5price);

    if (isBlank(incomingSalePricing.A4) && product.salea4price != null)
      incomingSalePricing.A4 = String(product.salea4price);
    if (isBlank(incomingSalePricing.US_LETTER) && product.saleusletter != null)
      incomingSalePricing.US_LETTER = String(product.saleusletter);
    if (isBlank(incomingSalePricing.A3) && product.salea3price != null)
      incomingSalePricing.A3 = String(product.salea3price);
    if (isBlank(incomingSalePricing.HALF_US_LETTER) && product.salehalfusletter != null)
      incomingSalePricing.HALF_US_LETTER = String(product.salehalfusletter);
    if (isBlank(incomingSalePricing.US_TABLOID) && product.saleustabloid != null)
      incomingSalePricing.US_TABLOID = String(product.saleustabloid);

    if (isBlank(incomingSalePricing.A5) && hasA5 && product.salea5price != null)
      incomingSalePricing.A5 = String(product.salea5price);
    if (
      isBlank(incomingSalePricing.A3) &&
      hasA3 &&
      product.salea3price == null &&
      product.salea5price != null
    )
      incomingSalePricing.A3 = String(product.salea5price);

    reset({
      cardname: product.cardname ?? "",
      cardcategory: product.cardcategory ?? "",
      subCategory: product.subCategory ?? "",
      subSubCategory: product.subSubCategory ?? "",
      sku: product.sku ?? "",
      description: product.description ?? "",
      polygon_shape: "",

      actualprice: product.actualprice ?? "",
      a4price: product.a4price ?? "",
      a5price: product.a5price ?? "",
      usletter: product.usletter ?? "",
      saleprice: product.saleprice ?? "",
      salea4price: product.salea4price ?? "",
      salea5price: product.salea5price ?? "",
      saleusletter: product.saleusletter ?? "",

      pricing: incomingPricing,
      salePricing: incomingSalePricing,
    });
  }, [product, rawStoresState, reset]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.name === selectedCategoryName),
    [categories, selectedCategoryName],
  );

  const subCategoryOptions: Option[] = useMemo(() => {
    const base = selectedCategory?.subcategories ?? [];
    const set = new Set(base);
    if (selectedSubCategory && !set.has(selectedSubCategory))
      set.add(selectedSubCategory);
    const list = Array.from(set);
    if (list.length === 0) return [{ label: "Select sub category", value: "" }];
    return [
      { label: "Select sub category", value: "" },
      ...list.map((sub) => ({ label: sub, value: sub })),
    ];
  }, [selectedCategory, selectedSubCategory]);

  const subSubCategoryOptions: Option[] = useMemo(() => {
    if (!selectedCategory || !selectedSubCategory)
      return [{ label: "Select sub-sub category", value: "" }];
    const map = selectedCategory.sub_subcategories || {};
    const list = map[selectedSubCategory] || [];
    const set = new Set(list);
    const current = watch("subSubCategory") || "";
    if (current && !set.has(current)) set.add(current);
    const final = Array.from(set);
    return [
      { label: "Select sub-sub category", value: "" },
      ...final.map((name) => ({ label: name, value: name })),
    ];
  }, [selectedCategory, selectedSubCategory, watch]);

  // Clear sub/subSub when invalid after category changes
  useEffect(() => {
    const sub = watch("subCategory") || "";
    const subsub = watch("subSubCategory") || "";
    const availableSubs = selectedCategory?.subcategories ?? [];
    const validSub =
      availableSubs.length === 0 ? true : availableSubs.includes(sub);

    if (!validSub) {
      setValue("subCategory", "");
      setValue("subSubCategory", "");
      return;
    }

    const availableSubSubs = selectedCategory?.sub_subcategories?.[sub] ?? [];
    const validSubSub =
      availableSubSubs.length === 0 ? true : availableSubSubs.includes(subsub);
    if (!validSubSub) setValue("subSubCategory", "");
  }, [selectedCategoryName, selectedCategory, setValue, watch]);

  // Ensure keys exist
  useEffect(() => {
    for (const s of sizes) {
      const p = `pricing.${s.key}` as PricingFieldPath;
      const sp = `salePricing.${s.key}` as SalePricingFieldPath;
      if (getValues(p) === undefined) setValue(p, "");
      if (getValues(sp) === undefined) setValue(sp, "");
    }
  }, [sizes, getValues, setValue]);

  // legacy sync for old columns
  const pricing = watch("pricing");
  const salePricing = watch("salePricing");

  useEffect(() => {
    const hasA5 = sizes.some((s) => s.key === "A5");
    const hasA3 = sizes.some((s) => s.key === "A3");
    const firstKey = sizes[0]?.key;

    const nextActual = (firstKey ? pricing?.[firstKey] : "") ?? "";
    if ((getValues("actualprice") ?? "") !== nextActual)
      setValue("actualprice", nextActual);

    const nextSale = (firstKey ? salePricing?.[firstKey] : "") ?? "";
    if ((getValues("saleprice") ?? "") !== nextSale)
      setValue("saleprice", nextSale);

    if ((getValues("a4price") ?? "") !== (pricing?.A4 ?? ""))
      setValue("a4price", (pricing?.A4 ?? "") as any);
    if ((getValues("usletter") ?? "") !== (pricing?.US_LETTER ?? ""))
      setValue("usletter", (pricing?.US_LETTER ?? "") as any);

    const legacyA5Slot = hasA5
      ? (pricing?.A5 ?? "")
      : hasA3
        ? (pricing?.A3 ?? "")
        : "";
    if ((getValues("a5price") ?? "") !== legacyA5Slot)
      setValue("a5price", legacyA5Slot as any);

    if ((getValues("salea4price") ?? "") !== (salePricing?.A4 ?? ""))
      setValue("salea4price", (salePricing?.A4 ?? "") as any);
    if ((getValues("saleusletter") ?? "") !== (salePricing?.US_LETTER ?? ""))
      setValue("saleusletter", (salePricing?.US_LETTER ?? "") as any);

    const legacySaleA5Slot = hasA5
      ? (salePricing?.A5 ?? "")
      : hasA3
        ? (salePricing?.A3 ?? "")
        : "";
    if ((getValues("salea5price") ?? "") !== legacySaleA5Slot)
      setValue("salea5price", legacySaleA5Slot as any);
  }, [sizes, getValues, pricing, salePricing, setValue]);

  const onSubmit = async (data: FormValue) => {
    setLoading(true);

    let captured: string | null = null;
    if (previewRef.current) {
      try {
        await (document as any).fonts?.ready?.catch(() => { });
        captured = await htmlToImage.toPng(previewRef.current, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          style: { transform: "none" },
          skipFonts: false,
          // fontEmbedCSS: "",
        });
      } catch (e) {
        console.error("LeftBox capture failed:", e);
      }
    }

    const pricingValues = getValues("pricing") ?? {};
    const salePricingValues = getValues("salePricing") ?? {};

    const hasA5 = sizes.some((s) => s.key === "A5");
    const hasA3 = sizes.some((s) => s.key === "A3");
    const firstKey = sizes[0]?.key;

    const existingPricing: PricingMap = isEditMode
      ? {
          ...readPricingMap((product as any)?.pricing),
          ...readPricingMap((rawStoresState as any)?.pricing),
        }
      : {};
    const existingSalePricing: PricingMap = isEditMode
      ? {
          ...readPricingMap((product as any)?.salePricing),
          ...readPricingMap((rawStoresState as any)?.salePricing),
        }
      : {};

    if (isEditMode) {
      if (isBlank(existingPricing.A4) && product?.a4price != null)
        existingPricing.A4 = String(product.a4price);
      if (isBlank(existingPricing.US_LETTER) && product?.usletter != null)
        existingPricing.US_LETTER = String(product.usletter);
      if (isBlank(existingPricing.A3) && product?.a3price != null)
        existingPricing.A3 = String(product.a3price);
      if (isBlank(existingPricing.HALF_US_LETTER) && product?.halfusletter != null)
        existingPricing.HALF_US_LETTER = String(product.halfusletter);
      if (isBlank(existingPricing.US_TABLOID) && product?.ustabloid != null)
        existingPricing.US_TABLOID = String(product.ustabloid);
      if (isBlank(existingPricing.A5) && hasA5 && product?.a5price != null)
        existingPricing.A5 = String(product.a5price);
      if (
        isBlank(existingPricing.A3) &&
        hasA3 &&
        product?.a3price == null &&
        product?.a5price != null
      )
        existingPricing.A3 = String(product.a5price);

      if (isBlank(existingSalePricing.A4) && product?.salea4price != null)
        existingSalePricing.A4 = String(product.salea4price);
      if (isBlank(existingSalePricing.US_LETTER) && product?.saleusletter != null)
        existingSalePricing.US_LETTER = String(product.saleusletter);
      if (isBlank(existingSalePricing.A3) && product?.salea3price != null)
        existingSalePricing.A3 = String(product.salea3price);
      if (isBlank(existingSalePricing.HALF_US_LETTER) && product?.salehalfusletter != null)
        existingSalePricing.HALF_US_LETTER = String(product.salehalfusletter);
      if (isBlank(existingSalePricing.US_TABLOID) && product?.saleustabloid != null)
        existingSalePricing.US_TABLOID = String(product.saleustabloid);
      if (isBlank(existingSalePricing.A5) && hasA5 && product?.salea5price != null)
        existingSalePricing.A5 = String(product.salea5price);
      if (
        isBlank(existingSalePricing.A3) &&
        hasA3 &&
        product?.salea3price == null &&
        product?.salea5price != null
      )
        existingSalePricing.A3 = String(product.salea5price);
    }

    const resolvedPricing: PricingMap = { ...(pricingValues as PricingMap) };
    const resolvedSalePricing: PricingMap = { ...(salePricingValues as PricingMap) };
    for (const [k, v] of Object.entries(existingPricing) as [SizeKey, string][]) {
      if (isBlank(resolvedPricing[k]) && !isBlank(v)) resolvedPricing[k] = v;
    }
    for (const [k, v] of Object.entries(existingSalePricing) as [SizeKey, string][]) {
      if (isBlank(resolvedSalePricing[k]) && !isBlank(v)) resolvedSalePricing[k] = v;
    }

    const legacyA5Slot = hasA5
      ? (resolvedPricing as any)?.A5
      : hasA3
        ? (resolvedPricing as any)?.A3
        : "";
    const legacySaleA5Slot = hasA5
      ? (resolvedSalePricing as any)?.A5
      : hasA3
        ? (resolvedSalePricing as any)?.A3
        : "";

    const meta: PublishMeta = {
      id: templateId,
      mode,

      cardname: data.cardname,
      cardcategory: data.cardcategory,
      subCategory: data.subCategory,
      subSubCategory: data.subSubCategory,

      // legacy DB columns
      actualprice: toTextNumberOrEmpty(
        firstKey ? (resolvedPricing as any)?.[firstKey] : "",
      ),
      a4price: toTextNumberOrEmpty((resolvedPricing as any)?.A4),
      a5price: toTextNumberOrEmpty(legacyA5Slot),
      usletter: toTextNumberOrEmpty((resolvedPricing as any)?.US_LETTER),

      saleprice: toTextNumberOrEmpty(
        firstKey ? (resolvedSalePricing as any)?.[firstKey] : "",
      ),
      salea4price: toTextNumberOrEmpty((resolvedSalePricing as any)?.A4),
      salea5price: toTextNumberOrEmpty(legacySaleA5Slot),
      saleusletter: toTextNumberOrEmpty((resolvedSalePricing as any)?.US_LETTER),

      // NEW DB columns
      a3price: toTextNumberOrEmpty((resolvedPricing as any)?.A3),
      halfusletter: toTextNumberOrEmpty((resolvedPricing as any)?.HALF_US_LETTER),
      ustabloid: toTextNumberOrEmpty((resolvedPricing as any)?.US_TABLOID),

      salea3price: toTextNumberOrEmpty((resolvedSalePricing as any)?.A3),
      salehalfusletter: toTextNumberOrEmpty((resolvedSalePricing as any)?.HALF_US_LETTER),
      saleustabloid: toTextNumberOrEmpty((resolvedSalePricing as any)?.US_TABLOID),

      pricing: resolvedPricing as any,
      salePricing: resolvedSalePricing as any,

      description: data.description,
      sku: data.sku,
      imgUrl: captured ?? previewUrl,
    };

    await saveDesign(meta);
    setLoading(false);
    resetState();
    reset();
  };

  const mmToPx = (mm: number) => (mm / 25.4) * 96;

  const toNum = (v: any, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : d;
  };

  const canvasDims = useMemo(() => {
    const fitW = toNum(rawStores?.config?.fitCanvas?.width, 0);
    const fitH = toNum(rawStores?.config?.fitCanvas?.height, 0);

    const canvasMmW = toNum(rawStores?.canvas?.mm?.w, 0);
    const canvasMmH = toNum(rawStores?.canvas?.mm?.h, 0);

    const canvasPxW = toNum(rawStores?.canvas?.px?.w, 0);
    const canvasPxH = toNum(rawStores?.canvas?.px?.h, 0);

    const mmW = toNum(rawStores?.config?.mmWidth, 0);
    const mmH = toNum(rawStores?.config?.mmHeight, 0);

    const width = fitW || canvasMmW || canvasPxW || (mmW ? mmToPx(mmW) : 0);
    const height = fitH || canvasMmH || canvasPxH || (mmH ? mmToPx(mmH) : 0);

    if (!width || !height) return { width: 400, height: 565 };
    return { width, height };
  }, [
    rawStores?.config?.fitCanvas?.width,
    rawStores?.config?.fitCanvas?.height,
    rawStores?.canvas?.mm?.w,
    rawStores?.canvas?.mm?.h,
    rawStores?.canvas?.px?.w,
    rawStores?.canvas?.px?.h,
    rawStores?.config?.mmWidth,
    rawStores?.config?.mmHeight,
  ]);

  // preview کی max boundaries (responsive)
  // const previewBounds = useMemo(() => {
  //     if (isMdUp) return { maxW: 600, maxH: 900 };
  //     if (isSmUp) return { maxW: 500, maxH: 750 };
  //     return { maxW: 360, maxH: 540 };
  // }, [isMdUp, isSmUp]);

  const previewSize = useMemo(() => {
    return { width: canvasDims.width, height: canvasDims.height };
  }, [canvasDims.width, canvasDims.height]);

  const MUGS = navState.rawStores?.category === "Mugs";
  const BCARD = navState.rawStores?.category === "Business Cards";

  console.log(MUGS);
  console.log(BCARD);

  const cols = 4;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "auto",
        // overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          m: "auto",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Left Preview */}
        <Box
          sx={{
            width: previewSize.width,
            height: previewSize.height,
            maxWidth: "100%",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#ffffff",
            mx: "auto",
          }}
        >
          <Box
            ref={previewRef}
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
              backgroundColor: "transparent",
            }}
          >
            {rawStores ? (
              (() => {
                const snapshotSlides =
                  Array.isArray(rawStores.snapshotSlides)
                    ? rawStores.snapshotSlides
                    : typeof rawStores.snapshotSlides === "string"
                      ? (() => {
                        try {
                          const parsed = JSON.parse(rawStores.snapshotSlides);
                          return Array.isArray(parsed) ? parsed : [];
                        } catch {
                          return [];
                        }
                      })()
                      : [];

                const slidesSource =
                  snapshotSlides.length > 0 ? snapshotSlides : rawStores.slides ?? [];

                const firstSlide = slidesSource?.[0];
                if (!firstSlide) {
                  return (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        p: 4,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body1">
                        No slide data available
                      </Typography>
                    </Box>
                  );
                }

                const hasSeparatedEls =
                  (rawStores.textElements?.length ?? 0) > 0 ||
                  (rawStores.imageElements?.length ?? 0) > 0 ||
                  (rawStores.stickerElements?.length ?? 0) > 0;

                const asSlideId = (v: any) => {
                  const n = Number(v);
                  return Number.isFinite(n) ? n : null;
                };

                const firstSlideId =
                  asSlideId(firstSlide?.id ?? firstSlide?.slideId ?? firstSlide?.slide_id) ??
                  0;

                const slideTextElements = hasSeparatedEls
                  ? rawStores.textElements?.filter((te: any) => {
                      const sid = asSlideId(te?.slideId ?? te?.slide_id);
                      return sid === firstSlideId;
                    }) || []
                  : (firstSlide?.elements ?? []).filter((el: any) => {
                      const t = String(el?.type ?? "").toLowerCase();
                      return t === "text" || (!t && el?.text != null);
                    });

                const slideImageElements = hasSeparatedEls
                  ? rawStores.imageElements?.filter((ie: any) => {
                      const sid = asSlideId(ie?.slideId ?? ie?.slide_id);
                      return sid === firstSlideId;
                    }) || []
                  : (firstSlide?.elements ?? []).filter((el: any) => {
                      const t = String(el?.type ?? "").toLowerCase();
                      return t === "image" || t === "sticker" || (!t && (el?.src || el?.image || el?.url));
                    });
                const slideBg = rawStores.slideBg?.[firstSlideId] || rawStores.slideBg?.[firstSlide?.id] || null;

                // canvas کا سائز جو ایڈیٹر سے آیا ہے
                const canvasW = canvasDims.width;
                const canvasH = canvasDims.height;

                // preview کنٹینر کا سائز
                const containerW = previewSize.width;
                const containerH = previewSize.height;

                // scale = container / canvas
                const scale = Math.min(
                  containerW / canvasW,
                  containerH / canvasH,
                );

                const normalizePos = (el: any) => {
                  let x = toNum(el?.x ?? el?.left, 0);
                  let y = toNum(el?.y ?? el?.top, 0);
                  let w = toNum(el?.width ?? el?.w, 0);
                  let h = toNum(el?.height ?? el?.h, 0);

                  const rel = (n: number) => n > 0 && n <= 1;
                  if (rel(x) || rel(y) || rel(w) || rel(h)) {
                    x = x * canvasW;
                    y = y * canvasH;
                    w = w * canvasW;
                    h = h * canvasH;
                  }

                  return { x, y, w, h };
                };

                return (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                      bgcolor: "#fff",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        bgcolor: slideBg?.color || "#ffffff",
                        overflow: "hidden",
                      }}
                    >
                      {/* Background Image */}
                      {slideBg?.image && (
                        <Box
                          component="img"
                          src={slideBg.image}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            position: "absolute",
                            inset: 0,
                          }}
                        />
                      )}

                      {/* Images */}
                      {slideImageElements.map((img: any) => {
                        const { x, y, w, h } = normalizePos(img);
                        return (
                          <Box
                            key={img.id}
                            component="img"
                            src={img.src ?? img.sticker ?? img.image ?? img.url ?? img.imageUrl}
                            sx={{
                              position: "absolute",
                              left: `${x * scale}px`,
                              top: `${y * scale}px`,
                              width: `${w * scale}px`,
                              height: `${h * scale}px`,
                              objectFit: "cover",
                            }}
                          />
                        );
                      })}

                      {/* Text */}
                      {slideTextElements.map((txt: any) => {
                        const { x, y, w, h } = normalizePos(txt);
                        const align = (String(txt?.align ?? "center").toLowerCase() as
                          | "left"
                          | "center"
                          | "right");
                        const justify =
                          align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

                        return (
                          <Typography
                            key={txt.id}
                            sx={{
                              position: "absolute",
                              left: `${x * scale}px`,
                              top: `${y * scale}px`,
                              width: `${w * scale}px`,
                              height: `${h * scale}px`,
                              fontWeight: txt.bold ? 700 : 400,
                              fontStyle: txt.italic ? "italic" : "normal",
                              fontSize: toNum(txt.fontSize ?? txt.font_size, 20),
                              fontFamily: txt.fontFamily ?? txt.font_family ?? "Arial",
                              color: txt.color ?? "#111111",
                              textAlign: align,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: justify,
                              whiteSpace: "pre-wrap",
                              overflowWrap: "break-word",
                              wordBreak: "break-word",
                              userSelect: "none",
                              pointerEvents: "none",
                            }}
                          >
                            {txt.text ?? txt.value}
                          </Typography>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })()
            ) : previewImage ? (
              <Box
                component="img"
                src={previewImage}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Typography>No preview available</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >
          {/* Title */}
          <CustomInput
            label="Title"
            placeholder="Enter template title"
            register={register("cardname", { required: "Title is required" })}
            error={errors.cardname?.message}
          />

          {/* Category */}
          <Controller
            name="cardcategory"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <CustomInput
                label="Category"
                type="select"
                placeholder={
                  isLoadingCats
                    ? "Loading categories..."
                    : isErrorCats
                      ? "Failed to load categories"
                      : "Select category"
                }
                value={field.value ?? ""}
                onChange={(e) => field.onChange((e.target as any).value)}
                error={errors.cardcategory?.message}
                options={categoryOptionsWithEmpty}
              />
            )}
          />

          {/* Sub Category */}
          <Controller
            name="subCategory"
            control={control}
            rules={{
              required:
                subCategoryOptions.length > 1
                  ? "Sub category is required"
                  : false,
            }}
            render={({ field }) => (
              <CustomInput
                label="Sub Category"
                type="select"
                placeholder={
                  !watch("cardcategory")
                    ? "Select main category first"
                    : subCategoryOptions.length <= 1
                      ? "No sub categories"
                      : "Select sub category"
                }
                value={field.value ?? ""}
                onChange={(e) => field.onChange((e.target as any).value)}
                error={errors.subCategory?.message}
                options={subCategoryOptions}
              />
            )}
          />

          {/* Sub Sub Category */}
          <Controller
            name="subSubCategory"
            control={control}
            rules={{
              required:
                subSubCategoryOptions.length > 1
                  ? "Sub-sub category is required"
                  : false,
            }}
            render={({ field }) => (
              <CustomInput
                label="Sub Sub Category"
                type="select"
                placeholder={
                  !watch("subCategory")
                    ? "Select sub category first"
                    : subSubCategoryOptions.length <= 1
                      ? "No sub-sub categories"
                      : "Select sub-sub category"
                }
                value={field.value ?? ""}
                onChange={(e) => field.onChange((e.target as any).value)}
                error={errors.subSubCategory?.message}
                options={subSubCategoryOptions}
              />
            )}
          />

          {/* SKU */}
          <CustomInput
            label="SKU"
            placeholder="Enter your SKU"
            register={register("sku", { required: "SKU is required" })}
            error={errors.sku?.message}
          />

          {/* Pricing Note */}
          <Box sx={{ gridColumn: "1 / -1" }}>
            {pricingConfig.note && (
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {pricingConfig.note}
              </Typography>
            )}
          </Box>

          {/* Actual Prices */}
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography sx={{ fontWeight: 700, mb: 0.8 }}>
              Actual Prices
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 1,
              }}
            >
              {sizes.map((s) => (
                <CustomInput
                  key={`pricing-${s.key}`}
                  label={s.label}
                  placeholder="0"
                  register={register(`pricing.${s.key}` as PricingFieldPath, {
                    required: !isEditMode ? "Required" : false,
                  })}
                  error={getNestedError(errors, `pricing.${s.key}`)}
                />
              ))}
            </Box>
          </Box>

          {/* Sale Prices */}
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography sx={{ fontWeight: 700, mb: 0.8, mt: 2 }}>
              Sale Prices
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 1,
              }}
            >
              {sizes.map((s) => (
                <CustomInput
                  key={`salePricing-${s.key}`}
                  label={s.label}
                  placeholder="0"
                  register={register(
                    `salePricing.${s.key}` as SalePricingFieldPath,
                  )}
                  error={getNestedError(errors, `salePricing.${s.key}`)}
                />
              ))}
            </Box>
          </Box>

          {/* Description */}
          <Box sx={{ gridColumn: "1 / -1" }}>
            <CustomInput
              label="Description"
              placeholder="Enter description"
              register={register("description", {
                required: "Description is required",
              })}
              error={errors.description?.message}
              multiline
            />
          </Box>

          {/* Buttons */}
          <Box
            sx={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <LandingButton
              title={isEditMode ? "Update templet" : "Edit templet"}
              personal
              width="200px"
              type="button"
              onClick={() =>
                navigate(ADMINS_DASHBOARD.ADMIN_CATEGORIES_EDITOR, {
                  state: {
                    mode: isEditMode ? "edit" : "create",
                    id: templateId ?? null,
                    product: watch(),
                    rawStores: rawStoresState,
                  },
                })
              }
            />

            <LandingButton
              title={isEditMode ? "Update & Publish" : "Save & Publish"}
              personal
              variant="outlined"
              width="200px"
              type="submit"
              loading={loading}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TempletForm;
