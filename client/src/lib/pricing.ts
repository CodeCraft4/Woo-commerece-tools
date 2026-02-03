import type { PriceTable, SizeKey } from "../stores/cartStore";

export const sizeLabel = (k: SizeKey) => {
  switch (k) {
    case "a5":
      return "A5";
    case "a4":
      return "A4";
    case "a3":
      return "A3";
    case "half_us_letter":
      return "Half US Letter";
    case "us_letter":
      return "US Letter";
    case "us_tabloid":
      return "US Tabloid";
    case "mug_wrap_11oz":
      return "11oz Mug Wrap";
    case "coaster_95":
      return "95mm Coaster";
    default:
      return String(k);
  }
};

export const toNumberSafe = (v: any, fallback = 0) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

export const hasSaleValue = (v: any) => {
  const n = toNumberSafe(v, 0);
  return Number.isFinite(n) && n > 0;
};

export const pickPrice = (
  actual: PriceTable,
  sale: Partial<PriceTable> | undefined,
  size: SizeKey,
) => {
  const saleN = sale ? sale[size] : undefined;
  const useSale = hasSaleValue(saleN);
  return { price: useSale ? Number(saleN) : actual[size], isOnSale: useSale };
};

export type SizeKeyConfig =
  | "A5"
  | "A4"
  | "A3"
  | "US_LETTER"
  | "HALF_US_LETTER"
  | "US_TABLOID"
  | "MUG_WRAP_11OZ"
  | "COASTER_95";

export type SizeDef = { key: any; title: string; sub?: string };

export const getPricingConfig = (
  categoryName?: string,
): { sizes: SizeDef[] } => {
  const name = (categoryName ?? "").trim().toLowerCase();

  if (name.includes("invite")) {
    return {
      sizes: [
        { key: "A5", title: "A5", sub: "2 per A4 sheet" },
        { key: "A4", title: "A4", sub: "1 per A4 sheet" },
        {
          key: "HALF_US_LETTER",
          title: "Half US Letter",
          sub: "2 per US Letter sheet",
        },
        { key: "US_LETTER", title: "US Letter", sub: "1 per US Letter sheet" },
      ],
    };
  }

  if (name.includes("clothing"))
    return {
      sizes: [
        { key: "A4", title: "A4" },
        { key: "A3", title: "A3" },
        { key: "US_LETTER", title: "US Letter" },
        { key: "US_TABLOID", title: "US Tabloid (11×17)" },
      ],
    };
  if (name.includes("mug"))
    return {
      sizes: [{ key: "MUG_WRAP_11OZ", title: "228mm × 88.9mm (11oz mug)" }],
    };
  if (name.includes("coaster"))
    return { sizes: [{ key: "COASTER_95", title: "95mm × 95mm (×2)" }] };
  if (name.includes("sticker"))
    return {
      sizes: [
        { key: "A4", title: "A4" },
        { key: "A3", title: "A3" },
        { key: "US_LETTER", title: "US Letter" },
      ],
    };
  if (name.includes("notebook"))
    return {
      sizes: [
        { key: "A5", title: "A5" },
        { key: "A4", title: "A4" },
        { key: "HALF_US_LETTER", title: "Half US Letter" },
        { key: "US_LETTER", title: "US Letter" },
      ],
    };
  if (name.includes("wall art"))
    return {
      sizes: [
        { key: "A4", title: "A4" },
        { key: "A3", title: "A3" },
        { key: "US_LETTER", title: "US Letter" },
        { key: "US_TABLOID", title: "US Tabloid (11×17)" },
      ],
    };
  if (name.includes("photo art"))
    return {
      sizes: [
        { key: "A4", title: "A4" },
        { key: "A3", title: "A3" },
        { key: "US_LETTER", title: "US Letter" },
        { key: "US_TABLOID", title: "US Tabloid (11×17)" },
      ],
    };
  if (name.includes("bag"))
    return {
      sizes: [
        { key: "A4", title: "A4" },
        { key: "A3", title: "A3" },
        { key: "US_LETTER", title: "US Letter" },
        { key: "US_TABLOID", title: "US Tabloid (11×17)" },
      ],
    };

  // Default Cards
  return {
    sizes: [
      { key: "A5", title: "A3" },
      { key: "A4", title: "A4" },
      // { key: "HALF_US_LETTER", title: "Half US Letter" },
      { key: "US_LETTER", title: "US Letter" },
      // { key: "US_TABLOID", title: "US Tabloid", sub: "Folded half: 11 × 8.5 in" },
    ],
  };
};
