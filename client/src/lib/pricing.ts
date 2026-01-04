import type { PriceTable, SizeKey } from "../stores/cartStore";

export const sizeLabel = (k: SizeKey) => (k === "a4" ? "A4" : k === "a3" ? "A3" : "US Letter");

export const toNumberSafe = (v: any, fallback = 0) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

export const hasSaleValue = (v: any) => {
  const n = toNumberSafe(v, 0);
  return Number.isFinite(n) && n > 0;
};

export const pickPrice = (actual: PriceTable, sale: Partial<PriceTable> | undefined, size: SizeKey) => {
  const saleN = sale ? sale[size] : undefined;
  const useSale = hasSaleValue(saleN);
  return { price: useSale ? Number(saleN) : actual[size], isOnSale: useSale };
};