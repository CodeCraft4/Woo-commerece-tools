// src/pages/admin/.../NewCardsForm.tsx
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo, useRef, useState, useEffect } from "react";
import CustomInput from "../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../components/LandingButton/LandingButton";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabase/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../../constant/route";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesFromDB } from "../../../../source/source";
import { useSlide1 } from "../../../../context/Slide1Context";
import { useSlide2 } from "../../../../context/Slide2Context";
import { useSlide3 } from "../../../../context/Slide3Context";
import { useSlide4 } from "../../../../context/Slide4Context";
import {
  applyPolygonLayoutToContexts,
  buildPolygonLayout,
  captureNodeToPng,
  mergeBuckets,
  pickPolygonLayout,
  type SlidePayloadV2,
} from "../../../../lib/polygon";
import {
  collectTemplateSlideFonts,
  renderTemplateSlideToCanvasWithStats,
  type TemplateSlide,
} from "../../../../lib/templateSlideCanvas";
import {
  buildGoogleFontsUrls,
  ensureGoogleFontsLoaded,
  loadGoogleFontsOnce,
} from "../../../../constant/googleFonts";
import Slide1PreviewBox from "./FirstSlidePreview/FirstSlidePreview";

type AccessPlan = "free" | "bundle" | "pro";

type FormValue = {
  cardname: string;
  cardcategory: string;
  subCategory?: string;
  subSubCategory?: string;
  sku: string;

  // ✅ NEW
  accessPlan: AccessPlan;

  actualprice?: string;
  a4price?: string;
  a5price?: string;
  usletter?: string;
  ustabloid?: string;
  saleprice?: string;
  salea4price?: string;
  salea5price?: string;
  saleusletter?: string;
  saleustabloid?: string;
  description: string;
  cardImage: FileList;
  polygon_shape: string;
};

type CategoryRow = {
  id: string;
  name: string;
  subcategories: string[];
  sub_subcategories: Record<string, string[]>;
};

type EditFormValue = {
  cardName?: string;
  cardCategory?: string;
  sku?: string;
  actualPrice?: string;
  a4price?: string;
  a5price?: string;
  usletter?: string;
  ustabloid?: string;
  salePrice?: string;
  salea4price?: string;
  salea5price?: string;
  saleusletter?: string;
  saleustabloid?: string;
  description?: string;
  imageUrl?: string;
  polygon_shape?: string;
  polygonlayout?: any;
  subCategory?: string;
  subSubCategory?: string;
  lastpageImageUrl?: string;
  lastMessage?: string;

  cardname?: string;
  cardcategory?: string;
  actualprice?: string;
  saleprice?: string;
  imageurl?: string;
  lastpageimageurl?: string;
  lastmessage?: string;

  // ✅ NEW (for edit prefill)
  accessPlan?: AccessPlan;
  accessplan?: AccessPlan;

  polyganLayout?: any;
};

type Props = { editProduct?: EditFormValue };

const parseLayoutPricing = (layout: any) => {
  if (!layout) return { pricing: {}, salePricing: {} };
  const obj =
    typeof layout === "string"
      ? (() => {
          try {
            return JSON.parse(layout);
          } catch {
            return null;
          }
        })()
      : layout;
  const pricing = obj?.pricing && typeof obj.pricing === "object" ? obj.pricing : {};
  const salePricing =
    obj?.salePricing && typeof obj.salePricing === "object" ? obj.salePricing : {};
  return { pricing, salePricing };
};

const pickLayoutCandidate = (...candidates: any[]) =>
  candidates.find((c) => c !== undefined && c !== null && c !== "") ?? null;

const getDataUrlDimensions = (dataUrl: string): Promise<{ width: number; height: number } | null> =>
  new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 0, height: img.naturalHeight || 0 });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    } catch {
      resolve(null);
    }
  });

const isReasonableThumbnail = async (dataUrl: string) => {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return false;
  const dims = await getDataUrlDimensions(dataUrl);
  if (!dims) return false;
  const { width, height } = dims;
  if (width < 120 || height < 120) return false;
  const ratio = width / height;
  // Guard against Safari broken strip captures (e.g. height ~1px).
  if (!Number.isFinite(ratio) || ratio > 4 || ratio < 0.2) return false;
  return true;
};

const toNum = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const firstDefined = (...values: any[]) => {
  for (const value of values) {
    if (value === 0 || value === false) return value;
    if (typeof value === "string") {
      if (value.trim()) return value;
      continue;
    }
    if (value != null) return value;
  }
  return undefined;
};

const normalizeAlign = (value: unknown): "left" | "center" | "right" => {
  const text = String(value ?? "").toLowerCase().trim();
  if (text === "start" || text === "left") return "left";
  if (text === "end" || text === "right") return "right";
  return "center";
};

const normalizeFontWeight = (value: unknown, fallback = 400) => {
  if (typeof value === "boolean") return value ? 700 : 400;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
};

const slideScopedValue = (
  entry: Record<string, any> | null | undefined,
  baseKey: string,
  slideId: number,
  fallback?: any,
) => {
  const orderedKeys = [
    `${baseKey}${slideId}`,
    baseKey,
    ...[1, 2, 3, 4].filter((idx) => idx !== slideId).map((idx) => `${baseKey}${idx}`),
  ];
  return firstDefined(...orderedKeys.map((key) => entry?.[key]), fallback);
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

const toDataUrlSafe = async (src: string): Promise<string> => {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;
  try {
    const absolute =
      src.startsWith("/") && typeof window !== "undefined" ? `${window.location.origin}${src}` : src;
    const resp = await fetch(absolute, { mode: "cors" });
    if (!resp.ok) return src;
    const blob = await resp.blob();
    return await blobToDataUrl(blob);
  } catch {
    return src;
  }
};

const mapPolygonSlideToTemplateSlide = (
  id: number,
  payload: SlidePayloadV2 | null | undefined,
  width: number,
  height: number,
): TemplateSlide => {
  const rawBgColor = String(payload?.bg?.color ?? "").trim();
  const bgColor = !rawBgColor || rawBgColor.toLowerCase() === "transparent" ? "#ffffff" : rawBgColor;

  const bgRect = payload?.bg?.rect ?? { x: 0, y: 0, width, height };
  const bgImage = String(payload?.bg?.image ?? "").trim();
  const bgImageElements = bgImage
    ? [
        {
          id: `bg-image-${id}`,
          type: "image" as const,
          src: bgImage,
          x: toNum(bgRect?.x, 0),
          y: toNum(bgRect?.y, 0),
          width: toNum(bgRect?.width, width),
          height: toNum(bgRect?.height, height),
          zIndex: 0,
        },
      ]
    : [];

  const bgFrames = mergeBuckets(payload?.layout?.bgFrames)
    .filter((el: any) => String(el?.src ?? "").trim())
    .map((el: any, idx: number) => ({
      id: String(el?.id ?? `bg-${id}-${idx}`),
      type: "image" as const,
      src: String(el?.src ?? ""),
      x: toNum(el?.x, 0),
      y: toNum(el?.y, 0),
      width: toNum(el?.width, 0),
      height: toNum(el?.height, 0),
      zIndex: toNum(el?.zIndex, 1),
    }));

  const layoutStickers = mergeBuckets(payload?.layout?.stickers)
    .filter((el: any) => String(el?.sticker ?? "").trim())
    .map((el: any, idx: number) => ({
      id: String(el?.id ?? `lst-${id}-${idx}`),
      type: "sticker" as const,
      src: String(el?.sticker ?? ""),
      x: toNum(el?.x, 0),
      y: toNum(el?.y, 0),
      width: toNum(el?.width, 0),
      height: toNum(el?.height, 0),
      zIndex: toNum(el?.zIndex, 40),
    }));

  const staticTexts = Array.isArray(payload?.layout?.staticText)
    ? payload.layout.staticText
        .filter((text: any) => String(text?.text ?? "").trim().length > 0)
        .map((text: any, idx: number) => ({
          id: String(text?.id ?? `stxt-${id}-${idx}`),
          type: "text" as const,
          text: String(text?.text ?? ""),
          x: toNum(text?.x, 0),
          y: toNum(text?.y, 0),
          width: toNum(text?.width, 0),
          height: toNum(text?.height, 0),
          zIndex: toNum(text?.zIndex, 80),
          color: String(text?.color ?? "#111111"),
          fontSize: toNum(text?.fontSize, 20),
          fontFamily: String(text?.fontFamily ?? "Arial"),
          fontWeight: normalizeFontWeight(text?.fontWeight, 400),
          fontStyle: text?.italic ? "italic" : "normal",
          textDecoration: "none",
          lineHeight: 1.16,
          align: normalizeAlign(text?.textAlign),
          rotation: toNum(text?.rotation, 0),
        }))
    : [];

  const userImages = mergeBuckets(payload?.user?.images)
    .filter((el: any) => String(el?.src ?? "").trim())
    .map((el: any, idx: number) => ({
      id: String(el?.id ?? `uimg-${id}-${idx}`),
      type: "image" as const,
      src: String(el?.src ?? ""),
      x: toNum(el?.x, 0),
      y: toNum(el?.y, 0),
      width: toNum(el?.width, 0),
      height: toNum(el?.height, 0),
      zIndex: toNum(el?.zIndex, 120),
    }));

  const userStickers = mergeBuckets(payload?.user?.stickers)
    .filter((el: any) => String(el?.sticker ?? "").trim())
    .map((el: any, idx: number) => ({
      id: String(el?.id ?? `ust-${id}-${idx}`),
      type: "sticker" as const,
      src: String(el?.sticker ?? ""),
      x: toNum(el?.x, 0),
      y: toNum(el?.y, 0),
      width: toNum(el?.width, 0),
      height: toNum(el?.height, 0),
      zIndex: toNum(el?.zIndex, 160),
    }));

  const freeTexts = Array.isArray(payload?.user?.freeTexts)
    ? payload.user.freeTexts
        .filter((text: any) => String(text?.value ?? "").trim().length > 0)
        .map((text: any, idx: number) => ({
          id: String(text?.id ?? `utxt-${id}-${idx}`),
          type: "text" as const,
          text: String(text?.value ?? ""),
          x: toNum(text?.position?.x, 0),
          y: toNum(text?.position?.y, 0),
          width: toNum(text?.size?.width, 0),
          height: toNum(text?.size?.height, 0),
          zIndex: toNum(text?.zIndex, 220),
          color: String(text?.fontColor ?? "#111111"),
          fontSize: toNum(text?.fontSize, 20),
          fontFamily: String(text?.fontFamily ?? "Arial"),
          fontWeight: normalizeFontWeight(text?.fontWeight, 400),
          fontStyle: "normal",
          textDecoration: "none",
          lineHeight: toNum(text?.lineHeight, 1.16),
          align: normalizeAlign(text?.textAlign),
          rotation: toNum(text?.rotation, 0),
        }))
    : [];

  const oneText = (() => {
    const value = String(payload?.oneText?.value ?? "").trim();
    if (!payload?.flags?.showOneText && !value.length) return [] as any[];
    if (!value) return [] as any[];
    return [
      {
        id: `one-${id}`,
        type: "text" as const,
        text: value,
        x: 8,
        y: 8,
        width: width - 16,
        height: height - 16,
        zIndex: 280,
        color: String(payload?.oneText?.fontColor ?? "#111111"),
        fontSize: toNum(payload?.oneText?.fontSize, 22),
        fontFamily: String(payload?.oneText?.fontFamily ?? "Arial"),
        fontWeight: normalizeFontWeight(payload?.oneText?.fontWeight, 400),
        fontStyle: "normal",
        textDecoration: "none",
        lineHeight: toNum(payload?.oneText?.lineHeight, 1.16),
        align: normalizeAlign(payload?.oneText?.textAlign),
        rotation: toNum(payload?.oneText?.rotation, 0),
      },
    ];
  })();

  const multipleTexts = (() => {
    const rows = Array.isArray(payload?.multipleTexts) ? payload.multipleTexts : [];
    const hasAnyContent = rows.some((entry: any) => String(firstDefined(entry?.value, entry?.text, "") ?? "").trim());
    if (!payload?.flags?.multipleText && !hasAnyContent) return [] as any[];
    return rows
      .map((entry: any, idx: number) => {
        const value = String(firstDefined(entry?.value, entry?.text, "") ?? "").trim();
        if (!value) return null;
        return {
          id: String(entry?.id ?? `multi-${id}-${idx}`),
          type: "text" as const,
          text: value,
          x: 8,
          y: 8 + idx * 220,
          width: width - 16,
          height: 210,
          zIndex: 300 + idx,
          color: String(slideScopedValue(entry, "fontColor", id, entry?.color ?? "#111111")),
          fontSize: toNum(slideScopedValue(entry, "fontSize", id, 22), 22),
          fontFamily: String(slideScopedValue(entry, "fontFamily", id, "Arial")),
          fontWeight: normalizeFontWeight(slideScopedValue(entry, "fontWeight", id, 400), 400),
          fontStyle: "normal",
          textDecoration: "none",
          lineHeight: toNum(slideScopedValue(entry, "lineHeight", id, 1.16), 1.16),
          align: normalizeAlign(slideScopedValue(entry, "textAlign", id, "center")),
          rotation: toNum(slideScopedValue(entry, "rotation", id, 0), 0),
        };
      })
      .filter(Boolean) as any[];
  })();

  const aiImage = payload?.ai?.imageUrl
    ? [
        {
          id: `ai-${id}`,
          type: "image" as const,
          src: String(payload.ai.imageUrl),
          x: toNum(payload.ai.x, 0),
          y: toNum(payload.ai.y, 0),
          width: toNum(payload.ai.width, 0),
          height: toNum(payload.ai.height, 0),
          zIndex: 350,
        },
      ]
    : [];

  return {
    id,
    label: `slide${id}`,
    bgColor,
    elements: [
      ...bgImageElements,
      ...bgFrames,
      ...layoutStickers,
      ...staticTexts,
      ...userImages,
      ...userStickers,
      ...freeTexts,
      ...oneText,
      ...multipleTexts,
      ...aiImage,
    ],
  };
};

const prepareTemplateSlideForCanvas = async (slide: TemplateSlide): Promise<TemplateSlide> => {
  const elements = await Promise.all(
    (slide?.elements ?? []).map(async (element: any) => {
      if (element?.type !== "image" && element?.type !== "sticker") return element;
      const src = String(element?.src ?? "");
      return {
        ...element,
        src: (await toDataUrlSafe(src)) || src,
      };
    }),
  );
  return { ...slide, elements };
};

const NewCardsForm = ({ editProduct }: Props) => {
  const slide1 = useSlide1();
  const slide2 = useSlide2();
  const slide3 = useSlide3();
  const slide4 = useSlide4();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as any) || {};
  const { id, product, formData, mode } = navState;

  const isEditMode = Boolean(id) || mode === "edit";
  const toFloat = (v: any) => (v === "" || v == null ? undefined : parseFloat(String(v)));

  const editLayout = useMemo(() => {
    return pickPolygonLayout(
      navState?.polygonlayout,
      navState?.polyganLayout,
      formData?.polygonlayout,
      formData?.polyganLayout,
      product?.polygonlayout,
      product?.polyganLayout
    );
  }, [
    navState?.polygonlayout,
    navState?.polyganLayout,
    formData?.polygonlayout,
    formData?.polyganLayout,
    product?.polygonlayout,
    product?.polyganLayout,
  ]);

  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const {
    data: categories = [],
    isLoading: isLoadingCats,
    isError: isErrorCats,
  } = useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: fetchAllCategoriesFromDB,
    staleTime: 1000 * 60 * 30,
  });

  const cardsRow = useMemo(
    () => categories.find((c) => (c?.name ?? "").trim().toLowerCase() === "cards") || null,
    [categories]
  );

  const categoryOptions = useMemo(() => (cardsRow ? [{ label: "Cards", value: "Cards" }] : []), [cardsRow]);

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
      cardcategory: "Cards",
      subCategory: "",
      subSubCategory: "",
      sku: "",

      // ✅ NEW default
      accessPlan: "free",

      actualprice: "",
      a4price: "",
      a5price: "",
      usletter: "",
      ustabloid: "",
      saleprice: "",
      salea4price: "",
      salea5price: "",
      saleusletter: "",
      saleustabloid: "",
      description: "",
      polygon_shape: "",
    },
  });

  const normalizedEdit = useMemo(() => {
    const src = editProduct ?? {};
    const fd = formData ?? product ?? {};
    const pricingSource = pickLayoutCandidate(
      (src as any).polygonlayout,
      (src as any).polyganLayout,
      (fd as any).polygonlayout,
      (fd as any).polyganLayout,
      editLayout
    );
    const { pricing: layoutPricing, salePricing: layoutSalePricing } = parseLayoutPricing(
      pricingSource
    );

    const accessPlan =
      (src.accessPlan ??
        (src as any).accessplan ??
        (fd as any).accessPlan ??
        (fd as any).accessplan ??
        "free") as AccessPlan;

    return {
      cardname: (src.cardname ?? src.cardName ?? fd.cardname ?? fd.cardName ?? "") as string,
      cardcategory: "Cards",
      sku: (src.sku ?? fd.sku ?? "") as string,

      // ✅ NEW
      accessPlan,

      actualprice: (src.actualprice ?? src.actualPrice ?? fd.actualprice ?? fd.actualPrice ?? "") as any,
      a4price: (src.a4price ?? fd.a4price ?? src.actualprice ?? src.actualPrice ?? fd.actualprice ?? fd.actualPrice ?? "") as any,
      a5price: (src.a5price ?? fd.a5price ?? src.actualprice ?? src.actualPrice ?? fd.actualprice ?? fd.actualPrice ?? "") as any,
      usletter: (src.usletter ?? fd.usletter ?? src.actualprice ?? src.actualPrice ?? fd.actualprice ?? fd.actualPrice ?? "") as any,
      ustabloid: (src.ustabloid ??
        fd.ustabloid ??
        layoutPricing?.US_TABLOID ??
        layoutPricing?.us_tabloid ??
        layoutPricing?.ustabloid ??
        "") as any,
      saleprice: (src.saleprice ?? src.salePrice ?? fd.saleprice ?? fd.salePrice ?? "") as any,
      salea4price: (src.salea4price ?? fd.salea4price ?? "") as any,
      salea5price: (src.salea5price ?? fd.salea5price ?? "") as any,
      saleusletter: (src.saleusletter ?? fd.saleusletter ?? "") as any,
      saleustabloid: (src.saleustabloid ??
        fd.saleustabloid ??
        layoutSalePricing?.US_TABLOID ??
        layoutSalePricing?.us_tabloid ??
        layoutSalePricing?.ustabloid ??
        "") as any,
      description: (src.description ?? fd.description ?? "") as string,
      polygon_shape: (src.polygon_shape ?? (fd as any).polygon_shape ?? "") as string,
      subCategory: (src.subCategory ?? (src as any).subcategory ?? fd.subCategory ?? (fd as any).subcategory ?? "") as string,
      subSubCategory: (src.subSubCategory ?? (src as any).sub_subcategory ?? fd.subSubCategory ?? (fd as any).sub_subcategory ?? "") as string,
    } as any;
  }, [editProduct, formData, product, editLayout]);

  const existingThumbnail = useMemo(() => {
    const src = editProduct ?? {};
    const fd = formData ?? product ?? {};
    const picked = pickLayoutCandidate(
      (src as any).imageurl,
      (src as any).imageUrl,
      (src as any).image_url,
      (src as any).img_url,
      (src as any).lastpageimageurl,
      (src as any).lastpageImageUrl,
      (fd as any).imageurl,
      (fd as any).imageUrl,
      (fd as any).image_url,
      (fd as any).img_url,
      (fd as any).lastpageimageurl,
      (fd as any).lastpageImageUrl,
      (navState as any)?.imageurl,
      (navState as any)?.imageUrl,
      (navState as any)?.image_url,
      (navState as any)?.img_url,
      (navState as any)?.lastpageimageurl,
      (navState as any)?.lastpageImageUrl
    );
    const v = typeof picked === "string" ? picked.trim() : "";
    return v || null;
  }, [editProduct, formData, product, navState]);

  useEffect(() => {
    reset(normalizedEdit);
  }, [normalizedEdit, reset]);

  useEffect(() => {
    if (cardsRow) setValue("cardcategory", "Cards", { shouldValidate: true });
  }, [cardsRow, setValue]);

  const selectedSubCategory = watch("subCategory");

  const subCategoryOptions = useMemo(() => {
    if (!cardsRow) return [];
    return (cardsRow.subcategories ?? []).map((sub) => ({ label: sub, value: sub }));
  }, [cardsRow]);

  const subSubCategoryOptions = useMemo(() => {
    if (!cardsRow || !selectedSubCategory) return [];
    const list = cardsRow.sub_subcategories?.[selectedSubCategory] ?? [];
    return list.map((name) => ({ label: name, value: name }));
  }, [cardsRow, selectedSubCategory]);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewRatio = useMemo(() => {
    const rect = (slide1 as any)?.bgRect1;
    const w = Number(rect?.width ?? 0);
    const h = Number(rect?.height ?? 0);
    if (w > 0 && h > 0) return w / h;
    return 5 / 7;
  }, [(slide1 as any)?.bgRect1?.width, (slide1 as any)?.bgRect1?.height]);

  const previewBounds = useMemo(() => {
    if (isMdUp) return { maxW: 500, maxH: 700 };
    if (isSmUp) return { maxW: 500, maxH: 700 };
    return { maxW: 360, maxH: 480 };
  }, [isMdUp, isSmUp]);

  const previewSize = useMemo(() => {
    const ratio = previewRatio > 0 ? previewRatio : 5 / 7;
    const { maxW, maxH } = previewBounds;
    const byWidth = maxW / ratio <= maxH;
    const width = byWidth ? maxW : maxH * ratio;
    const height = byWidth ? maxW / ratio : maxH;
    return { width, height };
  }, [previewRatio, previewBounds]);

  useEffect(() => {
    if (isEditMode) {
      if (editLayout) {
        applyPolygonLayoutToContexts(editLayout, slide1, slide2, slide3, slide4);
      }
      return;
    }
    // slide1?.resetSlide1State?.();
    // slide2?.resetSlide2State?.();
    // slide3?.resetSlide3State?.();
    // slide4?.resetSlide4State?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editLayout]);

  useEffect(() => {
    // New product must always start clean (no carry-over from previous product/session).
    if (isEditMode) return;
    if (editLayout) return;
    slide1.resetSlide1State?.();
    slide2.resetSlide2State?.();
    slide3.resetSlide3State?.();
    slide4.resetSlide4State?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editLayout]);

  const handleEditLayout = async () => {
    if (editLoading) return;
    setEditLoading(true);

    const formSnapshot = getValues();
    const layoutNow = buildPolygonLayout(slide1, slide2, slide3, slide4);
    const designToSend = pickPolygonLayout(layoutNow, editLayout) ?? null;

    setEditLoading(false);

    navigate(ADMINS_DASHBOARD.ADMIN_EDITOR, {
      state: {
        mode: id ? "edit" : "create",
        id,
        design: designToSend,
        formData: formSnapshot,
      },
    });
  };

  const onSubmit = async (data: FormValue) => {
    try {
      setLoading(true);

      const layoutNow = buildPolygonLayout(slide1, slide2, slide3, slide4, { onlySelectedImages: true });
      const baseLayout = pickPolygonLayout(layoutNow, editLayout) ?? {};
      const layoutObj = typeof baseLayout === "object" && baseLayout !== null ? baseLayout : {};
      const { pricing: existingPricing, salePricing: existingSalePricing } = parseLayoutPricing(
        layoutObj
      );
      const existingTabloid =
        (existingPricing as any)?.US_TABLOID ??
        (existingPricing as any)?.us_tabloid ??
        (existingPricing as any)?.ustabloid ??
        "";
      const existingSaleTabloid =
        (existingSalePricing as any)?.US_TABLOID ??
        (existingSalePricing as any)?.us_tabloid ??
        (existingSalePricing as any)?.ustabloid ??
        "";
      const resolvedTabloid =
        data.ustabloid === "" || data.ustabloid == null ? existingTabloid : data.ustabloid;
      const resolvedSaleTabloid =
        data.saleustabloid === "" || data.saleustabloid == null
          ? existingSaleTabloid
          : data.saleustabloid;
      const polygonlayout = {
        ...(layoutObj as any),
        pricing: {
          ...(existingPricing ?? {}),
          US_TABLOID: resolvedTabloid ?? "",
        },
        salePricing: {
          ...(existingSalePricing ?? {}),
          US_TABLOID: resolvedSaleTabloid ?? "",
        },
      };

      const captureWidth = Math.max(1, Math.round(previewSize.width));
      const captureHeight = Math.max(1, Math.round(previewSize.height));
      let canvasCaptureHadPartialAssets = false;

      const captureThumbnailFromCanvasRenderer = async (): Promise<string | null> => {
        try {
          const payloadSlide1 = (polygonlayout as any)?.slides?.slide1 as SlidePayloadV2 | undefined;
          if (!payloadSlide1) return null;

          let templateSlide = mapPolygonSlideToTemplateSlide(1, payloadSlide1, captureWidth, captureHeight);
          const fonts = collectTemplateSlideFonts([templateSlide]);
          if (fonts.length) {
            const urls = buildGoogleFontsUrls(fonts);
            loadGoogleFontsOnce(urls);
            await ensureGoogleFontsLoaded(urls);
          }
          if ((document as any)?.fonts?.ready) {
            try {
              await (document as any).fonts.ready;
            } catch {}
          }

          templateSlide = await prepareTemplateSlideForCanvas(templateSlide);
          const rendered = await renderTemplateSlideToCanvasWithStats(templateSlide, {
            width: captureWidth,
            height: captureHeight,
            pixelRatio: 2.25,
            backgroundColor: "#ffffff",
          });

          // Match subscription safeguard: never save a partial bitmap.
          if (rendered.expectedAssets > 0 && rendered.drawnAssets < rendered.expectedAssets) {
            canvasCaptureHadPartialAssets = true;
            return null;
          }

          try {
            const png = rendered.canvas.toDataURL("image/png");
            return png.startsWith("data:image/") ? png : null;
          } catch {
            return null;
          }
        } catch {
          return null;
        }
      };

      let capturedImageurl: string | null = await captureThumbnailFromCanvasRenderer();
      if (
        (!capturedImageurl || !(await isReasonableThumbnail(capturedImageurl))) &&
        !canvasCaptureHadPartialAssets &&
        previewRef.current
      ) {
        try {
          capturedImageurl = await captureNodeToPng(previewRef.current, "#ffffff", {
            width: captureWidth,
            height: captureHeight,
          });
        } catch {
          capturedImageurl = null;
        }
      }
      if (capturedImageurl && !(await isReasonableThumbnail(capturedImageurl))) {
        capturedImageurl = null;
      }

      const finalImageurl =
        (typeof capturedImageurl === "string" && capturedImageurl.startsWith("data:image/"))
          ? capturedImageurl
          : (id ? existingThumbnail : null);

      const payload = {
        cardname: data.cardname,
        cardcategory: "Cards",
        sku: String(data.sku),
        description: data.description,
        subCategory: data.subCategory ?? null,
        subSubCategory: data.subSubCategory ?? null,
        polygon_shape: "",
        polygonlayout,
        lastmessage: "",
        ...(finalImageurl ? { imageurl: finalImageurl } : id ? {} : { imageurl: null }),
        ...(id ? {} : { lastpageimageurl: null }),

        // ✅ NEW (DB column: accessplan)
        accessplan: data.accessPlan,

        actualprice: data.actualprice,
        a4price: data.a4price,
        a5price: data.a5price,
        usletter: data.usletter,
        saleprice: data.saleprice,
        salea4price: data.salea4price,
        salea5price: data.salea5price,
        saleusletter: data.saleusletter,
      };

      if (payload.actualprice == null) throw new Error("Actual Price is required");

      if (finalImageurl) {
        // Keep both legacy/current thumbnail columns aligned so list pages never
        // fall back to stale Safari-distorted snapshots.
        (payload as any).imageurl = finalImageurl;
        (payload as any).lastpageimageurl = finalImageurl;
      } else if (!id) {
        (payload as any).imageurl = null;
        (payload as any).lastpageimageurl = null;
      }

      const payloadWithTabloid = {
        ...payload,
        ustabloid: data.ustabloid ?? null,
        saleustabloid: data.saleustabloid ?? null,
      };

      const isMissingColumnError = (err: any) => {
        const msg = String(err?.message ?? "");
        return (
          msg.toLowerCase().includes("column") &&
          (msg.toLowerCase().includes("ustabloid") || msg.toLowerCase().includes("saleustabloid"))
        );
      };

      if (id) {
        let { error } = await supabase.from("cards").update(payloadWithTabloid).eq("id", id);
        if (error && isMissingColumnError(error)) {
          ({ error } = await supabase.from("cards").update(payload).eq("id", id));
        }
        if (error) throw error;
        toast.success("Card updated successfully!");
      } else {
        let { error } = await supabase.from("cards").insert([payloadWithTabloid]);
        if (error && isMissingColumnError(error)) {
          ({ error } = await supabase.from("cards").insert([payload]));
        }
        if (error) throw error;
        toast.success("Card saved successfully!");
      }

      if (!id) {
        reset();
        slide1.resetSlide1State?.();
        slide2.resetSlide2State?.();
        slide3.resetSlide3State?.();
        slide4.resetSlide4State?.();
      }
    } catch (err: any) {
      toast.error("Failed to save card: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: { md: "flex", sm: "block", xs: "block" },
          gap: "20px",
          justifyContent: "center",
          alignItems: { md: "center", sm: "stretch", xs: "stretch" },
          width: "100%",
          height: "auto",
          overflow: "hidden",
          mt: 2,
        }}
      >
        {/* Left — Preview (Slide-1 ONLY) */}
        <Box
          ref={previewRef}
          sx={{
            width: previewSize.width,
            height: previewSize.height,
            maxWidth: "100%",
            position: "relative",
            overflow: "hidden",
            borderRadius: "12px",
            boxShadow: "3px 5px 8px rgba(0,0,0,0.25)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <Slide1PreviewBox width={previewSize.width} height={previewSize.height} scale={1} />
        </Box>

        {/* Right — Form */}
        <Box
          component="form"
          sx={{
            width: { md: "500px", sm: "100%", xs: "100%" },
            maxWidth: "100%",
            mt: { md: 0, sm: 0, xs: 3 },
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <CustomInput
            label="Card Name"
            placeholder="Enter your card name"
            defaultValue=""
            register={register("cardname", { required: "Card Name is required" })}
            error={errors.cardname?.message}
          />


          <Controller
            name="cardcategory"
            control={control}
            render={({ field }) => (
              <CustomInput
                label="Card Category"
                type="select"
                placeholder={isLoadingCats ? "Loading categories..." : isErrorCats ? "Failed to load categories" : "Cards"}
                value={field.value || "Cards"}
                onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                error={errors.cardcategory?.message}
                options={categoryOptions}
              />
            )}
          />

          <Controller
            name="subCategory"
            control={control}
            render={({ field }) => (
              <CustomInput
                label="Sub Category"
                type="select"
                placeholder={subCategoryOptions.length === 0 ? "No sub categories" : "Select sub category (optional)"}
                value={field.value ?? ""}
                onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                error={errors.subCategory?.message}
                options={subCategoryOptions}
              />
            )}
          />

          <Controller
            name="subSubCategory"
            control={control}
            render={({ field }) => (
              <CustomInput
                label="Sub Sub Category"
                type="select"
                placeholder={
                  !watch("subCategory")
                    ? "Select sub category first (optional)"
                    : subSubCategoryOptions.length === 0
                      ? "No sub-sub categories"
                      : "Select sub-sub category (optional)"
                }
                value={field.value ?? ""}
                onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                error={errors.subSubCategory?.message}
                options={subSubCategoryOptions}
              />
            )}
          />

          <CustomInput
            label="SKU"
            placeholder="Enter your SKU"
            defaultValue=""
            register={register("sku", { required: "SKU is required" })}
            error={errors.sku?.message}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(5, minmax(0, 1fr))",
              },
              gap: 1,
              alignItems: "start",
            }}
          >
            <CustomInput
              label="Actual Price"
              placeholder="Actual price"
              defaultValue=""
              type="number"
              register={register("actualprice", { required: "Actual Price is required", setValueAs: toFloat })}
              error={errors.actualprice?.message}
            />
            <CustomInput
              label="A4 Price"
              placeholder="A4 price"
              defaultValue=""
              type="number"
              register={register("a4price", { required: "A4 Price is required", setValueAs: toFloat })}
              error={errors.a4price?.message}
            />
            <CustomInput
              label="A3 Price"
              placeholder="A3 price"
              defaultValue=""
              type="number"
              register={register("a5price", { required: "A3 Price is required", setValueAs: toFloat })}
              error={errors.a5price?.message}
            />
            <CustomInput
              label="US Letter"
              placeholder="US Letter"
              defaultValue=""
              type="number"
              register={register("usletter", { required: "US Letter Price is required", setValueAs: toFloat })}
              error={errors.usletter?.message}
            />
            <CustomInput
              label="US Tabloid"
              placeholder="US Tabloid"
              defaultValue=""
              type="number"
              register={register("ustabloid", { setValueAs: toFloat })}
              error={errors.ustabloid?.message}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(5, minmax(0, 1fr))",
              },
              gap: 1,
              alignItems: "start",
            }}
          >
            <CustomInput
              label="Sale Price"
              placeholder="Sale price"
              type="number"
              defaultValue=""
              register={register("saleprice", { setValueAs: toFloat })}
              error={errors.saleprice?.message}
            />
            <CustomInput
              label="Sale A4 Price"
              placeholder="A4 Price"
              type="number"
              defaultValue=""
              register={register("salea4price", { setValueAs: toFloat })}
              error={errors.salea4price?.message}
            />
            <CustomInput
              label="Sale A3 Price"
              placeholder="A3 Price"
              type="number"
              defaultValue=""
              register={register("salea5price", { setValueAs: toFloat })}
              error={errors.salea5price?.message}
            />
            <CustomInput
              label="Sale US Letter"
              placeholder="US Letter"
              type="number"
              defaultValue=""
              register={register("saleusletter", { setValueAs: toFloat })}
              error={errors.saleusletter?.message}
            />
            <CustomInput
              label="Sale US Tabloid"
              placeholder="US Tabloid"
              type="number"
              defaultValue=""
              register={register("saleustabloid", { setValueAs: toFloat })}
              error={errors.saleustabloid?.message}
            />
          </Box>

          <CustomInput
            label="Card description"
            placeholder="Enter your description"
            defaultValue=""
            register={register("description", { required: "Description is required" })}
            error={errors.description?.message}
            multiline
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "stretch", sm: "space-between" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mt: 2,
            }}
          >
            <LandingButton
              title={isEditMode ? "Update Layout" : "Edit Layout"}
              personal
              width="200px"
              onClick={handleEditLayout}
              loading={editLoading}
            />
            <LandingButton
              title={isEditMode ? "Update & Publish" : "Save & Publish"}
              personal
              variant="outlined"
              width="250px"
              type="submit"
              loading={loading}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NewCardsForm;
