import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Product = {
  id?: number | string;
  img?: string;
  title?: string;
  category?: string;
  price?: number | string;
};

interface CartState {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  setCart: (cart: Product[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],

      setCart: (cart) => set({ cart }),

      addToCart: (product: Product) => {
        set((state) => ({ cart: [...state.cart, product] }));
      },

      removeFromCart: (id: string | number) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id)
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
