import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Lightweight cart item for client-side state */
export interface ClientCartItem {
  id: string; // generated locally
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  name: string;
  image: string | null;
  store_id: string;
  store_name: string;
}

interface CartState {
  items: ClientCartItem[];
  addItem: (item: Omit<ClientCartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  itemsByStore: () => Map<string, { storeName: string; items: ClientCartItem[] }>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product_id === item.product_id &&
              i.variant_id === item.variant_id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          const id = `${item.product_id}-${item.variant_id || "default"}-${Date.now()}`;
          return { items: [...state.items, { ...item, id }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemsByStore: () => {
        const grouped = new Map<
          string,
          { storeName: string; items: ClientCartItem[] }
        >();
        get().items.forEach((item) => {
          if (!grouped.has(item.store_id)) {
            grouped.set(item.store_id, {
              storeName: item.store_name,
              items: [],
            });
          }
          grouped.get(item.store_id)!.items.push(item);
        });
        return grouped;
      },
    }),
    { name: "plantora-cart" }
  )
);
