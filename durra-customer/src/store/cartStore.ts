import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  dressId: string;
  dressName: string;
  image: string;
  pricePerDay: number;
  startDate: string;
  endDate: string;
  size: string;
  availableSizes?: string[];  // المقاسات المتاحة للفستان
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (dressId: string) => void;
  updateItem: (dressId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  hasItem: (dressId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        // ما نكرر نفس الفستان
        if (state.items.some(i => i.dressId === item.dressId)) return state;
        return { items: [...state.items, item] };
      }),
      removeItem: (dressId) => set((state) => ({
        items: state.items.filter(i => i.dressId !== dressId),
      })),
      updateItem: (dressId, updates) => set((state) => ({
        items: state.items.map(i => i.dressId === dressId ? { ...i, ...updates } : i),
      })),
      clearCart: () => set({ items: [] }),
      hasItem: (dressId) => get().items.some(i => i.dressId === dressId),
    }),
    { name: "durra-cart" }   // يُحفظ في localStorage
  )
);
