import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Cart } from "@/types/shared";

interface CartState extends Cart {
  // Acciones del carrito
  addToCart: (item: Omit<CartItem, "id" | "item_total">) => void;
  removeFromCart: (cocktailId: string, sizesId: string) => void;
  updateQuantity: (
    cocktailId: string,
    sizesId: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  recalculateTotals: () => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  privacyAccepted: boolean;
  setPrivacyAccepted: (value: boolean) => void;

  // Estado de carga
  isLoading: boolean;
  error: string | null;
}

const VAT_RATE = 0.21; // 21% IVA
const SHIPPING_THRESHOLD = 50; // Envío gratis a partir de 50€
const SHIPPING_COST = 4.99; // Costo de envío

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      items: [],
      subtotal: 0,
      vat_amount: 0,
      shipping_cost: 0,
      total: 0,
      item_count: 0,
      hasHydrated: false,
      isLoading: false,
      error: null,
      privacyAccepted: false,

      // Agregar item al carrito
      addToCart: newItem => {
        const state = get();
        const existingItemIndex = state.items.findIndex(
          item =>
            item.cocktail_id === newItem.cocktail_id &&
            item.sizes_id === newItem.sizes_id
        );

        if (existingItemIndex >= 0) {
          // Actualizar cantidad del item existente
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          updatedItems[existingItemIndex].item_total =
            updatedItems[existingItemIndex].quantity *
            updatedItems[existingItemIndex].unit_price;

          set({ items: updatedItems });
        } else {
          // Agregar nuevo item
          const itemTotal = newItem.quantity * newItem.unit_price;
          const newCartItem: CartItem = {
            id: `${newItem.cocktail_id}-${newItem.sizes_id}`,
            ...newItem,
            item_total: itemTotal,
          };

          set({ items: [...state.items, newCartItem] });
        }

        // Recalcular totales
        get().recalculateTotals();
      },

      // Remover item del carrito
      removeFromCart: (cocktailId, sizesId) => {
        const state = get();
        const filteredItems = state.items.filter(
          item =>
            !(item.cocktail_id === cocktailId && item.sizes_id === sizesId)
        );

        set({ items: filteredItems });
        get().recalculateTotals();
      },

      // Actualizar cantidad de un item
      updateQuantity: (cocktailId, sizesId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cocktailId, sizesId);
          return;
        }

        const state = get();
        const updatedItems = state.items.map(item => {
          if (item.cocktail_id === cocktailId && item.sizes_id === sizesId) {
            return {
              ...item,
              quantity,
              item_total: quantity * item.unit_price,
            };
          }
          return item;
        });

        set({ items: updatedItems });
        get().recalculateTotals();
      },

      // Limpiar carrito
      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          vat_amount: 0,
          shipping_cost: 0,
          total: 0,
          item_count: 0,
          error: null,
          privacyAccepted: false,
        });
      },

      // Recalcular totales
      recalculateTotals: () => {
        const state = get();

        // Calcular subtotal
        const subtotal = state.items.reduce(
          (sum, item) => sum + item.item_total,
          0
        );

        // Calcular IVA
        const vat_amount = subtotal * VAT_RATE;

        // Calcular envío
        const shipping_cost =
          subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

        // Calcular total
        const total = subtotal + vat_amount + shipping_cost;

        // Contar items
        const item_count = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        set({
          subtotal: Number(subtotal.toFixed(2)),
          vat_amount: Number(vat_amount.toFixed(2)),
          shipping_cost: Number(shipping_cost.toFixed(2)),
          total: Number(total.toFixed(2)),
          item_count,
        });
      },
      setHasHydrated: value => {
        set({ hasHydrated: value });
      },
      setPrivacyAccepted: value => {
        set({ privacyAccepted: value });
      },
    }),
    {
      name: "cosmic-cocktails-cart",
      // Solo persistir los items, no el estado de carga
      partialize: state => ({
        items: state.items,
        subtotal: state.subtotal,
        vat_amount: state.vat_amount,
        shipping_cost: state.shipping_cost,
        total: state.total,
        item_count: state.item_count,
        privacyAccepted: state.privacyAccepted,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating cart:", error);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
