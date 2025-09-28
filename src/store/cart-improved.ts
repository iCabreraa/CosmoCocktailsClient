import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Cart } from "@/types/shared";

interface CartState extends Cart {
  // Acciones del carrito
  addItem: (item: Omit<CartItem, "id" | "item_total">) => void;
  removeItem: (cocktailId: string, sizeId: string) => void;
  updateQuantity: (
    cocktailId: string,
    sizeId: string,
    quantity: number
  ) => void;
  clearCart: () => void;

  // Validación y cálculos
  validateInventory: () => Promise<boolean>;
  recalculateTotals: () => void;

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
      isLoading: false,
      error: null,

      // Agregar item al carrito
      addItem: newItem => {
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
      removeItem: (cocktailId, sizeId) => {
        const state = get();
        const filteredItems = state.items.filter(
          item => !(item.cocktail_id === cocktailId && item.sizes_id === sizeId)
        );

        set({ items: filteredItems });
        get().recalculateTotals();
      },

      // Actualizar cantidad de un item
      updateQuantity: (cocktailId, sizeId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cocktailId, sizeId);
          return;
        }

        const state = get();
        const updatedItems = state.items.map(item => {
          if (item.cocktail_id === cocktailId && item.sizes_id === sizeId) {
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
        });
      },

      // Validar inventario
      validateInventory: async () => {
        set({ isLoading: true, error: null });

        try {
          const state = get();

          // Aquí implementarías la validación real con la API
          // Por ahora, simulamos que siempre hay stock
          const hasStock = state.items.every(item => item.quantity > 0);

          if (!hasStock) {
            set({ error: "Algunos productos no están disponibles" });
            return false;
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            error: "Error al validar inventario",
            isLoading: false,
          });
          return false;
        }
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
      }),
    }
  )
);

// Selectores útiles
export const useCartItems = () => useCart(state => state.items);
export const useCartTotals = () =>
  useCart(state => ({
    subtotal: state.subtotal,
    vat_amount: state.vat_amount,
    shipping_cost: state.shipping_cost,
    total: state.total,
    item_count: state.item_count,
  }));
export const useCartActions = () =>
  useCart(state => ({
    addItem: state.addItem,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
    clearCart: state.clearCart,
    validateInventory: state.validateInventory,
  }));
export const useCartState = () =>
  useCart(state => ({
    isLoading: state.isLoading,
    error: state.error,
  }));
