import { Box, Container, Grid, Typography, Chip, Button, LinearProgress } from "@mui/material";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import TableBgImg from "/assets/images/table.png";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { CardGiftcard, EmojiEvents } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { type SizeKey } from "../../../stores/cartStore";
import { getMockupConfig } from "../../../lib/mockup";
import { toJpeg, toPng } from "html-to-image";
import {
  buildTenUpSlides,
  buildTwoUpSlides,
  buildFixedGridSlides,
  isBusinessCardPrintSize,
  isBusinessCardsCategory,
  isBusinessLeafletsCategory,
  isCandlesCategory,
  isCoastersCategory,
  isNotebooksCategory,
  isMirrorPrintCategory,
  mirrorSlides,
  isCardsCategory,
  isLeafletTwoUpSize,
  isNotebookTwoUpSize,
  isParallelCardSize,
  getLeafletTwoUpPageMm,
  getNotebookTwoUpPageMm,
  getPageMmForSize,
  isInviteTwoUpSize,
  getInviteTwoUpPageMm,
  isMugWrapSize,
  getMugWrapPageMm,
} from "../../../lib/pdfTwoUp";
import { supabase } from "../../../supabase/supabase";
import { USER_ROUTES } from "../../../constant/route";
import MainLayout from "../../../layout/MainLayout";
import { COLORS } from "../../../constant/color";
import { removeWhiteBg } from "../../../lib/lib";
import {
  loadSlidesFromIdb,
  loadSlidesFromIdbByKey,
  saveSlidesToIdb,
  saveSlidesToIdbByKey,
} from "../../../lib/idbSlides";
import {
  loadSlidesFromScopes,
  resolveSlidesScopeCandidates,
  saveSlidesToScopes,
} from "../../../lib/slidesScope";
import { API_BASE } from "../../../lib/apiBase";
import {
  buildGoogleFontsUrls,
  ensureGoogleFontsLoaded,
  getGoogleFontEmbedCss,
  loadGoogleFontsOnce,
} from "../../../constant/googleFonts";
import {
  getIosMajorVersion,
  isIosTouchDevice,
  isWebKitBrowser,
} from "../../../lib/platform";
import { renderTemplateSlideToCanvasWithStats } from "../../../lib/templateSlideCanvas";
import {
  readSubscriptionPreviewPayload,
  saveSubscriptionPreviewPayload,
} from "../../../lib/subscriptionPreview";
import Slide1 from "../Preview/component/Slide1/Slide1";
import Slide2 from "../Preview/component/Slide2/Slide2";
import Slide3 from "../Preview/component/Slide3/Slide3";
import Slide4 from "../Preview/component/Slide4/Slide4";

// ------------------ ENV ------------------
const STRIPE_PK =
  import.meta.env.VITE_STRIPE_PK ||
  "pk_test_51S5Pnw6w4VLajVLTFff76bJmNdN9UKKAZ2GKrXL41ZHlqaMxjXBjlCEly60J69hr3noxGXv6XL2Rj4Gp4yfPCjAy00j41t6ReK";
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : Promise.resolve(null);
const PREPARED_SLIDES_PREFIX = "prepared:v6:";
const CARD_MOCKUP_PREVIEW_STORAGE_PREFIX = "subscription:card:mockup-preview";
const DURABLE_CHECKOUT_SOURCE_PREFIX = "checkout:design:source:v1:";

// ------------------ Types ------------------
type SelectedVariant = {
  key: SizeKey;
  title: string;
  price: number;
  isOnSale?: boolean;
  category?: string;
};

type SelectedProduct = {
  id?: string | number;
  type?: "card" | "template";
  title?: string;
  category?: string;
  img?: string;
  accessplan?: string;
  accessPlan?: string;
};

type RawSlide = { id: number; label?: string; elements: any[]; bgColor?: string | null };
type PreviewConfig = { mmWidth?: number; mmHeight?: number };

type PriceTables = { actual: any; sale: any };
type SizeDef = { key: any; title: string; sub?: string };

type UserPlan = {
  plan_code: "free" | "bundle" | "pro" | string;
  isPremium: boolean;
  premium_expires_at: string | null;
  email?: string | null;
};

const LEGACY_CARD_CAPTURE = { w: 500, h: 700 };
const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

const lc = (s: unknown) => (s == null ? "" : String(s).trim().toLowerCase());

const parseAspectRatio = (ratio?: string | null) => {
  const raw = String(ratio ?? "").trim();
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  return { width, height };
};

const aspectRatioToPadding = (ratio?: string | null) => {
  const parsed = parseAspectRatio(ratio);
  if (!parsed) return undefined;
  return `${(parsed.height / parsed.width) * 100}%`;
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

const toDataUrlSafe = async (src: string): Promise<string> => {
  if (!src || src.startsWith("data:")) return src;
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

const withTimeout = async <T,>(
  task: Promise<T>,
  timeoutMs: number,
  fallback: T,
): Promise<T> =>
  await new Promise<T>((resolve) => {
    let settled = false;
    const finish = (value: T) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(fallback), timeoutMs);
    task.then(finish).catch(() => finish(fallback));
  });

const readSelectedProductSnapshot = (): SelectedProduct | null => {
  try {
    const raw = JSON.parse(localStorage.getItem("selectedProduct") || "null");
    return raw && typeof raw === "object" ? (raw as SelectedProduct) : null;
  } catch {
    return null;
  }
};

const hasMatchingTemplatePreviewSession = (options?: {
  previewKey?: string | null;
  productId?: string | number | null;
}) => {
  try {
    const storedKey = String(sessionStorage.getItem("templ_preview_key") || "").trim();
    if (!storedKey) return false;

    const expectedKey = String(options?.previewKey ?? "").trim();
    if (expectedKey) return storedKey === expectedKey;

    const productId = String(options?.productId ?? "").trim();
    if (productId) return storedKey.startsWith(`${productId}::`);

    return false;
  } catch {
    return false;
  }
};

const readInitialRawSlides = (options?: {
  previewKey?: string | null;
  productId?: string | number | null;
}): RawSlide[] => {
  if (!hasMatchingTemplatePreviewSession(options)) return [];
  try {
    const cachedSlides = (globalThis as any).__rawSlidesCache;
    if (Array.isArray(cachedSlides) && cachedSlides.length) {
      return cachedSlides as RawSlide[];
    }
  } catch {}

  try {
    const storedSlides = sessionStorage.getItem("templ_preview_slides");
    if (!storedSlides) return [];
    const parsed = JSON.parse(storedSlides);
    return Array.isArray(parsed) ? (parsed as RawSlide[]) : [];
  } catch {
    return [];
  }
};

const readInitialPreviewConfig = (options?: {
  previewKey?: string | null;
  productId?: string | number | null;
}): PreviewConfig | null => {
  if (!hasMatchingTemplatePreviewSession(options)) return null;
  try {
    const cachedCfg = (globalThis as any).__previewConfigCache;
    if (cachedCfg && typeof cachedCfg === "object") {
      return cachedCfg as PreviewConfig;
    }
  } catch {}

  try {
    const storedCfg = sessionStorage.getItem("templ_preview_config");
    return storedCfg ? (JSON.parse(storedCfg) as PreviewConfig) : null;
  } catch {
    return null;
  }
};

const resolveSubscriptionPreviewKey = (previewKey?: string | null) => {
  const explicitKey = String(previewKey ?? "").trim();
  if (explicitKey) return explicitKey;
  try {
    return String(sessionStorage.getItem("templ_preview_key") || "").trim();
  } catch {
    return "";
  }
};

const singularizeCategory = (name?: string) => {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower.endsWith("ss")) return trimmed;
  if (lower.endsWith("s")) return trimmed.slice(0, -1);
  return trimmed;
};

const buildPdfFileName = (category?: string, ext: "pdf" | "png" = "pdf") => {
  const label = singularizeCategory(category) || "design";
  const clean = label
    .replace(/[^a-z0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return `personalised ${clean || "design"} ${ext}`;
};

const toTitleCase = (value?: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const buildEmailSubject = (category?: string) => {
  const label = toTitleCase(String(category ?? "").trim() || "PNG");
  return `Your personalised ${label} file(s) are attached.`;
};

const getItemAccessPlan = (p: any): "free" | "bundle" | "pro" => {
  const v = lc(p?.accessplan ?? p?.accessPlan ?? p?.plan ?? p?.plan_code ?? p?.code);
  if (v === "pro" || v === "premium") return "pro";
  if (v === "bundle") return "bundle";
  return "free";
};

const normalizeItemType = (type?: string) => {
  if (!type) return "";
  const t = type.toLowerCase().trim();
  if (t === "templet") return "template";
  if (t === "templates") return "template";
  if (t === "cards") return "card";
  return t;
};

const normalizeFontFamily = (value?: string | null) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const quoted = raw.match(/['"]([^'"]+)['"]/);
  if (quoted?.[1]) return quoted[1].trim();
  const first = raw.split(",")[0]?.trim() ?? "";
  return first.replace(/^['"]|['"]$/g, "").trim();
};

const resolveTextFontFamily = (entry: any) =>
  normalizeFontFamily(
    entry?.fontFamily ??
      entry?.font_family ??
      entry?.["font-family"] ??
      entry?.fontFamily1 ??
      entry?.fontFamily2 ??
      entry?.fontFamily3 ??
      entry?.fontFamily4 ??
      entry?.style?.fontFamily ??
      entry?.style?.font_family ??
      entry?.style?.["font-family"] ??
      "",
  );

const firstDefinedValue = (...values: any[]) => {
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

const resolveTextWeight = (entry: any): string | number => {
  const raw = firstDefinedValue(
    entry?.fontWeight,
    entry?.font_weight,
    entry?.["font-weight"],
    entry?.style?.fontWeight,
    entry?.style?.font_weight,
    entry?.style?.["font-weight"],
  );
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return entry?.bold ? 700 : 400;
    const weight = Number(trimmed);
    if (Number.isFinite(weight) && weight > 0) return weight;
    return trimmed;
  }
  return entry?.bold ? 700 : 400;
};

const resolveTextStyle = (entry: any): string => {
  const raw = firstDefinedValue(
    entry?.fontStyle,
    entry?.font_style,
    entry?.["font-style"],
    entry?.style?.fontStyle,
    entry?.style?.font_style,
    entry?.style?.["font-style"],
  );
  if (typeof raw === "string") return raw.trim() || (entry?.italic ? "italic" : "normal");
  return entry?.italic ? "italic" : "normal";
};

const resolveTextDecoration = (entry: any): string => {
  const raw = firstDefinedValue(
    entry?.textDecoration,
    entry?.text_decoration,
    entry?.["text-decoration"],
    entry?.style?.textDecoration,
    entry?.style?.text_decoration,
    entry?.style?.["text-decoration"],
  );
  if (typeof raw === "string") return raw.trim() || "none";
  if (entry?.underline) return "underline";
  return "none";
};

const resolveTextColor = (entry: any): string =>
  String(firstDefinedValue(entry?.color, entry?.fill, entry?.style?.color, entry?.style?.fill, "#111111"));

const resolveTextRotation = (entry: any): number =>
  toNum(firstDefinedValue(entry?.rotation, entry?.rotate, entry?.style?.rotation, entry?.style?.rotate, 0), 0);

const resolveTextCurve = (entry: any): number =>
  toNum(firstDefinedValue(entry?.curve, entry?.arc, entry?.style?.curve, entry?.style?.arc, 0), 0);

const collectFontsFromRawSlides = (slides: RawSlide[]) => {
  const fonts = new Set<string>();
  (slides ?? []).forEach((sl) => {
    (sl?.elements ?? []).forEach((el: any) => {
      if (String(el?.type ?? "").toLowerCase() !== "text") return;
      const fam = resolveTextFontFamily(el);
      if (!fam) return;
      const lower = fam.toLowerCase();
      if (["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"].includes(lower)) return;
      fonts.add(fam);
    });
  });
  return Array.from(fonts);
};

const GENERIC_FONT_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
]);

const collectFontsFromNode = (node: HTMLElement | null) => {
  if (!node) return [];
  const fonts = new Set<string>();
  const walk = (el: HTMLElement) => {
    const fontFamily = getComputedStyle(el).fontFamily || "";
    fontFamily.split(",").forEach((value) => {
      const family = normalizeFontFamily(value);
      if (!family || GENERIC_FONT_FAMILIES.has(family.toLowerCase())) return;
      fonts.add(family);
    });
    Array.from(el.children).forEach((child) => {
      if (child instanceof HTMLElement) walk(child);
    });
  };
  walk(node);
  return Array.from(fonts);
};

export const isProductInBundle = (
  product: { id?: string | number; type?: string } | null,
  bundleKeySet: Set<string>
): boolean => {
  if (!product?.id || !product?.type) return false;
  const normalizedType = normalizeItemType(product.type);
  const key = `${normalizedType}:${String(product.id).trim()}`;
  return bundleKeySet.has(key);
};

// ------------------ EXACT Size Config (same as ProductPopup) ------------------
const getSizeDefsForCategory = (categoryName?: string): SizeDef[] => {
  const name = (categoryName ?? "").trim().toLowerCase();

  if (name.includes("invite")) {
    return [
      { key: "a5", title: "A5", sub: "Prints 2 invites per A4 sheet" },
      { key: "a4", title: "A4", sub: "Prints 1 invite per A4 sheet" },
      { key: "half_us_letter", title: "Half US Letter", sub: "Prints 2 invites per US Letter sheet" },
      { key: "us_letter", title: "US Letter", sub: "Prints 1 invite per US Letter sheet" },
    ];
  }

  if (name.includes("business card")) {
    return [
      { key: "a4", title: "A4" },
      { key: "us_letter", title: "US Letter" },
    ];
  }

  if (name.includes("business leaflet")) {
    return [
      { key: "a5", title: "A5", sub: "Prints 2 per A4 sheet" },
      { key: "a4", title: "A4", sub: "Prints 1 per A4 sheet" },
      { key: "half_us_letter", title: "Half US Letter", sub: "Prints 2 per US Letter sheet" },
      { key: "us_letter", title: "US Letter", sub: "Prints 1 per US Letter sheet" },
    ];
  }

  if (name.includes("candle")) {
    return [
      { key: "a4", title: "A4", sub: "6 labels per A4 sheet (70mm × 70mm)" },
      { key: "us_tabloid", title: "US Tabloid", sub: "6 labels per sheet (70mm × 70mm)" },
    ];
  }

  if (
    name.includes("clothing") ||
    name.includes("sticker") ||
    name.includes("wall art") ||
    name.includes("photo art") ||
    name.includes("bag")
  ) {
    return [
      { key: "a4", title: "A4" },
      { key: "a3", title: "A3" },
      { key: "us_letter", title: "US Letter" },
      { key: "us_tabloid", title: "US Tabloid (11 × 17 in)" },
    ];
  }

  if (name.includes("notebook")) {
    return [
      { key: "a5", title: "A5", sub: "Prints 2 per A4 landscape sheet" },
      { key: "a4", title: "A4", sub: "Prints 1 per A4 portrait sheet" },
      { key: "half_us_letter", title: "Half US Letter", sub: "Prints 2 per US Letter landscape sheet" },
      { key: "us_letter", title: "US Letter", sub: "Prints 1 per US Letter portrait sheet" },
    ];
  }

  if (name.includes("mug")) return [{ key: "mug_wrap_11oz", title: "228mm × 88.9mm wrap (11oz mug)" }];
  if (name.includes("coaster"))
    return [{ key: "coaster_95", title: "89mm × 89mm (2 per sheet: 1 × 2)" }];

  return [
    { key: "a5", title: "A3" },
    { key: "a4", title: "A4" },
    // { key: "half_us_letter", title: "Half US Letter" },
    { key: "us_letter", title: "US Letter" },
    { key: "us_tabloid", title: "US Tabloid (11 × 17 in)" },
  ];
};

// ------------------ UI ------------------
const isActivePay = {
  display: "flex",
  gap: "4px",
  justifyContent: "space-between",
  alignItems: "center",
  bgcolor: COLORS.seconday,
  p: "3px",
  borderRadius: 2,
  boxShadow: "3px 7px 8px #eff1f1ff",
};

// ------------------ Helpers ------------------
const toNum = (v: unknown, fallback = 0) => {
  if (v == null) return fallback;
  const s = String(v).trim();
  if (!s) return fallback;
  if (s.toUpperCase() === "EMPTY") return fallback;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

const toPercent = (v?: string) => {
  const n = Number(String(v ?? "").replace("%", "").trim());
  return Number.isFinite(n) ? n : 0;
};

const getValidSlides = (slides?: Record<string, any> | null) =>
  Object.fromEntries(
    Object.entries(slides ?? {}).filter(
      ([, value]) => typeof value === "string" && value.startsWith("data:image/"),
    ),
  ) as Record<string, string>;

const isDataImageUrl = (value?: string | null) =>
  typeof value === "string" && value.startsWith("data:image/");

const buildCardMockupPreviewStorageKey = (options?: {
  productId?: string | number | null;
  previewKey?: string | null;
  category?: string | null;
}) => {
  const productId = String(options?.productId ?? "").trim() || "unknown-product";
  const previewKey = String(options?.previewKey ?? "").trim();
  const category = lc(options?.category) || "cards";
  return `${CARD_MOCKUP_PREVIEW_STORAGE_PREFIX}:${productId}:${previewKey || category}`;
};

const readStoredCardMockupPreviewSrc = (key?: string | null) => {
  const storageKey = key || buildCardMockupPreviewStorageKey();
  try {
    const fromSession = sessionStorage.getItem(storageKey);
    if (isDataImageUrl(fromSession)) return fromSession || "";
  } catch {}

  try {
    const fromLocal = localStorage.getItem(storageKey);
    if (isDataImageUrl(fromLocal)) return fromLocal || "";
  } catch {}

  return "";
};

const writeStoredCardMockupPreviewSrc = (key: string, src: string) => {
  if (!isDataImageUrl(src)) return;
  try {
    sessionStorage.setItem(key, src);
  } catch {}
  try {
    localStorage.setItem(key, src);
  } catch {}
};

const compressPreviewDataUrl = (
  src: string,
  opts: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
) =>
  new Promise<string>((resolve) => {
    if (!isDataImageUrl(src) || typeof Image === "undefined" || typeof document === "undefined") {
      resolve(src);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const maxWidth = Math.max(1, opts.maxWidth ?? 1000);
        const maxHeight = Math.max(1, opts.maxHeight ?? 1400);
        const naturalWidth = img.naturalWidth || img.width || 1;
        const naturalHeight = img.naturalHeight || img.height || 1;
        const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
        const width = Math.max(1, Math.round(naturalWidth * scale));
        const height = Math.max(1, Math.round(naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", opts.quality ?? 0.82));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

const normalizeRawSlides = (value: any): RawSlide[] =>
  Array.isArray(value)
    ? value.filter((sl) => sl && typeof sl === "object" && Array.isArray((sl as any).elements))
    : [];

const hasRenderableRawSlideContent = (slide?: RawSlide | null) => {
  if (!slide) return false;
  const bg = String(slide.bgColor ?? "").trim().toLowerCase();
  if (bg && bg !== "transparent" && bg !== "#fff" && bg !== "#ffffff" && bg !== "white") {
    return true;
  }

  return (slide.elements ?? []).some((el: any) => {
    const type = String(el?.type ?? "").toLowerCase();
    const width = toNum(el?.width, 0);
    const height = toNum(el?.height, 0);
    if (type === "text") return String(el?.text ?? "").trim().length > 0;
    if (type === "image" || type === "sticker") {
      return Boolean(String(el?.src ?? "").trim()) && width > 0 && height > 0;
    }
    return false;
  });
};

const firstRenderableRawSlideIndex = (slides: RawSlide[]) => {
  const idx = (slides ?? []).findIndex(hasRenderableRawSlideContent);
  return idx >= 0 ? idx : 0;
};

const pickSlideByNumber = (slides: Record<string, string> | null | undefined, slideNumber: number) => {
  const valid = getValidSlides(slides);
  const preferred = valid[`slide${Math.max(1, slideNumber)}`];
  if (preferred) return preferred;
  return valid.slide1 || Object.values(valid)[0] || "";
};

const readPersistedCardRawSlides = (): RawSlide[] => {
  try {
    const stored = sessionStorage.getItem("card_raw_slides");
    if (!stored) return [];
    return normalizeRawSlides(JSON.parse(stored));
  } catch {
    return [];
  }
};

const reorderCardsPdfSlides = (slides: Record<string, string>) => {
  const s1 = slides.slide1;
  const s2 = slides.slide2;
  const s3 = slides.slide3;
  const s4 = slides.slide4;
  const next: Record<string, string> = {};
  if (s4) next.slide1 = s4;
  if (s1) next.slide2 = s1;
  if (s2) next.slide3 = s2;
  if (s3) next.slide4 = s3;
  return Object.keys(next).length ? next : slides;
};

const buildPreparedSlidesKey = (productKey?: string, category?: string, cardSize?: string) =>
  `${PREPARED_SLIDES_PREFIX}${lc(productKey)}:${lc(category)}:${lc(cardSize)}`;

const waitForNextPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

// Some rows/flows may have uppercase keys, some lowercase. Support both.
const KEY_FALLBACK: Record<string, string> = {
  A5: "a5",
  A4: "a4",
  A3: "a3",
  US_LETTER: "us_letter",
  HALF_US_LETTER: "half_us_letter",
  US_TABLOID: "us_tabloid",
  MUG_WRAP_11OZ: "mug_wrap_11oz",
  COASTER_95: "coaster_95",
};

const readActualPrice = (tables: PriceTables | null, key: any, categoryName?: string) => {
  const actual = tables?.actual ?? {};
  const raw1 = actual?.[key]; // current key
  const raw2 = actual?.[String(key).toUpperCase?.() ?? ""]; // uppercase attempt
  const raw3 = actual?.[KEY_FALLBACK[String(key).toUpperCase()] ?? ""]; // mapped lowercase
  const direct = raw1 ?? raw2 ?? raw3;
  if (direct != null && String(direct).trim() !== "") return toNum(direct, 0);

  if (lc(categoryName).includes("candle")) {
    if (String(key).toLowerCase() === "us_letter") {
      return toNum(actual?.us_tabloid ?? actual?.US_TABLOID, 0);
    }
    if (String(key).toLowerCase() === "us_tabloid") {
      return toNum(actual?.us_letter ?? actual?.US_LETTER, 0);
    }
  }

  return 0;
};

async function getAccessToken() {
  const s1 = await supabase.auth.getSession();
  const t1 = s1.data?.session?.access_token;
  if (t1) return t1;

  const s2 = await supabase.auth.refreshSession();
  return s2.data?.session?.access_token || "";
}

// ✅ bundle_items keys: "card:<id>" or "template:<id>"
async function fetchBundleItemKeySet(): Promise<Set<string>> {
  const { data, error } = await supabase.from("bundle_items").select("item_type,item_id");
  if (error) throw error;

  const keys = new Set<string>();
  (data ?? []).forEach((r: any) => {
    const type = r.item_type === "cards" ? "card" : r.item_type === "templets" ? "template" : r.item_type;
    keys.add(`${type}:${r.item_id}`);
  });

  return keys;
}

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<SizeKey>("a4" as SizeKey);
  const [loading, setLoading] = useState(false);
  const [checkoutProgress, setCheckoutProgress] = useState({
    active: false,
    value: 0,
    label: "",
  });

  const [variant, setVariant] = useState<SelectedVariant | null>(null);
  const [product, setProduct] = useState<SelectedProduct | null>(null);
  const [priceTables, setPriceTables] = useState<PriceTables | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [, setUserPlan] = useState<UserPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const [bundleKeySet, setBundleKeySet] = useState<Set<string>>(new Set());
  const [bundleKeyLoading, setBundleKeyLoading] = useState(false);

  const location: any = useLocation() as { state?: { slides?: Record<string, string>; previewOnly?: boolean } };
  const { state } = location;
  const routeCardRawSlides = useMemo<RawSlide[]>(() => {
    const fromRoute = normalizeRawSlides(state?.cardRawSlides);
    return fromRoute.length ? fromRoute : readPersistedCardRawSlides();
  }, [state?.cardRawSlides]);
  const cardPreviewSlideIndex = useMemo(
    () => firstRenderableRawSlideIndex(routeCardRawSlides),
    [routeCardRawSlides],
  );
  const cardPreviewSlideNumber = cardPreviewSlideIndex + 1;

  const { user, plan } = useAuth();
  const navigate = useNavigate();
  const subscriptionPreviewKey = useMemo(
    () => resolveSubscriptionPreviewKey(state?.previewKey),
    [state?.previewKey],
  );

  const setCheckoutProgressStep = useCallback((value: number, label: string) => {
    setCheckoutProgress({
      active: true,
      value: Math.max(0, Math.min(100, Math.round(value))),
      label,
    });
  }, []);

  const clearCheckoutProgress = useCallback(() => {
    setCheckoutProgress({
      active: false,
      value: 0,
      label: "",
    });
  }, []);

  const selectedProductSnapshot = useMemo(() => readSelectedProductSnapshot(), []);
  const [slidesObj, setSlidesObj] = useState<Record<string, string>>(() => getValidSlides(state?.slides));
  const [subscriptionPreviewSlides, setSubscriptionPreviewSlides] = useState<Record<string, string>>(() =>
    readSubscriptionPreviewPayload(resolveSubscriptionPreviewKey(state?.previewKey) || undefined),
  );
  const checkoutSlidesScopeKeys = useMemo(() => {
    const localCategory = (() => {
      try {
        return localStorage.getItem("selectedCategory") || "";
      } catch {
        return "";
      }
    })();
    const localSize = (() => {
      try {
        return localStorage.getItem("selectedSize") || "";
      } catch {
        return "";
      }
    })();
    const scopedProductKey =
      product?.id && product?.type
        ? `${product.type}:${product.id}`
        : selectedProductSnapshot?.id && selectedProductSnapshot?.type
        ? `${selectedProductSnapshot.type}:${selectedProductSnapshot.id}`
        : "";

    return resolveSlidesScopeCandidates({
      includeStoredDraft: false,
      previewKey: subscriptionPreviewKey,
      productKey: scopedProductKey,
      category: product?.category || selectedProductSnapshot?.category || variant?.category || localCategory,
      cardSize: localSize || selectedPlan,
    });
  }, [
    product?.category,
    product?.id,
    product?.type,
    selectedPlan,
    selectedProductSnapshot?.category,
    selectedProductSnapshot?.id,
    selectedProductSnapshot?.type,
    subscriptionPreviewKey,
    variant?.category,
  ]);
  const isStripeReturn = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("paid") === "1" && Boolean(sp.get("session_id"));
  }, [location.search]);
  const isStickerFromRouteOrStorage = useMemo(() => {
    const fromQuery = String(new URLSearchParams(location.search).get("category") || "").trim();
    if (/sticker/i.test(fromQuery)) return true;
    try {
      const fromLocal = String(localStorage.getItem("selectedCategory") || "").trim();
      return /sticker/i.test(fromLocal);
    } catch {
      return false;
    }
  }, [location.search]);
  const isClothingFromRouteOrStorage = useMemo(() => {
    const fromQuery = String(new URLSearchParams(location.search).get("category") || "").trim();
    if (/clothing|clothes|apparel/i.test(fromQuery)) return true;
    try {
      const fromLocal = String(localStorage.getItem("selectedCategory") || "").trim();
      return /clothing|clothes|apparel/i.test(fromLocal);
    } catch {
      return false;
    }
  }, [location.search]);
  const [rawSlides, setRawSlides] = useState<RawSlide[]>(() =>
    readInitialRawSlides({
      previewKey: state?.previewKey,
      productId: selectedProductSnapshot?.id,
    }),
  );
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig | null>(() =>
    readInitialPreviewConfig({
      previewKey: state?.previewKey,
      productId: selectedProductSnapshot?.id,
    }),
  );
  const cardMockupPreviewStorageKey = useMemo(
    () =>
      buildCardMockupPreviewStorageKey({
        productId: product?.id ?? selectedProductSnapshot?.id,
        previewKey: subscriptionPreviewKey,
        category: product?.category ?? selectedProductSnapshot?.category,
      }),
    [
      product?.category,
      product?.id,
      selectedProductSnapshot?.category,
      selectedProductSnapshot?.id,
      subscriptionPreviewKey,
    ],
  );
  const [iosTemplatePreviewSrc, setIosTemplatePreviewSrc] = useState("");
  const [iosLegacyCardPreviewSrc, setIosLegacyCardPreviewSrc] = useState("");
  const [cardMockupPreviewSrc, setCardMockupPreviewSrc] = useState(() =>
    readStoredCardMockupPreviewSrc(cardMockupPreviewStorageKey),
  );
  const [captureSupportEnabled, setCaptureSupportEnabled] = useState(false);
  const [legacyCardCaptureEnabled, setLegacyCardCaptureEnabled] = useState(false);
  const processingPaidSessionRef = useRef<string | null>(null);
  const isIosWebKit = useMemo(() => isWebKitBrowser(), []);
  const isIosDevice = useMemo(() => isIosTouchDevice(), []);
  const iosMajorVersion = useMemo(() => getIosMajorVersion(), []);
  const isLegacyIosWebKit = isIosWebKit && iosMajorVersion !== null && iosMajorVersion < 15;

  useEffect(() => {
    setCardMockupPreviewSrc(readStoredCardMockupPreviewSrc(cardMockupPreviewStorageKey));
  }, [cardMockupPreviewStorageKey]);

  const clearPaidQueryParams = useCallback(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    ["paid", "session_id", "category"].forEach((k) => {
      if (params.has(k)) {
        params.delete(k);
        changed = true;
      }
    });
    if (!changed) return;
    const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", clean);
  }, []);
  const isPreviewOnly = useMemo(() => {
    if (state?.previewOnly) {
      try {
        if (sessionStorage.getItem("slides_preview_only") === "0") return false;
      } catch {}
      return true;
    }
    try {
      return sessionStorage.getItem("slides_preview_only") === "1";
    } catch {
      return false;
    }
  }, [state?.previewOnly]);
  const isLegacyCardProduct = useMemo(() => {
    const normalizedType = normalizeItemType(product?.type ?? selectedProductSnapshot?.type);
    if (normalizedType === "card") return true;
    if (normalizedType) return false;
    try {
      return sessionStorage.getItem("card_preview_downloaded") === "1";
    } catch {
      return false;
    }
  }, [product?.type, selectedProductSnapshot?.type]);
  const shouldRenderCardRawForPdf =
    isIosWebKit && isLegacyCardProduct && routeCardRawSlides.length > 0;
  const activeTemplatePreviewSession = useMemo(
    () =>
      !isLegacyCardProduct &&
      hasMatchingTemplatePreviewSession({
        previewKey: state?.previewKey,
        productId: product?.id ?? selectedProductSnapshot?.id,
      }),
    [isLegacyCardProduct, product?.id, selectedProductSnapshot?.id, state?.previewKey],
  );
  const preparedTemplatePreviewSlides = useMemo(
    () => {
      if (!activeTemplatePreviewSession) return {};
      const persisted = getValidSlides(subscriptionPreviewSlides);
      const runtime = getValidSlides(slidesObj);
      const lockStripeStickerPreview =
        isStripeReturn && isStickerFromRouteOrStorage && Object.keys(persisted).length > 0;
      const lockPaidClothingPreview =
        isStripeReturn && isClothingFromRouteOrStorage && Object.keys(persisted).length > 0;
      if (lockPaidClothingPreview) {
        // The runtime payload is hydrated from the immutable checkout snapshot.
        // Let it replace the older preview copy after Stripe returns; otherwise
        // a stale/partial WebKit capture can keep winning this merge forever.
        return getValidSlides({ ...persisted, ...runtime });
      }
      return lockStripeStickerPreview
        ? getValidSlides({ ...runtime, ...persisted })
        : getValidSlides({ ...persisted, ...runtime });
    },
    [
      activeTemplatePreviewSession,
      isClothingFromRouteOrStorage,
      isStickerFromRouteOrStorage,
      isStripeReturn,
      slidesObj,
      subscriptionPreviewSlides,
    ],
  );
  const lockStripeStickerPreview = useMemo(
    () =>
      isStripeReturn &&
      isStickerFromRouteOrStorage &&
      Object.keys(getValidSlides(subscriptionPreviewSlides)).length > 0,
    [isStickerFromRouteOrStorage, isStripeReturn, subscriptionPreviewSlides],
  );
  const hasPreparedTemplatePreviewSlides = Object.keys(preparedTemplatePreviewSlides).length > 0;
  const subscriptionPreviewSlide1 = activeTemplatePreviewSession
    ? preparedTemplatePreviewSlides?.slide1 || ""
    : "";
  const shouldUseIosTemplateCanvasPreview =
    isIosWebKit &&
    activeTemplatePreviewSession &&
    rawSlides.length > 0 &&
    !isLegacyCardProduct &&
    !hasPreparedTemplatePreviewSlides;

  useEffect(() => {
    setSubscriptionPreviewSlides(readSubscriptionPreviewPayload(subscriptionPreviewKey || undefined));
  }, [subscriptionPreviewKey]);

  useEffect(() => {
    let mounted = true;

    const loadSlides = async () => {
      const previewFallbackSlides = getValidSlides(subscriptionPreviewSlides);
      if (lockStripeStickerPreview && Object.keys(previewFallbackSlides).length) {
        if (mounted) setSlidesObj(previewFallbackSlides);
        return;
      }

      if (!isIosWebKit && isStripeReturn && Object.keys(previewFallbackSlides).length) {
        if (mounted) setSlidesObj(previewFallbackSlides);
        return;
      }

      const routeSlides = getValidSlides(state?.slides);
      if (Object.keys(routeSlides).length) {
        if (mounted) setSlidesObj(routeSlides);
        return;
      }

      try {
        const scopedSlides = await loadSlidesFromScopes(checkoutSlidesScopeKeys);
        if (mounted && scopedSlides && Object.keys(scopedSlides).length) {
          setSlidesObj(scopedSlides);
          return;
        }
      } catch {}

      if (isStripeReturn) {
        if (mounted) setSlidesObj({});
        return;
      }

      try {
        const globalSlides = (globalThis as any).__slidesCache;
        if (globalSlides && Object.keys(globalSlides).length) {
          if (mounted) setSlidesObj(globalSlides);
          return;
        }
      } catch {}

      try {
        const fromSession = JSON.parse(sessionStorage.getItem("slides") || "{}");
        if (mounted && fromSession && Object.keys(fromSession).length) {
          setSlidesObj(fromSession);
          return;
        }
      } catch {}

      if (isPreviewOnly) {
        if (mounted) setSlidesObj({});
        return;
      }

      try {
        const fromIdb = await loadSlidesFromIdb();
        if (mounted && fromIdb) {
          setSlidesObj(fromIdb as Record<string, string>);
          return;
        }
      } catch {
        if (mounted) setSlidesObj({});
      }

      try {
        const fromLocal = JSON.parse(localStorage.getItem("slides_backup") || "{}");
        if (mounted && fromLocal && Object.keys(fromLocal).length) {
          setSlidesObj(fromLocal);
          return;
        }
        if (fromLocal && Object.keys(fromLocal).length) return;
      } catch {
        if (mounted) setSlidesObj({});
      }
    };

    loadSlides();
    return () => {
      mounted = false;
    };
  }, [
    checkoutSlidesScopeKeys,
    isIosWebKit,
    isPreviewOnly,
    isStripeReturn,
    lockStripeStickerPreview,
    state?.slides,
    subscriptionPreviewSlides,
  ]);

  useEffect(() => {
    if (!activeTemplatePreviewSession) {
      setRawSlides([]);
      setPreviewConfig(null);
      return;
    }

    try {
      const cachedSlides = (globalThis as any).__rawSlidesCache;
      if (Array.isArray(cachedSlides) && cachedSlides.length) {
        setRawSlides(cachedSlides);
      } else {
        const storedSlides = sessionStorage.getItem("templ_preview_slides");
        if (storedSlides) setRawSlides(JSON.parse(storedSlides));
      }
    } catch {}

    try {
      const cachedCfg = (globalThis as any).__previewConfigCache;
      if (cachedCfg && typeof cachedCfg === "object") {
        setPreviewConfig(cachedCfg);
      } else {
        const storedCfg = sessionStorage.getItem("templ_preview_config");
        if (storedCfg) setPreviewConfig(JSON.parse(storedCfg));
      }
    } catch {}
  }, [activeTemplatePreviewSession]);

  const visibleRawSlides = useMemo(
    () => (rawSlides.length ? rawSlides.slice(0, 1) : []),
    [rawSlides],
  );

  useEffect(() => {
    const sourceSlides = captureSupportEnabled ? rawSlides : visibleRawSlides;
    if (!sourceSlides.length) return;
    const fonts = collectFontsFromRawSlides(sourceSlides);
    if (!fonts.length) return;
    loadGoogleFontsOnce(buildGoogleFontsUrls(fonts));
  }, [captureSupportEnabled, rawSlides, visibleRawSlides]);

  const firstSlideUrl = activeTemplatePreviewSession
    ? subscriptionPreviewSlide1 || (shouldUseIosTemplateCanvasPreview ? iosTemplatePreviewSrc : "")
    : lockStripeStickerPreview
    ? subscriptionPreviewSlides?.slide1 || slidesObj?.slide1 || ""
    : isStripeReturn && isClothingFromRouteOrStorage
    ? slidesObj?.slide1 || subscriptionPreviewSlides?.slide1 || ""
    : isLegacyCardProduct
    ? pickSlideByNumber(slidesObj, cardPreviewSlideNumber) ||
      (!isIosWebKit && isStripeReturn
        ? pickSlideByNumber(subscriptionPreviewSlides, cardPreviewSlideNumber)
        : "")
    : slidesObj?.slide1 || (!isIosWebKit && isStripeReturn ? subscriptionPreviewSlides?.slide1 || "" : "");
  const captureWidth = Math.max(1, Math.round(Number(previewConfig?.mmWidth) || 800));
  const captureHeight = Math.max(1, Math.round(Number(previewConfig?.mmHeight) || 600));

  useEffect(() => {
    if (!shouldUseIosTemplateCanvasPreview) {
      setIosTemplatePreviewSrc("");
    }
  }, [shouldUseIosTemplateCanvasPreview]);

  const slideNodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const setSlideNodeRef = (i: number) => (el: HTMLDivElement | null) => {
    slideNodeRefs.current[i] = el;
  };
  const previewSurfaceRef = useRef<HTMLDivElement | null>(null);
  const legacyCardNodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const setLegacyCardNodeRef = (i: number) => (el: HTMLDivElement | null) => {
    legacyCardNodeRefs.current[i] = el;
  };
  const [previewSurfaceSize, setPreviewSurfaceSize] = useState({ w: 0, h: 0 });
  const captureFontEmbedCssCacheRef = useRef<Map<string, Promise<string>>>(new Map());

  const measurePreviewSurface = useCallback(() => {
    const node = previewSurfaceRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const next = {
      w: Math.max(0, rect.width || node.clientWidth || 0),
      h: Math.max(0, rect.height || node.clientHeight || 0),
    };
    setPreviewSurfaceSize((prev) =>
      Math.abs(prev.w - next.w) < 0.5 && Math.abs(prev.h - next.h) < 0.5 ? prev : next,
    );
  }, []);

  useEffect(() => {
    slideNodeRefs.current = {};
    legacyCardNodeRefs.current = {};
    setCaptureSupportEnabled(false);
    setLegacyCardCaptureEnabled(false);
  }, [isLegacyCardProduct, rawSlides]);

  useEffect(() => {
    const node = previewSurfaceRef.current;
    if (!node) return;

    let frameId: number | null = null;
    const scheduleMeasure = () => {
      if (frameId != null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        measurePreviewSurface();
      });
    };

    scheduleMeasure();
    const obs =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => scheduleMeasure())
        : null;
    obs?.observe(node);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("orientationchange", scheduleMeasure);

    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId);
      obs?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
    };
  }, [measurePreviewSurface]);

  const resolveCaptureFontEmbedCss = useCallback(async (fonts: string[]) => {
    const normalizedFonts = Array.from(
      new Set(
        fonts
          .map((font) => normalizeFontFamily(font))
          .filter((font) => font && !GENERIC_FONT_FAMILIES.has(font.toLowerCase())),
      ),
    ).sort();
    if (!normalizedFonts.length) return "";

    const cacheKey = normalizedFonts.join("|");
    const cached = captureFontEmbedCssCacheRef.current.get(cacheKey);
    if (cached) return await cached;

    const promise = getGoogleFontEmbedCss(normalizedFonts).catch(() => "");
    captureFontEmbedCssCacheRef.current.set(cacheKey, promise);
    return await promise;
  }, []);

  const waitForNodeAssets = useCallback(async (node: HTMLElement) => {
    const images = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const element = img as HTMLImageElement;
            if (element.complete) {
              resolve();
              return;
            }
            const done = () => resolve();
            element.addEventListener("load", done, { once: true });
            element.addEventListener("error", done, { once: true });
          }),
      ),
    );
    if ((document as any)?.fonts?.ready) {
      try {
        await (document as any).fonts.ready;
      } catch {}
    }
    await waitForNextPaint();
  }, []);

  const ensureCaptureSupportReady = useCallback(async () => {
    if (!rawSlides.length && !isLegacyCardProduct) return;
    if (rawSlides.length && !captureSupportEnabled) {
      setCaptureSupportEnabled(true);
    }
    if (isLegacyCardProduct && !legacyCardCaptureEnabled) {
      setLegacyCardCaptureEnabled(true);
    }
    await waitForNextPaint();
    const rawNodesReady = rawSlides.length
      ? Object.keys(slideNodeRefs.current).length >= rawSlides.length
      : true;
    const legacyNodesReady = isLegacyCardProduct
      ? Object.keys(legacyCardNodeRefs.current).length >= 4
      : true;
    if (!rawNodesReady || !legacyNodesReady) {
      await waitForNextPaint();
    }
    if (rawSlides.length) {
      const fonts = collectFontsFromRawSlides(rawSlides);
      if (fonts.length) {
        await ensureGoogleFontsLoaded(buildGoogleFontsUrls(fonts));
      }
    }
    if ((document as any)?.fonts?.ready) {
      try {
        await (document as any).fonts.ready;
      } catch {}
    }
  }, [captureSupportEnabled, isLegacyCardProduct, legacyCardCaptureEnabled, rawSlides]);

  const renderSlide = useCallback((slide?: RawSlide, opts?: { stripBackground?: boolean; transparentCanvas?: boolean }) => {
    if (!slide) return null;
    const stripBackground = opts?.stripBackground === true;
    const ordered = [...(slide.elements || [])]
      .filter((el: any) => {
        if (!stripBackground) return true;
        const id = String(el?.id ?? "").toLowerCase();
        const width = toNum(el?.width, 0);
        const height = toNum(el?.height, 0);
        const isFullFrameImage =
          String(el?.type ?? "").toLowerCase() === "image" &&
          toNum(el?.x, 0) === 0 &&
          toNum(el?.y, 0) === 0 &&
          width >= captureWidth - 1 &&
          height >= captureHeight - 1 &&
          Number(el?.zIndex ?? 1) <= 0;
        return !(id === "bg-image" || id.startsWith("bg-") || isFullFrameImage);
      })
      .sort((a, b) => {
      const zA = Number(a?.zIndex ?? 1) + (a?.type === "text" ? 100000 : 0);
      const zB = Number(b?.zIndex ?? 1) + (b?.type === "text" ? 100000 : 0);
      return zA - zB;
    });
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          bgcolor: opts?.transparentCanvas ? "transparent" : slide.bgColor ?? "transparent",
        }}
      >
        {ordered.map((el: any) => {
          const baseStyle: any = {
            position: "absolute",
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
            zIndex: el.zIndex ?? 1,
          };

          if (el.type === "image") {
            return (
              <Box
                key={el.id}
                component="img"
                src={el.src}
                alt=""
                sx={{ ...baseStyle, objectFit: "cover", display: "block" }}
              />
            );
          }

          if (el.type === "sticker") {
            return (
              <Box
                key={el.id}
                component="img"
                src={el.src}
                alt=""
                sx={{ ...baseStyle, objectFit: "contain", display: "block" }}
              />
            );
          }

          if (el.type === "text") {
            const align = el.align ?? "center";
            const justify =
              align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
            const verticalAlign = el.verticalAlign ?? "center";
            const alignItems =
              verticalAlign === "top"
                ? "flex-start"
                : verticalAlign === "bottom"
                ? "flex-end"
                : "center";
            const rotation = resolveTextRotation(el);
            const curve = Math.max(-200, Math.min(200, resolveTextCurve(el)));
            const hasCurve = Math.abs(curve) > 0.5;
            const safeW = Math.max(1, toNum(el?.width, 1));
            const safeH = Math.max(1, toNum(el?.height, 1));
            const curvePx = (curve / 100) * (safeH / 2);
            const midY = safeH / 2;
            const textAnchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
            const startOffset = align === "left" ? "0%" : align === "right" ? "100%" : "50%";
            const curveId = `sub-curve-${slide?.id ?? "s"}-${el?.id ?? "t"}`;
            const fontSize = toNum(
              firstDefinedValue(
                el?.fontSize,
                el?.font_size,
                el?.["font-size"],
                el?.fontSize1,
                el?.fontSize2,
                el?.fontSize3,
                el?.fontSize4,
                el?.style?.fontSize,
              ),
              20,
            );
            const lineHeight = Math.max(
              1,
              toNum(
                firstDefinedValue(
                  el?.lineHeight,
                  el?.line_height,
                  el?.lineHeight1,
                  el?.lineHeight2,
                  el?.lineHeight3,
                  el?.lineHeight4,
                  el?.style?.lineHeight,
                ),
                1.16,
              ),
            );
            const letterSpacing = toNum(
              firstDefinedValue(
                el?.letterSpacing,
                el?.letter_spacing,
                el?.letterSpacing1,
                el?.letterSpacing2,
                el?.letterSpacing3,
                el?.letterSpacing4,
                el?.style?.letterSpacing,
              ),
              0,
            );
            const fontFamily = resolveTextFontFamily(el) || "Arial";
            const fontWeight = resolveTextWeight(el);
            const fontStyle = resolveTextStyle(el);
            const textDecoration = resolveTextDecoration(el);
            const textColor = resolveTextColor(el);
            return (
              <Box
                key={el.id}
                sx={{
                  ...baseStyle,
                  display: "flex",
                  alignItems,
                  justifyContent: justify,
                  textAlign: align,
                  transform: rotation ? `rotate(${rotation}deg)` : "none",
                  transformOrigin: "center",
                  fontWeight,
                  fontStyle,
                  fontSize,
                  fontFamily,
                  color: textColor,
                  textDecoration,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  lineHeight: String(lineHeight),
                  letterSpacing: `${letterSpacing}px`,
                  overflow: "visible",
                }}
              >
                {hasCurve ? (
                  <Box
                    component="svg"
                    viewBox={`0 0 ${safeW} ${safeH}`}
                    sx={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}
                  >
                    <defs>
                      <path
                        id={curveId}
                        d={`M 0 ${midY} Q ${safeW / 2} ${midY - curvePx} ${safeW} ${midY}`}
                      />
                    </defs>
                    <text
                      fill={textColor}
                      fontFamily={fontFamily}
                      fontSize={fontSize}
                      fontWeight={fontWeight}
                      fontStyle={fontStyle}
                      textDecoration={textDecoration}
                      letterSpacing={letterSpacing}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      direction="ltr"
                      unicodeBidi="plaintext"
                    >
                      <textPath
                        href={`#${curveId}`}
                        startOffset={startOffset}
                        style={{
                          fill: textColor,
                          fontFamily,
                          fontSize,
                          fontWeight,
                          fontStyle,
                          textDecoration,
                          letterSpacing: `${letterSpacing}px`,
                        }}
                      >
                        {String(el?.text ?? "")}
                      </textPath>
                    </text>
                  </Box>
                ) : (
                  String(el?.text ?? "")
                )}
              </Box>
            );
          }

          return null;
        })}
      </Box>
    );
  }, [captureHeight, captureWidth]);

  const captureSlidesFromDom = useCallback(
    async (format: "jpeg" | "png", maxDim = 1600) => {
      const out: string[] = [];
      const fontEmbedCSS = await resolveCaptureFontEmbedCss(collectFontsFromRawSlides(rawSlides));
      for (let i = 0; i < rawSlides.length; i++) {
        const node = slideNodeRefs.current[i];
        if (!node) continue;
        await waitForNodeAssets(node);
        const rect = node.getBoundingClientRect();
        const maxSide = Math.max(rect.width || 0, rect.height || 0);
        const ratio = maxSide ? maxDim / maxSide : 1.5;
        const pixelRatio = Math.min(2, Math.max(0.5, ratio));
        if (format === "png") {
          const png = await toPng(node, {
            pixelRatio,
            backgroundColor: "transparent",
            cacheBust: false,
            skipFonts: !fontEmbedCSS,
            fontEmbedCSS: fontEmbedCSS || undefined,
          });
          out.push(png);
        } else {
          const jpg = await toJpeg(node, {
            quality: 0.78,
            pixelRatio,
            backgroundColor: "#ffffff",
            cacheBust: false,
            skipFonts: !fontEmbedCSS,
            fontEmbedCSS: fontEmbedCSS || undefined,
          });
          out.push(jpg);
        }
        if (i < rawSlides.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      return out;
    },
    [rawSlides, resolveCaptureFontEmbedCss, waitForNodeAssets]
  );

  const prepareRawSlideForCanvas = useCallback(async (
    slide: RawSlide,
    opts?: {
      transparentBackground?: boolean;
      stripLowestCanvasBackground?: boolean;
      normalizeCurvedTextSpacing?: boolean;
    },
  ) => {
    const sourceElements = [...(slide?.elements ?? [])];
    const backgroundIndex = opts?.stripLowestCanvasBackground
      ? sourceElements.reduce((match, element: any, index) => {
          if (String(element?.type ?? "").toLowerCase() !== "image") return match;
          const id = String(element?.id ?? "").trim().toLowerCase();
          const width = toNum(element?.width, 0);
          const height = toNum(element?.height, 0);
          const x = toNum(element?.x, 0);
          const y = toNum(element?.y, 0);
          const isExplicitBackground = id === "bg-image" || id.startsWith("bg-");
          const isLowestFullCanvasLayer =
            Math.abs(x) <= 1 &&
            Math.abs(y) <= 1 &&
            width >= captureWidth - 1 &&
            height >= captureHeight - 1 &&
            Number(element?.zIndex ?? 1) <= 0;
          if (!isExplicitBackground && !isLowestFullCanvasLayer) return match;
          if (match < 0) return index;
          const currentZ = Number(sourceElements[match]?.zIndex ?? 0);
          const candidateZ = Number(element?.zIndex ?? 0);
          return candidateZ < currentZ ? index : match;
        }, -1)
      : -1;

    const elements = await Promise.all(
      sourceElements
        .filter((_, index) => index !== backgroundIndex)
        .map(async (element: any) => {
        if (
          opts?.normalizeCurvedTextSpacing &&
          String(element?.type ?? "").toLowerCase() === "text" &&
          Math.abs(resolveTextCurve(element)) > 0.5
        ) {
          // The editor/category preview intentionally render curved SVG text
          // without tracking. Legacy rows can still carry a letterSpacing
          // value, which the canvas renderer interprets as px per glyph and
          // visibly spreads names after an iOS checkout regeneration.
          return {
            ...element,
            letterSpacing: 0,
            preserveWordShaping: true,
          };
        }
        if (element?.type !== "image" && element?.type !== "sticker") return element;
        const src = String(element?.src ?? "");
        return {
          ...element,
          src: (await toDataUrlSafe(src)) || src || TRANSPARENT_PIXEL,
        };
      }),
    );

    return {
      ...slide,
      ...(opts?.transparentBackground ? { bgColor: "transparent" } : {}),
      elements,
    } as RawSlide;
  }, [captureHeight, captureWidth]);

  const captureSlidesFromCanvasRenderer = useCallback(
    async (format: "jpeg" | "png", maxDim = 1600) => {
      const out: string[] = [];
      const maxSide = Math.max(captureWidth, captureHeight, 1);
      const ratio = maxSide ? maxDim / maxSide : 1.5;
      const pixelRatio = Math.min(format === "png" ? 3 : 2.5, Math.max(1, ratio));
      const renderClothingWithTransparentLayers =
        format === "png" && isIosDevice && isClothingFromRouteOrStorage;

      for (let i = 0; i < rawSlides.length; i++) {
        const preparedSlide = await prepareRawSlideForCanvas(
          rawSlides[i],
          {
            transparentBackground: renderClothingWithTransparentLayers,
            stripLowestCanvasBackground: renderClothingWithTransparentLayers,
            normalizeCurvedTextSpacing: renderClothingWithTransparentLayers,
          },
        );
        const result = await renderTemplateSlideToCanvasWithStats(preparedSlide as any, {
          width: captureWidth,
          height: captureHeight,
          pixelRatio,
          backgroundColor: format === "png" ? "transparent" : "#ffffff",
        });
        // On WebKit, image decoding can fail while text still renders. Never
        // promote a partial bitmap over the complete live slide preview.
        if (result.expectedAssets > 0 && result.drawnAssets < result.expectedAssets) {
          return [];
        }
        const canvas = result.canvas;
        const dataUrl =
          format === "png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.88);
        out.push(dataUrl);
        if (i < rawSlides.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      return out;
    },
    [
      captureHeight,
      captureWidth,
      isClothingFromRouteOrStorage,
      isIosDevice,
      prepareRawSlideForCanvas,
      rawSlides,
    ],
  );

  const captureCardRawSlidesFromCanvasRenderer = useCallback(
    async (format: "jpeg" | "png", maxDim = 1600) => {
      if (!routeCardRawSlides.length) return [];

      const fonts = collectFontsFromRawSlides(routeCardRawSlides);
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

      const out: string[] = [];
      const maxSide = Math.max(LEGACY_CARD_CAPTURE.w, LEGACY_CARD_CAPTURE.h, 1);
      const ratio = maxSide ? maxDim / maxSide : 1.5;
      const pixelRatio = Math.min(format === "png" ? 3 : 2.5, Math.max(1, ratio));

      for (let i = 0; i < routeCardRawSlides.length; i += 1) {
        const preparedSlide = await prepareRawSlideForCanvas(routeCardRawSlides[i]);
        const result = await renderTemplateSlideToCanvasWithStats(preparedSlide as any, {
          width: LEGACY_CARD_CAPTURE.w,
          height: LEGACY_CARD_CAPTURE.h,
          pixelRatio,
          backgroundColor: format === "png" ? "transparent" : "#ffffff",
        });

        if (result.expectedAssets > 0 && result.drawnAssets < result.expectedAssets) {
          return [];
        }

        const dataUrl =
          format === "png"
            ? result.canvas.toDataURL("image/png")
            : result.canvas.toDataURL("image/jpeg", 0.9);
        out.push(dataUrl);

        if (i < routeCardRawSlides.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      return out;
    },
    [prepareRawSlideForCanvas, routeCardRawSlides],
  );

  const captureLegacyCardSlidesFromDom = useCallback(
    async (maxDim = 1600) => {
      const out: string[] = [];
      const legacyFonts = Array.from(
        new Set(
          Array.from({ length: 4 }, (_, i) => collectFontsFromNode(legacyCardNodeRefs.current[i])).flat(),
        ),
      );
      const fontEmbedCSS = await resolveCaptureFontEmbedCss(legacyFonts);
      for (let i = 0; i < 4; i++) {
        const node = legacyCardNodeRefs.current[i];
        if (!node) continue;
        await waitForNodeAssets(node);
        const rect = node.getBoundingClientRect();
        const maxSide = Math.max(rect.width || 0, rect.height || 0);
        const ratio = maxSide ? maxDim / maxSide : 1.5;
        const pixelRatio = Math.min(2, Math.max(0.5, ratio));
        const jpg = await toJpeg(node, {
          quality: 0.9,
          pixelRatio,
          backgroundColor: "#ffffff",
          cacheBust: false,
          imagePlaceholder: TRANSPARENT_PIXEL,
          skipFonts: !fontEmbedCSS,
          fontEmbedCSS: fontEmbedCSS || undefined,
          width: LEGACY_CARD_CAPTURE.w,
          height: LEGACY_CARD_CAPTURE.h,
          style: { transform: "none" },
        });
        out.push(jpg);
        if (i < 3) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      return out;
    },
    [resolveCaptureFontEmbedCss, waitForNodeAssets],
  );

  useEffect(() => {
    if (!isIosWebKit || !isLegacyCardProduct) {
      setIosLegacyCardPreviewSrc("");
      return;
    }
   

    let alive = true;

    const buildCardPreview = async () => {
      try {
        // WebKit may return a valid-looking DOM capture with image/sticker
        // layers missing. Render the persisted raw model first; the renderer
        // verifies expectedAssets === drawnAssets before returning anything.
        await ensureCaptureSupportReady();
        const canvasCaptured = await captureCardRawSlidesFromCanvasRenderer("jpeg", 1800);
        if (!alive) return;

        const preferred =
          String(canvasCaptured?.[cardPreviewSlideIndex] || "") ||
          String(canvasCaptured?.[0] || "");
        if (isDataImageUrl(preferred)) {
          setIosLegacyCardPreviewSrc(preferred);
          return;
        }

        // Last-resort compatibility path for old drafts without raw slide data.
        const domCaptured = await captureLegacyCardSlidesFromDom(1800);
        if (!alive) return;
        setIosLegacyCardPreviewSrc(
          String(domCaptured?.[cardPreviewSlideIndex] || domCaptured?.[0] || ""),
        );
      } catch {
        if (!alive) return;
        setIosLegacyCardPreviewSrc("");
      }
    };

  void buildCardPreview();

  return () => {
    alive = false;
  };
}, [
  captureCardRawSlidesFromCanvasRenderer,
  captureLegacyCardSlidesFromDom,
  cardPreviewSlideIndex,
  ensureCaptureSupportReady,
  isIosWebKit,
  isLegacyCardProduct,
]);

  const storeSlidesPayload = useCallback((next: Record<string, string>) => {
    const valid = getValidSlides(next);
    if (!Object.keys(valid).length) return;
    if (lockStripeStickerPreview) return;

    setSlidesObj(valid);
    (globalThis as any).__slidesCache = valid;
    try {
      sessionStorage.setItem("slides_preview_only", "0");
      sessionStorage.setItem("rawSlidesCount", String(Object.keys(valid).length));
      sessionStorage.setItem("slides", JSON.stringify(valid));
    } catch {}

    try {
      localStorage.setItem("slides_backup", JSON.stringify(valid));
    } catch {}

    try {
      void saveSlidesToIdb(valid);
    } catch {}

    try {
      void saveSlidesToScopes(checkoutSlidesScopeKeys, valid);
    } catch {}
  }, [checkoutSlidesScopeKeys, lockStripeStickerPreview]);

  const readCapturedSlidesFromStorage = useCallback(() => {
    try {
      const stored = sessionStorage.getItem("capturedSlides");
      if (!stored) return [] as string[];
      const capturedKey = sessionStorage.getItem("capturedSlidesKey") || "";
      const previewKey = sessionStorage.getItem("templ_preview_key") || "";
      if (capturedKey && previewKey && capturedKey !== previewKey) return [] as string[];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((u) => typeof u === "string" && u.startsWith("data:image/"))
        : [];
    } catch {
      return [] as string[];
    }
  }, []);

  // ✅ read local selections
  useEffect(() => {
    try {
      const rawV = localStorage.getItem("selectedVariant");
      if (rawV) {
        const parsed = JSON.parse(rawV) as SelectedVariant;
        if (parsed?.key) {
          setVariant(parsed);
          const normalizedKey =
            KEY_FALLBACK[String(parsed.key).toUpperCase()] ??
            String(parsed.key).trim().toLowerCase();
          setSelectedPlan(normalizedKey as SizeKey);
        }
      }
    } catch { }

    try {
      const rawP = localStorage.getItem("selectedPrices");
      if (rawP) {
        const parsed = JSON.parse(rawP) as PriceTables;
        if (parsed?.actual) setPriceTables(parsed);
      }
    } catch { }

    try {
      const rawProd = localStorage.getItem("selectedProduct");
      if (rawProd) {
        const parsed = JSON.parse(rawProd) as SelectedProduct;
        setProduct(parsed);
      }
    } catch { }
  }, []);

  // ✅ load bundle_items once
  useEffect(() => {
    (async () => {
      try {
        setBundleKeyLoading(true);
        const setKeys = await fetchBundleItemKeySet();
        setBundleKeySet(setKeys);
      } catch (e) {
        console.error(e);
      } finally {
        setBundleKeyLoading(false);
      }
    })();
  }, []);

  // ✅ category used for sizes + mockup
  const categoryName = useMemo(() => {
    const lsCat = (() => {
      try {
        return localStorage.getItem("selectedCategory") || "";
      } catch {
        return "";
      }
    })();

    return (
      [product?.category, selectedProductSnapshot?.category, variant?.category, lsCat]
        .map((value) => String(value ?? "").trim())
        .find(Boolean) || "default"
    );
  }, [product?.category, selectedProductSnapshot?.category, variant?.category]);

  useEffect(() => {
    try {
      localStorage.setItem("selectedCategory", String(categoryName));
    } catch {}
  }, [categoryName]);

  const isMugsCategory = useMemo(() => lc(categoryName).includes("mug"), [categoryName]);
  const isCardsCategoryPage = useMemo(() => isCardsCategory(categoryName), [categoryName]);
  const categoryLabel = useMemo(
    () => singularizeCategory(product?.category || categoryName),
    [product?.category, categoryName]
  );

  const mugPreview = useMemo(() => {
    if (!isMugsCategory) return "";
    if (subscriptionPreviewSlide1) return subscriptionPreviewSlide1;
    if (slidesObj?.slide1) return slidesObj.slide1;
    try {
      const slides = JSON.parse(sessionStorage.getItem("slides") || "{}");
      return slides.slide1 || "";
    } catch {
      return "";
    }
  }, [isMugsCategory, slidesObj, subscriptionPreviewSlide1]);

  // ✅ EXACT sizes (no filter)
  const sizeDefs = useMemo(() => {
    const defs = getSizeDefsForCategory(categoryName);
    if (!lc(categoryName).includes("candle")) return defs;
    return defs.map((opt) =>
      String(opt.key).toLowerCase() === "us_tabloid"
        ? { ...opt, key: "us_letter", title: "US Letter" }
        : opt,
    );
  }, [categoryName]);

  // ✅ Build plans from EXACT sizeDefs (no sale)
  const plans = useMemo(() => {
    return sizeDefs.map((opt) => {
      const price = readActualPrice(priceTables, opt.key, categoryName);
      return {
        id: opt.key,
        title: opt.title,
        sub: opt.sub,
        price,
        disabled: price <= 0,
      };
    });
  }, [sizeDefs, priceTables]);

  // ✅ Ensure selectedPlan exists; prefer first available, else first item
  useEffect(() => {
    if (!plans.length) return;

    const exists = plans.some((p) => String(p.id) === String(selectedPlan));
    if (exists) return;

    const firstAvail = plans.find((p) => !p.disabled)?.id;
    const fallback = plans[0]?.id;
    setSelectedPlan((firstAvail ?? fallback ?? "a4") as any);
  }, [plans, selectedPlan]);

  // const isMugsCate = useMemo(
  //   () => categoryName === "Mugs" || categoryName.toLowerCase() === "mugs",
  //   [categoryName]
  // );
  
  const mock = useMemo(() => getMockupConfig(categoryName), [categoryName]);
  const [mockupOk, setMockupOk] = useState(false);
  const allowMockup = !isMugsCategory;

  useEffect(() => {
    let alive = true;

    if (!allowMockup || !mock?.mockupSrc || (!isMugsCategory && mugPreview)) {
      setMockupOk(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (alive) setMockupOk(true);
    };
    img.onerror = () => {
      if (alive) setMockupOk(false);
    };
    img.src = mock.mockupSrc;

    return () => {
      alive = false;
    };
  }, [mock?.mockupSrc, mugPreview, isMugsCategory, allowMockup]);

  const useMockupBackground = allowMockup && Boolean(mock?.mockupSrc) && mockupOk;
  const useIosMockupRatioFallback = useMockupBackground && isLegacyIosWebKit;
  const mockupSurfaceAspectRatio = mock?.surfaceAspectRatio || "818 / 600";
  const mockupAspectRatio =
    useMockupBackground && !useIosMockupRatioFallback ? mockupSurfaceAspectRatio : undefined;
  const iosMockupRatioPadding = useIosMockupRatioFallback
    ? aspectRatioToPadding(mockupSurfaceAspectRatio) || "73.349633%"
    : undefined;

  useEffect(() => {
    measurePreviewSurface();
  }, [measurePreviewSurface, useIosMockupRatioFallback, useMockupBackground]);

  // ✅ load user plan
  useEffect(() => {
    (async () => {
      try {
        setPlanLoading(true);
        const token = await getAccessToken();
        if (!token) {
          setUserPlan({ plan_code: "free", isPremium: false, premium_expires_at: null });
          return;
        }

        const res = await fetch(`${API_BASE}/me/plan`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setUserPlan({ plan_code: "free", isPremium: false, premium_expires_at: null });
          return;
        }

        const data = (await res.json()) as UserPlan;
        setUserPlan(data);
      } catch {
        setUserPlan({ plan_code: "free", isPremium: false, premium_expires_at: null });
      } finally {
        setPlanLoading(false);
      }
    })();
  }, []);

  const planCode = plan;

  const selectedItemAccessPlan = useMemo(() => getItemAccessPlan(product), [product]);

  const productKey = useMemo(
    () => (product?.id && product?.type ? `${product.type}:${product.id}` : ""),
    [product]
  );
  const usesDurableCheckoutSource = useMemo(
    () =>
      /clothing|clothes|apparel|mug|candle/i.test(
        String(categoryName ?? ""),
      ),
    [categoryName],
  );
  const durableCheckoutSourceKey = useMemo(() => {
    const snapshotProductKey =
      selectedProductSnapshot?.id && selectedProductSnapshot?.type
        ? `${selectedProductSnapshot.type}:${selectedProductSnapshot.id}`
        : "";
    return `${DURABLE_CHECKOUT_SOURCE_PREFIX}${lc(
      productKey || snapshotProductKey || "state",
    )}:${lc(categoryName)}`;
  }, [
    categoryName,
    productKey,
    selectedProductSnapshot?.id,
    selectedProductSnapshot?.type,
  ]);
  const durableCheckoutCategoryKey = useMemo(
    () => `${DURABLE_CHECKOUT_SOURCE_PREFIX}category:${lc(categoryName)}`,
    [categoryName],
  );

  useEffect(() => {
    if (!isStripeReturn || !usesDurableCheckoutSource) return;
    let active = true;

    void (async () => {
      const exact = getValidSlides(
        await loadSlidesFromIdbByKey(durableCheckoutSourceKey),
      );
      if (Object.keys(exact).length) return exact;
      return getValidSlides(
        await loadSlidesFromIdbByKey(durableCheckoutCategoryKey),
      );
    })()
      .then((source) => {
        if (!active) return;
        if (!Object.keys(source).length) return;
        setSlidesObj(source);
        setSubscriptionPreviewSlides(source);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [
    durableCheckoutCategoryKey,
    durableCheckoutSourceKey,
    isStripeReturn,
    usesDurableCheckoutSource,
  ]);

  const isInBundleItems = useMemo(() => isProductInBundle(product, bundleKeySet), [product, bundleKeySet]);

  const getCheckoutPreparation = useCallback(
    (cardSize?: string | null) => {
      const effectiveCardSize =
        String(cardSize ?? "").trim() || localStorage.getItem("selectedSize") || selectedPlan;
      const isTwoUpLandscape = isCardsCategory(categoryName) && isParallelCardSize(effectiveCardSize);
      const isInviteTwoUp =
        /invite/i.test(String(categoryName ?? "")) && isInviteTwoUpSize(effectiveCardSize);
      const isLeafletTwoUp =
        isBusinessLeafletsCategory(categoryName) && isLeafletTwoUpSize(effectiveCardSize);
      const isTenUpBusinessCards =
        isBusinessCardsCategory(categoryName) && isBusinessCardPrintSize(effectiveCardSize);
      const isCandlesGrid = isCandlesCategory(categoryName);
      const isCoastersGrid = isCoastersCategory(categoryName);
      const isNotebookTwoUp =
        isNotebooksCategory(categoryName) && isNotebookTwoUpSize(effectiveCardSize);
      const isMugWrap = isMugsCategory && isMugWrapSize(effectiveCardSize);
      const isStickerForPdf = /sticker/i.test(String(categoryName ?? ""));
      const isBagCategory = /bag|tote/i.test(String(categoryName ?? ""));
      const isClothingCategory = /clothing|clothes|apparel/i.test(String(categoryName ?? ""));
      const isBagOrClothingForPdf = isBagCategory || isClothingCategory;
      const isNotebookCategory = isNotebooksCategory(categoryName);
      const clothingBgRemoveOpts = {
        threshold: 12,
        alphaThreshold: 8,
        minBrightness: 245,
        satThreshold: 12,
        whiteMinChannel: 242,
        whiteOnly: true,
        requireWhiteBg: true,
        softness: 0,
        mode: "edge" as const,
      };
      const bagBgRemoveOpts = {
        threshold: 18,
        alphaThreshold: 8,
        minBrightness: 245,
        satThreshold: 10,
        whiteMinChannel: 240,
        whiteOnly: true,
        requireWhiteBg: true,
      };
      const bgRemoveOpts =
        !isCandlesGrid &&
        !isCoastersGrid &&
        !isMugWrap &&
        (isBagOrClothingForPdf || isNotebookCategory)
          ? isClothingCategory && isIosDevice
            ? null
            : isClothingCategory
            ? clothingBgRemoveOpts
            : bagBgRemoveOpts
          : !isCandlesGrid && !isCoastersGrid && !isMugWrap && isStickerForPdf
          ? { threshold: 28, alphaThreshold: 8, minBrightness: 228, satThreshold: 18 }
          : null;
      const isTransparentPdf =
        isStickerForPdf ||
        isBagOrClothingForPdf ||
        isCoastersGrid ||
        isMugWrap ||
        isNotebookCategory;

      return {
        cardSize: effectiveCardSize,
        isTwoUpLandscape,
        isInviteTwoUp,
        isLeafletTwoUp,
        isTenUpBusinessCards,
        isCandlesGrid,
        isCoastersGrid,
        isNotebookTwoUp,
        isMugWrap,
        bgRemoveOpts,
        isTransparentPdf,
        captureFormat: (isTransparentPdf ? "png" : "jpeg") as "png" | "jpeg",
        outputFormat: (isTransparentPdf ? "png" : "pdf") as "png" | "pdf",
        pageOrientation:
          isTwoUpLandscape || isLeafletTwoUp || isNotebookTwoUp || isInviteTwoUp || isMugWrap
            ? "landscape"
            : undefined,
      };
    },
    [categoryName, isIosDevice, isMugsCategory, selectedPlan],
  );

  const isBundleAndMatched = planCode === "bundle" && isInBundleItems;

  // ✅ PRO-ONLY CARD RULE (keep as-is)
  const isProUser = planCode === "pro";
  const isProOnlyCard = selectedItemAccessPlan === "pro";
  const proOnlyLocked = isProOnlyCard && !isProUser;

  const requiresPayment = useMemo(() => {
    if (planLoading || bundleKeyLoading) return true;

    if (planCode === "pro") return false;

    if (planCode === "bundle") return !isInBundleItems;

    return true;
  }, [planCode, planLoading, bundleKeyLoading, isInBundleItems]);

  const getSlidesPayload = async () => {
    if (isStripeReturn && usesDurableCheckoutSource) {
      try {
        let checkoutSource = getValidSlides(
          await loadSlidesFromIdbByKey(durableCheckoutSourceKey),
        );
        if (!Object.keys(checkoutSource).length) {
          checkoutSource = getValidSlides(
            await loadSlidesFromIdbByKey(durableCheckoutCategoryKey),
          );
        }
        if (Object.keys(checkoutSource).length) return checkoutSource;
      } catch {}
    }
    if (lockStripeStickerPreview) {
      const persisted = getValidSlides(subscriptionPreviewSlides);
      if (Object.keys(persisted).length) return persisted;
    }
    if (slidesObj && Object.keys(slidesObj).length) return slidesObj;
    const previewFallbackSlides = getValidSlides(subscriptionPreviewSlides);
    if (Object.keys(previewFallbackSlides).length) {
      return previewFallbackSlides;
    }
    try {
      const scopedSlides = await loadSlidesFromScopes(checkoutSlidesScopeKeys);
      if (scopedSlides && Object.keys(scopedSlides).length) return scopedSlides;
    } catch {}
    if (isStripeReturn) return {};
    try {
      const globalSlides = (globalThis as any).__slidesCache;
      if (globalSlides && Object.keys(globalSlides).length) return globalSlides;
    } catch {}
    try {
      const fromSession = JSON.parse(sessionStorage.getItem("slides") || "{}");
      if (fromSession && Object.keys(fromSession).length) return fromSession;
    } catch {
      return slidesObj ?? {};
    }
    if (isPreviewOnly) return {};
    try {
      const fromIdb = await loadSlidesFromIdb();
      if (fromIdb && Object.keys(fromIdb).length) return fromIdb;
    } catch {}
    try {
      return JSON.parse(localStorage.getItem("slides_backup") || "{}");
    } catch {
      return slidesObj ?? {};
    }
  };

  const syncLocalSelection = (p: { id: any; title: string; price: number }) => {
    try {
      const newVariant: SelectedVariant = {
        key: p.id,
        title: p.title,
        price: p.price,
        isOnSale: false,
        category: categoryName,
      } as any;

      localStorage.setItem("selectedVariant", JSON.stringify(newVariant));
      localStorage.setItem("selectedSize", String(p.id));
      localStorage.setItem("selectedCategory", String(categoryName));
    } catch { }
  };

  const startOneTimeStripeCheckout = async (p: { title: string; price: number }) => {
    setLoading(true);
    setCheckoutProgressStep(18, "Preparing secure checkout...");
    try {
      if (!STRIPE_PK) throw new Error("Stripe key missing in env");
      const prep = getCheckoutPreparation(selectedPlan);
      const [stripe, preparedSlides] = await Promise.all([
        stripePromise,
        ensureSlidesPayload(prep.captureFormat),
      ]);
      if (!stripe) throw new Error("Stripe not available");
      const validPreparedSlides = getValidSlides(preparedSlides);
      if (!Object.keys(validPreparedSlides).length) {
        throw new Error("Could not prepare your design for checkout");
      }

      if (usesDurableCheckoutSource) {
        const durableSource = validPreparedSlides;
        // Safari can discard in-memory/session data during the Stripe page
        // transition. Commit the exact, unmodified pre-payment render to the
        // scoped IndexedDB store before redirecting; paid mockup hydration and
        // email generation both resolve this same immutable source. Do not run
        // background removal here: mutating the live checkout source caused
        // Safari redirect failures to leave a text-only preview behind.
        await Promise.all([
          saveSlidesToIdbByKey(durableCheckoutSourceKey, durableSource),
          saveSlidesToIdbByKey(durableCheckoutCategoryKey, durableSource),
        ]);
        try {
          await saveSlidesToScopes(checkoutSlidesScopeKeys, durableSource);
        } catch {
          // The two dedicated IndexedDB copies above are the authoritative
          // checkout source. Scoped mirrors are only backward-compatible
          // fallbacks and must not block payment in Safari.
        }
        saveSubscriptionPreviewPayload(
          durableSource,
          subscriptionPreviewKey || undefined,
        );
      }

      setCheckoutProgressStep(42, "Creating Stripe checkout session...");

      const successUrl = `${window.location.origin}${location.pathname}?paid=1&session_id={CHECKOUT_SESSION_ID}&category=${encodeURIComponent(
        categoryName
      )}`;
      const cancelUrl = `${window.location.origin}${location.pathname}`;

      const res = await fetch(`${API_BASE}/checkout/one-time/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: p.title,
          price: p.price,
          user: {
            email: user?.email,
            name: user?.user_metadata?.full_name || "User",
            id: user?.id,
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            variantKey: selectedPlan,
            category: categoryName,
            accessplan: selectedItemAccessPlan,
            productKey,
          },
        }),
      });

      if (!res.ok) throw new Error("checkout failed");
      const checkout = await res.json();
      const id = String(checkout?.id || "");
      if (!id) throw new Error("Checkout session was not created");

      setCheckoutProgressStep(88, "Redirecting to Stripe...");
      toast.success("Redirecting to payment...");
      const { error } = await stripe.redirectToCheckout({ sessionId: id });
      if (error) {
        throw new Error(error.message || "Stripe checkout could not be loaded");
      }
    } catch (e: any) {
      toast.error(e?.message || "Payment failed!");
    } finally {
      setLoading(false);
      clearCheckoutProgress();
    }
  };

  const ensureSlidesPayload = useCallback(
    async (format: "jpeg" | "png") => {
      const preparedPreviewSlides =
        activeTemplatePreviewSession && hasPreparedTemplatePreviewSlides
          ? preparedTemplatePreviewSlides
          : {};
      // On the paid return, getSlidesPayload resolves the exact pre-Stripe
      // checkout snapshot from IndexedDB. Never let an older preview payload
      // bypass that lookup for categories using the durable handoff.
      const durablePaidSource =
        isStripeReturn && usesDurableCheckoutSource
          ? await getSlidesPayload()
          : {};
      const current = Object.keys(durablePaidSource).length
        ? durablePaidSource
        : Object.keys(preparedPreviewSlides).length
        ? preparedPreviewSlides
        : await getSlidesPayload();
      const currentKeys = Object.keys(current || {}).filter((k) => current[k]);
      const expectedCount = (() => {
        if (rawSlides.length) return rawSlides.length;
        if (isLegacyCardProduct) return currentKeys.length > 0 ? currentKeys.length : 4;
        try {
          const n = Number(sessionStorage.getItem("rawSlidesCount") || "0");
          return Number.isFinite(n) && n > 0 ? n : 0;
        } catch {
          return 0;
        }
      })();

      const hasEnough = expectedCount ? currentKeys.length >= expectedCount : currentKeys.length > 0;
      const needPng = format === "png";
      const hasPng = !needPng
        ? true
        : currentKeys.every((k) => String(current[k] || "").startsWith("data:image/png"));
      const forceSafariClothingLayerCapture =
        !isStripeReturn &&
        isIosDevice &&
        needPng &&
        isClothingFromRouteOrStorage &&
        rawSlides.length > 0;

      if (shouldRenderCardRawForPdf) {
        const list = await captureCardRawSlidesFromCanvasRenderer(format, needPng ? 2400 : 1600);
        if (list.length) {
          const next = Object.fromEntries(list.map((u, idx) => [`slide${idx + 1}`, u]));
          storeSlidesPayload(next);
          return next;
        }
      }

      if (
        !forceSafariClothingLayerCapture &&
        hasEnough &&
        (hasPng || (isIosWebKit && Object.keys(preparedPreviewSlides).length)) &&
        (!isPreviewOnly || isMugsCategory)
      ) {
        const validCurrent = getValidSlides(current as Record<string, string>);
        if (Object.keys(validCurrent).length) {
          storeSlidesPayload(validCurrent);
          return validCurrent;
        }
        return current;
      }

      const capturedList = readCapturedSlidesFromStorage();
      const capturedEnough = expectedCount
        ? capturedList.length >= expectedCount
        : capturedList.length > 0;
      const capturedHasPng =
        !needPng || capturedList.every((u) => String(u || "").startsWith("data:image/png"));
      if (!forceSafariClothingLayerCapture && capturedEnough && capturedHasPng) {
        const next = Object.fromEntries(capturedList.map((u, idx) => [`slide${idx + 1}`, u]));
        storeSlidesPayload(next);
        return next;
      }

      if (!rawSlides.length && !isLegacyCardProduct) return current;

      if (isIosDevice && isClothingFromRouteOrStorage) {
        await withTimeout(ensureCaptureSupportReady(), 8_000, undefined);
      } else {
        await ensureCaptureSupportReady();
      }
      const captureTask = rawSlides.length
        ? isIosWebKit && activeTemplatePreviewSession
          ? captureSlidesFromCanvasRenderer(format, needPng ? 2400 : 1600)
          : captureSlidesFromDom(format, needPng ? 2400 : 1600)
        : captureLegacyCardSlidesFromDom(1600);
      const list =
        isIosDevice && isClothingFromRouteOrStorage
          ? await withTimeout(captureTask, 15_000, [] as string[])
          : await captureTask;
      if (!list.length) return current;

      const next = Object.fromEntries(list.map((u, idx) => [`slide${idx + 1}`, u]));
      storeSlidesPayload(next);
      return next;
    },
    [
      captureCardRawSlidesFromCanvasRenderer,
      captureSlidesFromCanvasRenderer,
      captureLegacyCardSlidesFromDom,
      captureSlidesFromDom,
      ensureCaptureSupportReady,
      getSlidesPayload,
      activeTemplatePreviewSession,
      hasPreparedTemplatePreviewSlides,
      isClothingFromRouteOrStorage,
      isIosDevice,
      isIosWebKit,
      isLegacyCardProduct,
      isMugsCategory,
      isPreviewOnly,
      isStripeReturn,
      preparedTemplatePreviewSlides,
      readCapturedSlidesFromStorage,
      rawSlides.length,
      shouldRenderCardRawForPdf,
      storeSlidesPayload,
      usesDurableCheckoutSource,
    ]
  );

  const getPreparedSlidesCacheKey = useCallback(
    (cardSize?: string | null) =>
      buildPreparedSlidesKey(
        `${productKey || "state"}:${subscriptionPreviewKey || "no-preview"}`,
        categoryName,
        cardSize || selectedPlan,
      ),
    [
      categoryName,
      productKey,
      selectedPlan,
      subscriptionPreviewKey,
    ],
  );

  const loadPreparedSlidesPayload = useCallback(
    async (cardSize?: string | null) => {
      const key = getPreparedSlidesCacheKey(cardSize);
      try {
        const cache = (globalThis as any).__preparedSlidesCache;
        const cached = cache?.[key];
        const valid = getValidSlides(cached);
        if (Object.keys(valid).length) return valid;
      } catch {}

      try {
        const fromIdb = await loadSlidesFromIdbByKey(key);
        const valid = getValidSlides(fromIdb);
        if (!Object.keys(valid).length) return null;
        const cache = (globalThis as any).__preparedSlidesCache ?? {};
        cache[key] = valid;
        (globalThis as any).__preparedSlidesCache = cache;
        return valid;
      } catch {
        return null;
      }
    },
    [getPreparedSlidesCacheKey],
  );

  const storePreparedSlidesPayload = useCallback(
    (cardSize: string | null | undefined, slides: Record<string, string>) => {
      const valid = getValidSlides(slides);
      if (!Object.keys(valid).length) return;
      const key = getPreparedSlidesCacheKey(cardSize);
      try {
        const cache = (globalThis as any).__preparedSlidesCache ?? {};
        cache[key] = valid;
        (globalThis as any).__preparedSlidesCache = cache;
      } catch {}

      try {
        void saveSlidesToIdbByKey(key, valid);
      } catch {}
    },
    [getPreparedSlidesCacheKey],
  );

  const prepareDeliverySlides = useCallback(
    async (
      cardSize?: string | null,
      onProgress?: (value: number, label: string) => void,
    ) => {
      const prep = getCheckoutPreparation(cardSize);
      const isPaidClothingSource =
        isStripeReturn &&
        /clothing|clothes|apparel/i.test(String(categoryName ?? ""));
      const canUsePreparedSlidesCache =
        !isPaidClothingSource &&
        !prep.isMugWrap &&
        !shouldRenderCardRawForPdf &&
        !isLegacyCardProduct;
      if (canUsePreparedSlidesCache) {
        const cached = await loadPreparedSlidesPayload(prep.cardSize);
        if (cached && Object.keys(cached).length) {
          return {
            slides: cached,
            outputFormat: prep.outputFormat,
            pageOrientation: prep.pageOrientation,
          };
        }
      }

      const rawSlides = await ensureSlidesPayload(prep.captureFormat);
      if (isPaidClothingSource) {
        const exactCheckoutSource = getValidSlides(rawSlides);
        if (!Object.keys(exactCheckoutSource).length) {
          throw new Error("No valid checkout source found");
        }
        // Paid clothing uses the immutable pre-Stripe bitmap and returns before
        // the shared print-processing branch below. Mirror it here so the final
        // emailed transfer file follows the same horizontal-flip rule as other
        // clothing/apparel output, while the on-screen mockup remains normal.
        const mirroredCheckoutSource = await mirrorSlides(exactCheckoutSource);
        if (canUsePreparedSlidesCache) {
          storePreparedSlidesPayload(prep.cardSize, mirroredCheckoutSource);
        }
        return {
          slides: mirroredCheckoutSource,
          outputFormat: prep.outputFormat,
          pageOrientation: prep.pageOrientation,
        };
      }
      onProgress?.(40, "Applying print layout...");

      const slidesAlreadyMirrored = (() => {
        try {
          return sessionStorage.getItem("slides_mirrored") === "1";
        } catch {
          return false;
        }
      })();
      const mirrorPrint = isMirrorPrintCategory(categoryName) && !slidesAlreadyMirrored;
      const baseSlides = mirrorPrint ? await mirrorSlides(rawSlides) : rawSlides;
      if (slidesAlreadyMirrored) {
        try {
          sessionStorage.removeItem("slides_mirrored");
          sessionStorage.removeItem("slides_mirrored_category");
        } catch {}
      }

      const processedCandleSlides = prep.isCandlesGrid
        ? await (async () => {
            const entries = await Promise.all(
              Object.entries(baseSlides as Record<string, string>).map(async ([k, v]) => {
                const src = typeof v === "string" ? v : "";
                if (!src) return [k, v] as const;
                const cleaned = await removeWhiteBg(src, {
                  threshold: 24,
                  alphaThreshold: 8,
                  minBrightness: 235,
                  satThreshold: 16,
                  mode: "all",
                });
                return [k, cleaned] as const;
              }),
            );
            return Object.fromEntries(entries);
          })()
        : baseSlides;

      const processedCoasterSlides = prep.isCoastersGrid
        ? await (async () => {
            const entries = await Promise.all(
              Object.entries(baseSlides as Record<string, string>).map(async ([k, v]) => {
                const src = typeof v === "string" ? v : "";
                if (!src) return [k, v] as const;
                const cleaned = await removeWhiteBg(src, {
                  threshold: 24,
                  alphaThreshold: 8,
                  minBrightness: 235,
                  satThreshold: 16,
                  mode: "edge",
                  whiteOnly: true,
                  requireWhiteBg: true,
                });
                return [k, cleaned] as const;
              }),
            );
            return Object.fromEntries(entries);
          })()
        : baseSlides;

      const coasterSlides = prep.isCoastersGrid
        ? (() => {
            const keys = Object.keys(processedCoasterSlides)
              .filter((k) => processedCoasterSlides[k])
              .sort();
            const limited = keys.slice(0, 2);
            return Object.fromEntries(limited.map((k) => [k, processedCoasterSlides[k]]));
          })()
        : processedCoasterSlides;

      const processedMugSlides = prep.isMugWrap
        ? await (async () => {
            const entries = await Promise.all(
              Object.entries(baseSlides as Record<string, string>).map(async ([k, v]) => {
                const src = typeof v === "string" ? v : "";
                if (!src) return [k, v] as const;
                const cleaned = await removeWhiteBg(src, {
                  threshold: 18,
                  alphaThreshold: 8,
                  minBrightness: 245,
                  satThreshold: 10,
                  whiteMinChannel: 240,
                  whiteOnly: true,
                  requireWhiteBg: true,
                  mode: "edge",
                });
                return [k, cleaned] as const;
              }),
            );
            return Object.fromEntries(entries);
          })()
        : baseSlides;

      const bgRemoveOpts = prep.bgRemoveOpts;
      const processedBgSlides = bgRemoveOpts
        ? await (async () => {
            const entries = await Promise.all(
              Object.entries(baseSlides as Record<string, string>).map(async ([k, v]) => {
                const src = typeof v === "string" ? v : "";
                if (!src) return [k, v] as const;
                const cleaned = await removeWhiteBg(src, bgRemoveOpts);
                return [k, cleaned] as const;
              }),
            );
            return Object.fromEntries(entries);
          })()
        : baseSlides;

      const notebookSlides = (() => {
        if (!prep.isNotebookTwoUp) return baseSlides;
        const sourceSlides = processedBgSlides;
        const keys = Object.keys(sourceSlides).filter((k) => sourceSlides[k]);
        if (keys.length >= 2) return sourceSlides;
        if (keys.length === 1) {
          const k = keys[0];
          return { [k]: sourceSlides[k], [`${k}-copy`]: sourceSlides[k] };
        }
        return sourceSlides;
      })();

      const leafletSlides = (() => {
        if (!prep.isLeafletTwoUp) return baseSlides;
        const keys = Object.keys(baseSlides).filter((k) => baseSlides[k]).sort();
        if (keys.length === 0) return baseSlides;
        if (keys.length === 1) {
          const k = keys[0];
          return { slide1: baseSlides[k], slide2: baseSlides[k] };
        }
        const frontKey = keys[0];
        const backKey = keys[1];
        return {
          slide1: baseSlides[frontKey],
          slide2: baseSlides[frontKey],
          slide3: baseSlides[backKey],
          slide4: baseSlides[backKey],
        };
      })();

      const slides = prep.isTenUpBusinessCards
        ? await buildTenUpSlides(baseSlides, {
            columns: 2,
            rows: 5,
            gapPx: 10,
            marginPx: 0,
            orientation: "portrait",
            fit: "cover",
            pageMm: getPageMmForSize(prep.cardSize),
          })
        : prep.isCandlesGrid
        ? await buildFixedGridSlides(processedCandleSlides, {
            columns: 2,
            rows: 3,
            labelMm: { w: 70, h: 70 },
            gapMm: 0,
            distribute: true,
            fit: "contain",
            pageMm: getPageMmForSize(prep.cardSize),
            fillMode: "sequence",
          })
        : prep.isCoastersGrid
        ? await buildFixedGridSlides(coasterSlides, {
            columns: 2,
            rows: 1,
            labelMm: { w: 89, h: 89 },
            gapMm: 0,
            distribute: false,
            fit: "contain",
            pageMm: { w: 229, h: 89 },
            background: "transparent",
            outputFormat: "png",
            fillMode: "sequence",
          })
        : prep.isMugWrap
        ? await buildFixedGridSlides(processedMugSlides, {
            columns: 1,
            rows: 1,
            labelMm: getMugWrapPageMm(prep.cardSize),
            gapMm: 0,
            distribute: false,
            fit: "cover",
            pageMm: getMugWrapPageMm(prep.cardSize),
            background: "transparent",
            outputFormat: "png",
          })
        : prep.isInviteTwoUp
        ? await buildFixedGridSlides(baseSlides, {
            columns: 2,
            rows: 1,
            labelMm: getPageMmForSize(prep.cardSize),
            gapMm: 0,
            distribute: false,
            fit: "contain",
            pageMm: getInviteTwoUpPageMm(prep.cardSize),
          })
        : prep.isNotebookTwoUp
        ? await buildTwoUpSlides(notebookSlides, {
            gapPx: 0,
            orientation: "landscape",
            fit: "contain",
            pairStrategy: "sequential",
            swapPairs: false,
            pageMm: getNotebookTwoUpPageMm(prep.cardSize),
            background: "transparent",
            outputFormat: "png",
          })
        : prep.isLeafletTwoUp
        ? await buildTwoUpSlides(leafletSlides, {
            gapPx: 0,
            orientation: "landscape",
            fit: "cover",
            pairStrategy: "sequential",
            swapPairs: false,
            pageMm: getLeafletTwoUpPageMm(prep.cardSize),
          })
        : prep.isTwoUpLandscape
        ? await buildTwoUpSlides(reorderCardsPdfSlides(baseSlides), {
            gapPx: 0,
            orientation: "landscape",
            fit: "contain",
            slotAlignY: "bottom",
            pairStrategy: "sequential",
            swapPairs: false,
            pageMm: getPageMmForSize(prep.cardSize),
            pageTitle: () => null,
          })
        : processedBgSlides;

      const validSlides = getValidSlides(slides as Record<string, string>);
      if (!Object.keys(validSlides).length) {
        throw new Error("No valid slides found");
      }

      if (canUsePreparedSlidesCache) {
        storePreparedSlidesPayload(prep.cardSize, validSlides);
      }
      return {
        slides: validSlides,
        outputFormat: prep.outputFormat,
        pageOrientation: prep.pageOrientation,
      };
    },
    [
      categoryName,
      ensureSlidesPayload,
      getCheckoutPreparation,
      isStripeReturn,
      isLegacyCardProduct,
      loadPreparedSlidesPayload,
      shouldRenderCardRawForPdf,
      storePreparedSlidesPayload,
    ],
  );

  const prefetchCaptureFormat = useMemo<"png" | "jpeg">(() => {
    const isTransparentCapture =
      /sticker|bag|tote|clothing|clothes|apparel|notebook/i.test(String(categoryName ?? "")) ||
      isCoastersCategory(categoryName) ||
      isMugsCategory;
    return isTransparentCapture ? "png" : "jpeg";
  }, [categoryName, isMugsCategory]);

  useEffect(() => {
    const skipLegacyIosPrefetch =
      isIosWebKit && isLegacyCardProduct && Boolean(firstSlideUrl) && !shouldRenderCardRawForPdf;
    const skipTemplateRegeneration =
      activeTemplatePreviewSession &&
      (hasPreparedTemplatePreviewSlides || isIosWebKit) &&
      !(isIosWebKit && isClothingFromRouteOrStorage);
    const skipStripeStickerRegeneration = lockStripeStickerPreview;
    // Subscription should consume the preview page payload. Re-capturing here can
    // replace a correct mockup with a WebKit partial bitmap.
    if (skipStripeStickerRegeneration) return;
    if (skipTemplateRegeneration) return;
    if (skipLegacyIosPrefetch) return;
    let cancelled = false;
    let frameId: number | null = null;

    const run = async () => {
      try {
        const current = await getSlidesPayload();
        const currentKeys = Object.keys(current || {}).filter((k) => current[k]);
        const expectedCount = rawSlides.length
          ? rawSlides.length
          : isLegacyCardProduct
            ? currentKeys.length > 0
              ? currentKeys.length
              : 4
            : 0;
        const bypassStoredIosPreviewSlides =
          shouldRenderCardRawForPdf ||
          (isIosWebKit && activeTemplatePreviewSession && rawSlides.length > 0) ||
          (isIosWebKit && isClothingFromRouteOrStorage && rawSlides.length > 0);
        const hasEnough = expectedCount ? currentKeys.length >= expectedCount : currentKeys.length > 0;
        const hasPng =
          prefetchCaptureFormat !== "png" ||
          currentKeys.every((k) => String(current[k] || "").startsWith("data:image/png"));
        if (!bypassStoredIosPreviewSlides && hasEnough && hasPng && !isPreviewOnly) return;

        const capturedList = readCapturedSlidesFromStorage();
        const capturedEnough = expectedCount
          ? capturedList.length >= expectedCount
          : capturedList.length > 0;
        const capturedHasPng =
          prefetchCaptureFormat !== "png" ||
          capturedList.every((u) => String(u || "").startsWith("data:image/png"));
        if (!bypassStoredIosPreviewSlides && capturedEnough && capturedHasPng) {
          if (!cancelled) {
            const next = Object.fromEntries(capturedList.map((u, idx) => [`slide${idx + 1}`, u]));
            storeSlidesPayload(next);
          }
          return;
        }

        if (!rawSlides.length && !isLegacyCardProduct && !shouldRenderCardRawForPdf) return;

        await ensureCaptureSupportReady();
        const useCanvasCaptureForTemplate =
          isIosWebKit && activeTemplatePreviewSession && rawSlides.length > 0;
        const list = shouldRenderCardRawForPdf
          ? await captureCardRawSlidesFromCanvasRenderer(
              prefetchCaptureFormat,
              prefetchCaptureFormat === "png" ? 2400 : 1600
            )
          : rawSlides.length
            ? useCanvasCaptureForTemplate
            ? await captureSlidesFromCanvasRenderer(
                prefetchCaptureFormat,
                prefetchCaptureFormat === "png" ? 2400 : 1600
              )
            : await captureSlidesFromDom(prefetchCaptureFormat, prefetchCaptureFormat === "png" ? 2400 : 1600)
            : await captureLegacyCardSlidesFromDom(1600);
        if (cancelled || !list.length) return;
        const next = Object.fromEntries(list.map((u, idx) => [`slide${idx + 1}`, u]));
        if (useCanvasCaptureForTemplate) {
          setIosTemplatePreviewSrc(String(list[0] || ""));
          saveSubscriptionPreviewPayload(next, subscriptionPreviewKey || undefined);
        }
        storeSlidesPayload(next);
      } catch {}
    };

    frameId = window.requestAnimationFrame(() => {
      if (!cancelled) {
        void run();
      }
    });

    return () => {
      cancelled = true;
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [
    captureLegacyCardSlidesFromDom,
    captureCardRawSlidesFromCanvasRenderer,
    captureSlidesFromCanvasRenderer,
    captureSlidesFromDom,
    ensureCaptureSupportReady,
    getSlidesPayload,
    activeTemplatePreviewSession,
    hasPreparedTemplatePreviewSlides,
    isClothingFromRouteOrStorage,
    isIosWebKit,
    isLegacyCardProduct,
    lockStripeStickerPreview,
    isPreviewOnly,
    firstSlideUrl,
    prefetchCaptureFormat,
    rawSlides,
    readCapturedSlidesFromStorage,
    shouldRenderCardRawForPdf,
    storeSlidesPayload,
    subscriptionPreviewKey,
  ]);

  useEffect(() => {
    let cancelled = false;
    let frameId: number | null = null;

    const run = async () => {
      try {
        if (!rawSlides.length && !isLegacyCardProduct) return;
        const current = await getSlidesPayload();
        const validCurrent = getValidSlides(current);
        if (!Object.keys(validCurrent).length) return;
        const prep = getCheckoutPreparation(selectedPlan);
        if (!shouldRenderCardRawForPdf && !isLegacyCardProduct) {
          const cached = await loadPreparedSlidesPayload(prep.cardSize);
          if (cached && Object.keys(cached).length) return;
        }
        await prepareDeliverySlides(prep.cardSize);
      } catch {
        // Best-effort warm cache only.
      }
    };

    frameId = window.requestAnimationFrame(() => {
      if (!cancelled) {
        if (!cancelled) void run();
      }
    });

    return () => {
      cancelled = true;
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [
    getCheckoutPreparation,
    getSlidesPayload,
    isLegacyCardProduct,
    loadPreparedSlidesPayload,
    prepareDeliverySlides,
    rawSlides.length,
    selectedPlan,
    shouldRenderCardRawForPdf,
  ]);

  const sendPdfDirectForSubscription = useCallback(
    async (opts?: { paid?: boolean; sessionId?: string }) => {
      setLoading(true);
      setCheckoutProgressStep(12, "Preparing your design...");
      try {
        const prep = getCheckoutPreparation(localStorage.getItem("selectedSize") || selectedPlan);
        setCheckoutProgressStep(24, "Capturing printable preview...");
        const [token, prepared] = await Promise.all([
          getAccessToken(),
          prepareDeliverySlides(prep.cardSize, (value, label) => setCheckoutProgressStep(value, label)),
        ]);
        if (!token) throw new Error("Login session not found");
        setCheckoutProgressStep(72, "Generating your file...");

        const basePayload = {
          slides: prepared.slides,
          cardSize: prep.cardSize,
          category: categoryName,
          emailSubject: buildEmailSubject(categoryName),
          email_subject: buildEmailSubject(categoryName),
          fileName: buildPdfFileName(categoryName, prepared.outputFormat),
          ...(prepared.outputFormat === "png" ? { outputFormat: prepared.outputFormat } : {}),
          ...(prep.pageOrientation ? { pageOrientation: prep.pageOrientation } : {}),
        };

        const res = await fetch(`${API_BASE}/pdf/send-subscription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...basePayload,
            accessplan: selectedItemAccessPlan,
            inBundleItems: isInBundleItems,
            productKey,
            userPlan: planCode,
            paid: Boolean(opts?.paid),
            payment_session_id: opts?.sessionId ?? null,
            sessionId: opts?.sessionId ?? null,
            session_id: opts?.sessionId ?? null,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `Request failed (HTTP ${res.status})`);
        }

        setCheckoutProgressStep(94, "Sending your file to email...");
        await res.json();
        setCheckoutProgressStep(100, "Done");
        toast.success("File generated & emailed to you!", {
          id: opts?.sessionId ? `file-generated-${opts.sessionId}` : "file-generated-direct",
        });
      } catch (e: any) {
        toast.error(e?.message || "Could not generate file");
      } finally {
        setLoading(false);
        clearCheckoutProgress();
      }
    },
    [
      categoryName,
      clearCheckoutProgress,
      setCheckoutProgressStep,
      selectedItemAccessPlan,
      isInBundleItems,
      productKey,
      selectedPlan,
      planCode,
      getCheckoutPreparation,
      prepareDeliverySlides,
    ]
  );

  // ✅ Stripe return handler (same)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const paid = sp.get("paid") === "1";
    const sessionId = sp.get("session_id") || "";
    if (!paid || !sessionId) return;
    if (processingPaidSessionRef.current === sessionId) return;

    (async () => {
      try {
        processingPaidSessionRef.current = sessionId;
        const sentKey = `payment_email_sent_${sessionId}`;
        const sentState = sessionStorage.getItem(sentKey);
        if (sentState === "1") {
          clearCheckoutProgress();
          clearPaidQueryParams();
          return;
        }
        if (sentState === "sending") {
          setCheckoutProgressStep(42, "Finalizing your file delivery...");
          return;
        }

        setCheckoutProgressStep(18, "Verifying your payment...");
        sessionStorage.setItem(sentKey, "sending");

        const token = await getAccessToken();
        if (token) {
          const verifyRes = await fetch(`${API_BASE}/checkout/one-time/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
          });

          if (!verifyRes.ok) {
            const err = await verifyRes.json().catch(() => ({}));
            throw new Error(err?.error || "Payment verification failed");
          }
        }

        setCheckoutProgressStep(42, "Payment confirmed. Generating your file...");
        await sendPdfDirectForSubscription({ paid: true, sessionId });
        sessionStorage.setItem(sentKey, "1");
        clearPaidQueryParams();
      } catch (e: any) {
        const sentKey = `payment_email_sent_${sessionId}`;
        sessionStorage.removeItem(sentKey);
        toast.error(e?.message || "Payment done but file couldn't be generated");
        clearCheckoutProgress();
        processingPaidSessionRef.current = null;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clearCheckoutProgress,
    clearPaidQueryParams,
    location.search,
    sendPdfDirectForSubscription,
    setCheckoutProgressStep,
  ]);

  const handlePayClick = async () => {
    if (!termsAccepted) {
      toast.error("Please accept Terms & Conditions first.");
      return;
    }

    if (proOnlyLocked) {
      toast.error("This card is only for Pro users. Please upgrade to Pro.");
      navigate(USER_ROUTES.PREMIUM_PLANS);
      return;
    }

    if (planLoading || bundleKeyLoading) {
      toast.error("Please wait, loading your plan...");
      return;
    }

    // ✅ direct
    if (!requiresPayment) {
      await sendPdfDirectForSubscription();
      return;
    }

    const picked = plans.find((p) => String(p.id) === String(selectedPlan));
    if (!picked || picked.disabled) {
      toast.error("No pricing configured for this product.");
      return;
    }

    syncLocalSelection({ id: picked.id, title: picked.title, price: picked.price });
    await startOneTimeStripeCheckout({ title: picked.title, price: picked.price });
  };

  // ✅ Icons
  const showTrophyIcon = selectedItemAccessPlan === "pro";
  const showGiftIcon =
    !showTrophyIcon && selectedItemAccessPlan === "bundle" && planCode === "bundle" && isInBundleItems;


  const isStickerCategory = useMemo(
    () => lc(categoryName).includes("sticker"),
    [categoryName]
  );
  const isCandleCategory = useMemo(
    () => lc(categoryName).includes("candle"),
    [categoryName]
  );
  const isBagCategory = useMemo(
    () => /bag|tote/i.test(String(categoryName ?? "")),
    [categoryName]
  );
  const isClothingCategory = useMemo(
    () => /clothing|clothes|apparel/i.test(String(categoryName ?? "")),
    [categoryName]
  );

  const [firstSlideProcessed, setFirstSlideProcessed] = useState(firstSlideUrl);
  const [hydratedPreviewSrc, setHydratedPreviewSrc] = useState("");

  useEffect(() => {
    let alive = true;
    let idleId: number | null = null;
    const idle = globalThis as any;

    if (!firstSlideUrl) {
      setFirstSlideProcessed("");
      return;
    }

    setFirstSlideProcessed(firstSlideUrl);

    const preservePaidClothingSource =
      isIosDevice && isClothingCategory;
    if (
      preservePaidClothingSource ||
      (!isStickerCategory && !isCandleCategory && !isBagCategory && !isClothingCategory)
    ) {
      return;
    }

    const clothingBgRemoveOpts = {
      threshold: 12,
      alphaThreshold: 8,
      minBrightness: 245,
      satThreshold: 12,
      whiteMinChannel: 242,
      whiteOnly: true,
      requireWhiteBg: true,
      softness: 0,
      mode: "edge" as const,
    };
    const bagBgRemoveOpts = {
      threshold: 18,
      alphaThreshold: 8,
      minBrightness: 246,
      satThreshold: 8,
      whiteMinChannel: 246,
      whiteOnly: true,
      requireWhiteBg: true,
      softness: 0,
      mode: "edge" as const,
    };
    const opts = isCandleCategory
      ? { threshold: 24, alphaThreshold: 8, minBrightness: 235, satThreshold: 16, mode: "all" as const }
      : isBagCategory || isClothingCategory
      ? isClothingCategory
        ? clothingBgRemoveOpts
        : bagBgRemoveOpts
      : { threshold: 28, alphaThreshold: 8, minBrightness: 228, satThreshold: 18 };

    const run = () => {
      removeWhiteBg(firstSlideUrl, opts).then((res) => {
        if (alive) setFirstSlideProcessed(res);
      });
    };

    if (typeof idle.requestIdleCallback === "function") {
      idleId = idle.requestIdleCallback(run, { timeout: 500 });
    } else {
      idleId = window.setTimeout(run, 120);
    }

    return () => {
      alive = false;
      if (typeof idle.cancelIdleCallback === "function" && idleId != null) {
        idle.cancelIdleCallback(idleId);
      } else if (idleId != null) {
        clearTimeout(idleId);
      }
    };
  }, [
    firstSlideUrl,
    isIosDevice,
    isStripeReturn,
    isStickerCategory,
    isCandleCategory,
    isBagCategory,
    isClothingCategory,
  ]);

  const isIosCardMockupFlow = isIosWebKit && isLegacyCardProduct;
  const cardPreviewToPersist = isIosCardMockupFlow
    ? iosLegacyCardPreviewSrc
    : firstSlideProcessed;
  useEffect(() => {
    if (!isLegacyCardProduct || isStripeReturn || !isDataImageUrl(cardPreviewToPersist)) return;
    let cancelled = false;

    const persistPreview = async () => {
      const compressed = await compressPreviewDataUrl(cardPreviewToPersist, {
        maxWidth: 1000,
        maxHeight: 1400,
        quality: 0.82,
      });
      if (cancelled || !isDataImageUrl(compressed)) return;
      setCardMockupPreviewSrc((current) => {
        if (current === compressed) return current;
        writeStoredCardMockupPreviewSrc(cardMockupPreviewStorageKey, compressed);
        return compressed;
      });
    };

    void persistPreview();

    return () => {
      cancelled = true;
    };
  }, [
    cardMockupPreviewStorageKey,
    cardPreviewToPersist,
    isLegacyCardProduct,
    isStripeReturn,
  ]);

  const routePrebuiltCardPreviewSrc = pickSlideByNumber(getValidSlides(state?.slides), cardPreviewSlideNumber);
  const slidesObjPrebuiltCardPreviewSrc = pickSlideByNumber(slidesObj, cardPreviewSlideNumber);
  const stableCardMockupPreviewSrc =
    isIosCardMockupFlow
      ? routeCardRawSlides.length > 0
        // While the verified canvas render is pending, leave previewSrc empty
        // so the complete live raw slide is shown. Never flash a cached partial
        // Safari DOM capture over a known-complete raw model.
        ? iosLegacyCardPreviewSrc || ""
        : iosLegacyCardPreviewSrc ||
          routePrebuiltCardPreviewSrc ||
          slidesObjPrebuiltCardPreviewSrc ||
          cardMockupPreviewSrc ||
          ""
      : cardMockupPreviewSrc ||
        routePrebuiltCardPreviewSrc ||
        slidesObjPrebuiltCardPreviewSrc ||
        "";
  const cardSafePreviewSrc = isIosCardMockupFlow
    ? routeCardRawSlides.length > 0
      ? stableCardMockupPreviewSrc
      : stableCardMockupPreviewSrc || iosLegacyCardPreviewSrc || firstSlideProcessed
    : firstSlideProcessed || iosLegacyCardPreviewSrc;

  useEffect(() => {
    const candidate = mugPreview || cardSafePreviewSrc || "";
    if (!candidate) {
      if (hydratedPreviewSrc) setHydratedPreviewSrc("");
      return;
    }
    if (candidate === hydratedPreviewSrc) return;

    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!cancelled) setHydratedPreviewSrc(candidate);
    };
    img.onerror = () => {
      if (!cancelled) setHydratedPreviewSrc(candidate);
    };
    img.src = candidate;

    return () => {
      cancelled = true;
    };
  }, [cardSafePreviewSrc, hydratedPreviewSrc, mugPreview]);

  // const productName =
  //   product?.title ||
  //   product?.category ||
  //   (() => {
  //     try {
  //       const raw = localStorage.getItem("selectedProduct");
  //       if (!raw) return "product";
  //       const p = JSON.parse(raw);
  //       return p?.title || p?.category || "product";
  //     } catch {
  //       return "product";
  //     }
  //   })();

  // For iOS card mockups, prefer the safe prebuilt Slide1 capture over any
  // older hydrated/cached bitmap that WebKit may have decoded as blank.
  const previewSrc = isIosCardMockupFlow
    ? routeCardRawSlides.length > 0
      ? mugPreview || iosLegacyCardPreviewSrc || ""
      : mugPreview || stableCardMockupPreviewSrc || hydratedPreviewSrc || iosLegacyCardPreviewSrc || ""
    : hydratedPreviewSrc || mugPreview || cardSafePreviewSrc || "";
  const preferLiveTemplatePreview =
    isIosWebKit &&
    activeTemplatePreviewSession &&
    rawSlides.length > 0 &&
    !isLegacyCardProduct &&
    !isBagCategory;
  const routeCardLiveSlide = routeCardRawSlides[cardPreviewSlideIndex] ?? routeCardRawSlides[0] ?? null;
  const preferLiveCardPreview =
    (isLegacyCardProduct || isCardsCategoryPage) &&
    !previewSrc &&
    (legacyCardCaptureEnabled || (isIosWebKit && Boolean(routeCardLiveSlide)));
  const showOverlayPreview =
    Boolean(previewSrc) &&
    useMockupBackground &&
    !preferLiveTemplatePreview &&
    !preferLiveCardPreview;
  const showFlatPreview =
    Boolean(previewSrc) &&
    !useMockupBackground &&
    !preferLiveTemplatePreview &&
    !preferLiveCardPreview;
  const showLiveTemplatePreview =
    activeTemplatePreviewSession && rawSlides.length > 0 && (preferLiveTemplatePreview || !previewSrc);
  const showLiveCardPreview =
    (isLegacyCardProduct || isCardsCategoryPage) &&
    (preferLiveCardPreview || !previewSrc);
  const stripLiveMockupBackground =
    isStickerCategory || isCandleCategory || isBagCategory || isClothingCategory;
  const iosStablePreviewLayerSx = isIosWebKit
    ? {
        backfaceVisibility: "hidden" as const,
        WebkitBackfaceVisibility: "hidden" as const,
        transformStyle: "preserve-3d" as const,
        WebkitTransformStyle: "preserve-3d" as const,
        willChange: "transform",
        ...(isLegacyIosWebKit
          ? {}
          : {
              contain: "paint" as const,
              isolation: "isolate" as const,
            }),
      }
    : {};
  const effectiveMockupOverlay = useMemo(() => {
    if (!mock?.overlay) {
      return { top: "20%", left: "20%", width: "60%", height: "60%" };
    }
    return mock.overlay;
  }, [mock]);

  const liveMockupOverlay = useMemo(() => {
    if (!useMockupBackground || !previewSurfaceSize.w || !previewSurfaceSize.h) return null;
    const overlayWidth = previewSurfaceSize.w * (toPercent(effectiveMockupOverlay.width) / 100);
    const overlayHeight = previewSurfaceSize.h * (toPercent(effectiveMockupOverlay.height) / 100);
    const scaleX = overlayWidth / captureWidth;
    const scaleY = overlayHeight / captureHeight;
    const fit = effectiveMockupOverlay.objectFit ?? "cover";
    const scale =
      fit === "fill"
        ? Math.min(scaleX, scaleY)
        : fit === "cover"
        ? Math.max(scaleX, scaleY)
        : Math.min(scaleX, scaleY);
    const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    const safeScaleX = Number.isFinite(scaleX) && scaleX > 0 ? scaleX : safeScale;
    const safeScaleY = Number.isFinite(scaleY) && scaleY > 0 ? scaleY : safeScale;
    return {
      scale: safeScale,
      scaleX: fit === "fill" ? safeScaleX : safeScale,
      scaleY: fit === "fill" ? safeScaleY : safeScale,
      width: Math.max(1, Math.round(fit === "fill" ? overlayWidth : captureWidth * safeScale)),
      height: Math.max(1, Math.round(fit === "fill" ? overlayHeight : captureHeight * safeScale)),
    };
  }, [
    captureHeight,
    captureWidth,
    effectiveMockupOverlay,
    previewSurfaceSize.h,
    previewSurfaceSize.w,
    useMockupBackground,
  ]);

  const liveCardMockupOverlay = useMemo(() => {
    if (!useMockupBackground || !previewSurfaceSize.w || !previewSurfaceSize.h) return null;
    const overlayWidth = previewSurfaceSize.w * (toPercent(effectiveMockupOverlay.width) / 100);
    const overlayHeight = previewSurfaceSize.h * (toPercent(effectiveMockupOverlay.height) / 100);
    const scaleX = overlayWidth / LEGACY_CARD_CAPTURE.w;
    const scaleY = overlayHeight / LEGACY_CARD_CAPTURE.h;
    return {
      scaleX: Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1,
      scaleY: Number.isFinite(scaleY) && scaleY > 0 ? scaleY : 1,
      width: Math.max(1, Math.round(overlayWidth)),
      height: Math.max(1, Math.round(overlayHeight)),
    };
  }, [effectiveMockupOverlay, previewSurfaceSize.h, previewSurfaceSize.w, useMockupBackground]);

  return (
    <MainLayout>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "start",
          flexDirection: "column",
          justifyContent: "center",
          mt: { md: 4, sm: 3, xs: 2 },
          mb: { md: 4, sm: 3, xs: 2 },
          pb: { md: 8, sm: 6, xs: 6 },

        }}
      >
        <Container maxWidth="xl">
          <Typography
            sx={{
              textAlign: "start",
              fontSize: { md: "40px", sm: "30px", xs: "20px" },
              // fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexWrap: "wrap",
            }}
          >
            Please select your {categoryLabel} print size!
            {showTrophyIcon ? (
              <Chip icon={<EmojiEvents />} label="Pro" color="warning" size="small" sx={{ fontWeight: 900 }} />
            ) : null}

            {showGiftIcon ? (
              <Chip icon={<CardGiftcard />} label="Bundle" color="success" size="small" sx={{ fontWeight: 900 }} />
            ) : null}
          </Typography>

          {/* Alerts */}
          <Box sx={{ mt: 1, mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {isBundleAndMatched && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.green, borderRadius: 2 }}>
                🎁 <b>Bundle matched!</b> This item is included in your bundle. You can generate your PDF without payment.
              </Box>
            )}

            {!isBundleAndMatched && planCode === "bundle" && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.green, borderRadius: 2 }}>
                This product is not included in your bundle → payment required.
              </Box>
            )}

            {planCode === "pro" && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.green, borderRadius: 2 }}>
                🏆 <b>Pro user</b>: PDF generation included ✅
              </Box>
            )}

            {planCode === "free" && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.green, borderRadius: 2 }}>
                🆓 <b>Free user</b>: payment required to generate PDF.
              </Box>
            )}

            {mugPreview && (
              <Box sx={{ p: 1.5, bgcolor: COLORS.black, borderRadius: 2, color: COLORS.white }}>
                📒 <b>MUGS</b>: Preview is mirrored in the downloaded file
              </Box>
            )}
          </Box>

          <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
            {/* Left Preview */}
            <Grid
              ref={previewSurfaceRef}
              size={{ md: 7, sm: 7, xs: 12 }}
              sx={{
                backgroundImage: useMockupBackground
                  ? `url(${mock?.mockupSrc})`
                  : isMugsCategory
                  ? "none"
                  : `url(${TableBgImg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: useMockupBackground ? (isIosWebKit ? "cover" : "100% 100%") : "cover",
                borderRadius: 7,
                border: "1px solid gray",
                position: "relative",
                height: useMockupBackground
                  ? useIosMockupRatioFallback
                    ? 0
                    : "auto"
                  : { md: mugPreview ? 350 : 600, sm: mugPreview ? 350 : 600, xs: 320 },
                paddingTop: iosMockupRatioPadding,
                aspectRatio: mockupAspectRatio,
                overflow: "hidden",
              }}
            >
              {showOverlayPreview ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: effectiveMockupOverlay.top ?? "20%",
                    left: effectiveMockupOverlay.left ?? "20%",
                    width: effectiveMockupOverlay.width ?? "60%",
                    height: effectiveMockupOverlay.height ?? "60%",
                    opacity: effectiveMockupOverlay.opacity ?? 1,
                    filter: effectiveMockupOverlay.filter,
                    clipPath: effectiveMockupOverlay.clipPath,
                    WebkitClipPath: effectiveMockupOverlay.clipPath,
                    borderRadius: effectiveMockupOverlay.borderRadius ?? 0,
                    transform: isIosWebKit ? "translateZ(0)" : undefined,
                    WebkitTransform: isIosWebKit ? "translateZ(0)" : undefined,
                    backfaceVisibility: isIosWebKit ? "hidden" : undefined,
                    WebkitBackfaceVisibility: isIosWebKit ? "hidden" : undefined,
                    ...(effectiveMockupOverlay.sx as any),
                  }}
                >
                  <Box
                    component="img"
                    src={previewSrc}
                    alt="first slide"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: (effectiveMockupOverlay.objectFit as any) ?? "cover",
                      display: "block",
                      userSelect: "none",
                      pointerEvents: "none",
                      transform: isIosWebKit ? "translateZ(0)" : undefined,
                      WebkitTransform: isIosWebKit ? "translateZ(0)" : undefined,
                      backfaceVisibility: isIosWebKit ? "hidden" : undefined,
                      WebkitBackfaceVisibility: isIosWebKit ? "hidden" : undefined,
                    }}
                  />
                </Box>
              ) : showFlatPreview ? (
                <Box
                  component="img"
                  src={previewSrc}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                    transform: isIosWebKit ? "translateZ(0)" : undefined,
                    WebkitTransform: isIosWebKit ? "translateZ(0)" : undefined,
                    backfaceVisibility: isIosWebKit ? "hidden" : undefined,
                    WebkitBackfaceVisibility: isIosWebKit ? "hidden" : undefined,
                  }}
                />
              ) : showLiveTemplatePreview ? (
                useMockupBackground ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: effectiveMockupOverlay.top ?? "20%",
                      left: effectiveMockupOverlay.left ?? "20%",
                      width: effectiveMockupOverlay.width ?? "60%",
                      height: effectiveMockupOverlay.height ?? "60%",
                      opacity: effectiveMockupOverlay.opacity ?? 1,
                      filter: effectiveMockupOverlay.filter,
                      clipPath: effectiveMockupOverlay.clipPath,
                      WebkitClipPath: effectiveMockupOverlay.clipPath,
                      borderRadius: effectiveMockupOverlay.borderRadius ?? 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      ...(effectiveMockupOverlay.sx as any),
                    }}
                  >
                    {liveMockupOverlay ? (
                      <Box
                        sx={{
                          width: liveMockupOverlay.width,
                          height: liveMockupOverlay.height,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: captureWidth,
                            height: captureHeight,
                            position: "absolute",
                            inset: 0,
                            transform: `scale(${liveMockupOverlay.scaleX}, ${liveMockupOverlay.scaleY})`,
                            transformOrigin: "top left",
                          }}
                        >
                          {renderSlide(rawSlides[0], {
                            stripBackground: stripLiveMockupBackground,
                            transparentCanvas: stripLiveMockupBackground,
                          })}
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: "88%",
                        maxHeight: "100%",
                        aspectRatio: `${captureWidth} / ${captureHeight}`,
                        bgcolor: rawSlides[0]?.bgColor ?? "#ffffff",
                        borderRadius: 2,
                        boxShadow: 2,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {renderSlide(rawSlides[0])}
                    </Box>
                  </Box>
                )
              ) : showLiveCardPreview ? (
                useMockupBackground && liveCardMockupOverlay ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: effectiveMockupOverlay.top ?? "20%",
                      left: effectiveMockupOverlay.left ?? "20%",
                      width: effectiveMockupOverlay.width ?? "60%",
                      height: effectiveMockupOverlay.height ?? "60%",
                      opacity: effectiveMockupOverlay.opacity ?? 1,
                      filter: effectiveMockupOverlay.filter,
                      clipPath: effectiveMockupOverlay.clipPath,
                      WebkitClipPath: effectiveMockupOverlay.clipPath,
                      borderRadius: effectiveMockupOverlay.borderRadius ?? 0,
                      overflow: "hidden",
                      transform: isIosWebKit ? "translateZ(0)" : undefined,
                      WebkitTransform: isIosWebKit ? "translateZ(0)" : undefined,
                      ...iosStablePreviewLayerSx,
                      ...(effectiveMockupOverlay.sx as any),
                    }}
                  >
                    <Box
                      sx={{
                        width: liveCardMockupOverlay.width,
                        height: liveCardMockupOverlay.height,
                        position: "relative",
                        overflow: "hidden",
                        transform: isIosWebKit ? "translateZ(0)" : undefined,
                        WebkitTransform: isIosWebKit ? "translateZ(0)" : undefined,
                        ...iosStablePreviewLayerSx,
                      }}
                    >
                      <Box
                        sx={{
                          width: LEGACY_CARD_CAPTURE.w,
                          height: LEGACY_CARD_CAPTURE.h,
                          position: "absolute",
                          inset: 0,
                          transform: `${isIosWebKit ? "translateZ(0) " : ""}scale(${liveCardMockupOverlay.scaleX}, ${liveCardMockupOverlay.scaleY})`,
                          transformOrigin: "top left",
                          WebkitTransform: `${isIosWebKit ? "translateZ(0) " : ""}scale(${liveCardMockupOverlay.scaleX}, ${liveCardMockupOverlay.scaleY})`,
                          ...iosStablePreviewLayerSx,
                        }}
                      >
                        <Box sx={iosStablePreviewLayerSx}>
                          {routeCardLiveSlide ? (
                            renderSlide(routeCardLiveSlide)
                          ) : previewSrc ? (
                            <Box
                              component="img"
                              src={previewSrc}
                              alt="card preview"
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block",
                                userSelect: "none",
                                pointerEvents: "none",
                                transform: isIosWebKit ? "translateZ(0)" : undefined,
                                WebkitTransform: isIosWebKit ? "translateZ(0)" : undefined,
                                backfaceVisibility: isIosWebKit ? "hidden" : undefined,
                                WebkitBackfaceVisibility: isIosWebKit ? "hidden" : undefined,
                              }}
                            />
                          ) : (
                            <Slide1 />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: { md: 360, sm: 320, xs: 220 },
                        aspectRatio: `${LEGACY_CARD_CAPTURE.w} / ${LEGACY_CARD_CAPTURE.h}`,
                        bgcolor: "#ffffff",
                        borderRadius: 2,
                        boxShadow: 2,
                        overflow: "hidden",
                        position: "relative",
                        transform: isIosWebKit ? "translateZ(0)" : undefined,
                        WebkitTransform: isIosWebKit ? "translateZ(0)" : undefined,
                        ...iosStablePreviewLayerSx,
                      }}
                      >
                        <Box sx={iosStablePreviewLayerSx}>
                        {routeCardLiveSlide ? (
                          renderSlide(routeCardLiveSlide)
                        ) : previewSrc ? (
                          <Box
                            component="img"
                            src={previewSrc}
                            alt="card preview"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              display: "block",
                              userSelect: "none",
                              pointerEvents: "none",
                              transform: isIosWebKit ? "translateZ(0)" : undefined,
                              WebkitTransform: isIosWebKit ? "translateZ(0)" : undefined,
                              backfaceVisibility: isIosWebKit ? "hidden" : undefined,
                              WebkitBackfaceVisibility: isIosWebKit ? "hidden" : undefined,
                            }}
                          />
                        ) : (
                          <Slide1 />
                        )}
                        </Box>
                      </Box>
                    </Box>
                )
              ) : (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(0,0,0,0.6)",
                    fontWeight: 700,
                    bgcolor: "rgba(255,255,255,0.25)",
                  }}
                >
                  No preview found
                </Box>
              )}
            </Grid>

            {/* Right - Plans */}
            <Grid
              size={{ md: 5, sm: 5, xs: 12 }}
              sx={{ display: "flex", flexDirection: "column", gap: "25px", textAlign: "start" }}
            >
              <Box sx={{ p: { md: 2, sm: 2, xs: "5px" }, bgcolor: COLORS.primary, borderRadius: 2 }}>
                <Typography variant="h5">🎉 Your {categoryLabel} design is ready for checkout!</Typography>

                <Typography sx={{ fontSize: 14, mt: 1, opacity: 0.8 }}>
                  {planLoading || bundleKeyLoading
                    ? "Checking your plan..."
                    : proOnlyLocked
                      ? "This card is Pro-only. Please upgrade to Pro to generate PDF."
                      : isBundleAndMatched
                        ? "Bundle matched by ID. You can generate your PDF without payment."
                        : planCode === "pro"
                          ? "Pro user: PDF generation included."
                          : planCode === "bundle"
                            ? "Bundle user: payment required for this item."
                            : "Free users need to complete payment to receive PDF."}
                </Typography>
              </Box>

              {checkoutProgress.active && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.12)",
                    bgcolor: "rgba(86, 190, 204, 0.12)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>Checkout progress</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{checkoutProgress.value}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={checkoutProgress.value}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor: "rgba(0,0,0,0.08)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        backgroundColor: COLORS.seconday,
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: 13, mt: 1, opacity: 0.85 }}>
                    {checkoutProgress.label}
                  </Typography>
                </Box>
              )}

              {!plans.length ? (
                <Typography sx={{ color: "text.secondary" }}>No sizes configured for this category.</Typography>
              ) : (
                plans.map((p) => {
                  const isSelected = String(selectedPlan) === String(p.id);

                  return (
                    <Box
                      key={String(p.id)}
                      onClick={() => {
                        if (p.disabled) return;
                        setSelectedPlan(p.id as any);
                        syncLocalSelection({ id: p.id, title: p.title, price: p.price });
                      }}
                      sx={{
                        ...isActivePay,
                        border: `3px solid ${isSelected ? "#004099" : "transparent"}`,
                        cursor: p.disabled ? "not-allowed" : "pointer",
                        opacity: proOnlyLocked ? 0.7 : p.disabled ? 0.55 : 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <input
                          type="radio"
                          name="plan"
                          disabled={p.disabled}
                          checked={isSelected}
                          onChange={() => {
                            if (p.disabled) return;
                            setSelectedPlan(p.id as any);
                          }}
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: { md: 900, sm: 900, xs: 700 } }}>{p.title}</Typography>
                          {p.sub ? <Typography sx={{ fontSize: 12, opacity: 0.85 }}>{p.sub}</Typography> : null}

                          {p.disabled ? (
                            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>Not available</Typography>
                          ) : proOnlyLocked ? (
                            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>Pro-only</Typography>
                          ) : requiresPayment ? (
                            <Typography sx={{ fontSize: { md: "auto", sm: "auto", xs: "15px" } }}>
                              £{p.price.toFixed(2)}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: { md: "auto", sm: "auto", xs: "15px" }, fontWeight: 900 }}>
                              Included
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {p.disabled ? (
                        <Typography variant="h5">—</Typography>
                      ) : proOnlyLocked ? (
                        <Typography variant="h5">—</Typography>
                      ) : requiresPayment ? (
                        <Typography variant="h5">£{p.price.toFixed(2)}</Typography>
                      ) : (
                        <Typography variant="h5">£0</Typography>
                      )}
                    </Box>
                  );
                })
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ width: "20px", height: "20px" }}
                />
                <Typography sx={{ fontSize: "14px", color: termsAccepted ? "gray" : "#d32f2f" }}>
                  I accept the Terms & Conditions and give my consent to proceed with the order.
                </Typography>
              </Box>

              <Button
                fullWidth
                onClick={handlePayClick}
                sx={{
                  borderRadius: "8px",
                  py: 1.5,
                  fontSize: 20,
                  textTransform: "none",
                  backgroundColor: COLORS.primary,
                  color: COLORS.black,
                  "&:hover": {
                    backgroundColor: COLORS.seconday,
                    opacity: 0.9,
                  },
                }}
              >
                {planLoading || bundleKeyLoading || loading
                  ? "Loading..."
                  : proOnlyLocked
                    ? "Go to Premium Plans"
                    : requiresPayment
                      ? "Pay & Get your File!"
                      : "Generate PDF"}
              </Button>

              {planCode === "pro" ? null : (
                <LandingButton
                  title={"Want unlimited? Upgrade to Bundle/Pro"}
                  variant="outlined"
                  personal
                  width="100%"
                  onClick={() => navigate(USER_ROUTES.PREMIUM_PLANS)}
                />
              )}
            </Grid>
          </Grid>

          {captureSupportEnabled && rawSlides.length > 0 && (
            <Box
              sx={{
                position: "fixed",
                left: "-10000px",
                top: 0,
                opacity: 1,
                pointerEvents: "none",
                zIndex: 0,
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
              }}
            >
              {rawSlides.map((sl, i) => (
                <Box
                  key={sl.id ?? i}
                  ref={setSlideNodeRef(i)}
                  sx={{ width: captureWidth, height: captureHeight, position: "relative" }}
                >
                  {renderSlide(sl)}
                </Box>
              ))}
            </Box>
          )}

          {legacyCardCaptureEnabled && isLegacyCardProduct && (
            <Box
              sx={{
                position: "fixed",
                left: 0,
                top: 0,
                opacity: 0.01,
                pointerEvents: "none",
                zIndex: -1,
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
              }}
            >
              <Box sx={{ width: LEGACY_CARD_CAPTURE.w, height: LEGACY_CARD_CAPTURE.h }}>
                <Slide1 ref={setLegacyCardNodeRef(0)} />
              </Box>
              <Box sx={{ width: LEGACY_CARD_CAPTURE.w, height: LEGACY_CARD_CAPTURE.h }}>
                <Slide2 ref={setLegacyCardNodeRef(1)} />
              </Box>
              <Box sx={{ width: LEGACY_CARD_CAPTURE.w, height: LEGACY_CARD_CAPTURE.h }}>
                <Slide3 ref={setLegacyCardNodeRef(2)} />
              </Box>
              <Box sx={{ width: LEGACY_CARD_CAPTURE.w, height: LEGACY_CARD_CAPTURE.h }}>
                <Slide4 ref={setLegacyCardNodeRef(3)} />
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
};

export default Subscription;
