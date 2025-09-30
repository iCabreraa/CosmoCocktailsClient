"use client";

import { useState, useEffect } from "react";
import { useCocktailSizes } from "@/hooks/queries/useInventory";
import { useCart } from "@/store/cart";
import { Cocktail } from "@/types/shared";
import { CocktailSizesRow } from "@/types";
import { ShoppingCart, Plus, Minus } from "lucide-react";

interface AddToCartButtonProps {
  cocktail: Cocktail;
}

export default function AddToCartButtonOptimized({
  cocktail,
}: AddToCartButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<CocktailSizesRow | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  // Usar React Query para obtener tamaños
  const {
    data: sizes = [],
    isLoading,
    error,
    refetch,
  } = useCocktailSizes(cocktail.id);

  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, selectedSize]);

  function handleSelect(size: CocktailSizesRow) {
    setSelectedSize(size);
    setQuantity(1);
  }

  function handleAddToCart() {
    if (!selectedSize) return;

    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("🛒 Adding to cart:", {
        cocktail_id: cocktail.id,
        sizes_id: selectedSize.sizes_id,
        cocktail_name: cocktail.name,
        size_name:
          selectedSize.sizes.name ?? `${selectedSize.sizes.volume_ml}ml`,
        price: selectedSize.price,
      });
    }

    addToCart({
      cocktail_id: cocktail.id,
      sizes_id: selectedSize.sizes_id,
      quantity,
      unit_price: selectedSize.price,
      cocktail_name: cocktail.name,
      size_name: selectedSize.sizes.name ?? `${selectedSize.sizes.volume_ml}ml`,
      volume_ml: selectedSize.sizes.volume_ml,
      image_url: cocktail.image_url,
    });
    setOpen(false);
  }

  if (isLoading) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold/50 text-cosmic-gold/50 cursor-not-allowed"
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        Cargando...
      </button>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500 text-sm mb-2">Error cargando tamaños</p>
        <button
          onClick={() => refetch()}
          className="text-cosmic-gold hover:text-cosmic-gold/80 text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (sizes.length === 0) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold/50 text-cosmic-gold/50 cursor-not-allowed"
      >
        <ShoppingCart className="w-4 h-4" />
        No disponible
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition-all"
      >
        <ShoppingCart className="w-4 h-4" />
        Añadir al Carrito
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cosmic-bg border border-cosmic-gold/30 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-cosmic-gold">
                {cocktail.name}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-cosmic-fog hover:text-cosmic-gold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Selección de tamaño */}
              <div>
                <label className="block text-sm font-medium text-cosmic-text mb-2">
                  Tamaño
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {sizes.map(size => (
                    <button
                      key={size.sizes_id}
                      onClick={() => handleSelect(size)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedSize?.sizes_id === size.sizes_id
                          ? "border-cosmic-gold bg-cosmic-gold/10"
                          : "border-cosmic-fog/30 hover:border-cosmic-gold/50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-cosmic-text">
                            {size.sizes.name || `${size.sizes.volume_ml}ml`}
                          </div>
                          <div className="text-sm text-cosmic-fog">
                            Stock: {size.stock_quantity}
                          </div>
                        </div>
                        <div className="text-cosmic-gold font-semibold">
                          €{size.price.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selección de cantidad */}
              {selectedSize && (
                <div>
                  <label className="block text-sm font-medium text-cosmic-text mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg border border-cosmic-fog/30 hover:border-cosmic-gold/50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 bg-cosmic-gold/10 rounded-lg min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(selectedSize.stock_quantity, quantity + 1)
                        )
                      }
                      className="p-2 rounded-lg border border-cosmic-fog/30 hover:border-cosmic-gold/50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-cosmic-fog mt-1">
                    Máximo: {selectedSize.stock_quantity}
                  </p>
                </div>
              )}

              {/* Total */}
              {selectedSize && (
                <div className="border-t border-cosmic-fog/20 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-cosmic-text">Total:</span>
                    <span className="text-cosmic-gold">
                      €{(selectedSize.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 border border-cosmic-fog/30 text-cosmic-text rounded-lg hover:border-cosmic-gold/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="flex-1 px-4 py-2 bg-cosmic-gold text-black rounded-lg hover:bg-cosmic-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Añadir al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
