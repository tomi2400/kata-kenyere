import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  termekId: string;
  nev: string;
  ar: number;
  egyseg: string;
  mennyiseg: number;
  fotoUrl: string;
};

export type DayCart = {
  nap: string;
  datum: string;
  items: CartItem[];
};

type CartStore = {
  selectedDays: { nap: string; datum: string }[];
  carts: Record<string, CartItem[]>; // datum -> items
  currentStep: number;
  setSelectedDays: (days: { nap: string; datum: string }[]) => void;
  setCurrentStep: (step: number) => void;
  setQuantity: (datum: string, item: Omit<CartItem, "mennyiseg">, qty: number) => void;
  getTotal: () => number;
  getDayTotal: (datum: string) => number;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      selectedDays: [],
      carts: {},
      currentStep: 0,

      setSelectedDays: (days) => set({ selectedDays: days, currentStep: 0 }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setQuantity: (datum, item, qty) =>
        set((state) => {
          const dayItems = state.carts[datum] ?? [];
          const existing = dayItems.find((i) => i.termekId === item.termekId);

          let updated: CartItem[];
          if (qty === 0) {
            updated = dayItems.filter((i) => i.termekId !== item.termekId);
          } else if (existing) {
            updated = dayItems.map((i) =>
              i.termekId === item.termekId ? { ...i, mennyiseg: qty } : i
            );
          } else {
            updated = [...dayItems, { ...item, mennyiseg: qty }];
          }

          return { carts: { ...state.carts, [datum]: updated } };
        }),

      getDayTotal: (datum) => {
        const items = get().carts[datum] ?? [];
        return items.reduce((sum, i) => sum + i.ar * i.mennyiseg, 0);
      },

      getTotal: () => {
        const { carts } = get();
        return Object.values(carts)
          .flat()
          .reduce((sum, i) => sum + i.ar * i.mennyiseg, 0);
      },

      clearCart: () => set({ selectedDays: [], carts: {}, currentStep: 0 }),
    }),
    { name: "kata-kenyere-cart" }
  )
);
