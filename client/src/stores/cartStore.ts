import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SizeKey = "a4" | "a3" | "us_letter";

export type PriceTable = Record<SizeKey, number>;

export type CartItem = {
  id: string | number;
  type: "card" | "template";
  img?: string;
  title?: string;
  category?: string;

  selectedSize: SizeKey;

  prices: {
    actual: PriceTable;
    sale?: Partial<PriceTable>;
  };

  isOnSale: boolean;
  displayPrice: number;

   polygonlayout?: any;      // card editor
  rawStores?: any;          // template editor (your rawStores)
  templetDesign?: any; 
};

type AddResult = { ok: true } | { ok: false; reason: "exists" | "invalid" };

type CartState = {
  cart: CartItem[];
  addToCart: (item: CartItem) => AddResult;
  updateCartItem: (
    id: string | number,
    type: CartItem["type"],
    patch: Partial<CartItem>
  ) => void;
  removeFromCart: (id: string | number, type?: CartItem["type"]) => void;
  clearCart: () => void;
  hasItem: (id: string | number, type: CartItem["type"]) => boolean;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      hasItem: (id, type) =>
        get().cart.some((x) => String(x.id) === String(id) && x.type === type),

      addToCart: (item) => {
        if (!item?.id) return { ok: false, reason: "invalid" };
        if (get().hasItem(item.id, item.type))
          return { ok: false, reason: "exists" };
        set((s) => ({ cart: [...s.cart, item] }));
        return { ok: true };
      },

      updateCartItem: (id, type, patch) => {
        set((s) => ({
          cart: s.cart.map((x) => {
            if (String(x.id) !== String(id) || x.type !== type) return x;
            return { ...x, ...patch };
          }),
        }));
      },

      removeFromCart: (id, type) => {
        set((s) => ({
          cart: s.cart.filter((x) => {
            const sameId = String(x.id) === String(id);
            if (!sameId) return true;
            if (!type) return false;
            return x.type !== type;
          }),
        }));
      },

      clearCart: () => set({ cart: [] }),
    }),
    { name: "cart-store-v2" }
  )
);
