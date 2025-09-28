"use client";

import { useInventoryValidation } from "@/hooks/queries/useInventory";
import { CartItem } from "@/types/shared";
import { useEffect, useState } from "react";

interface InventoryValidationProps {
  items: CartItem[];
  onValidationComplete: (isValid: boolean, unavailableItems: string[]) => void;
}

interface ValidationResult {
  cocktail_id: string;
  sizes_id: string;
  cocktail_name: string;
  size_name: string;
  available: boolean;
  stock_quantity: number;
  requested_quantity: number;
  max_available: number;
}

export default function InventoryValidationOptimized({
  items,
  onValidationComplete,
}: InventoryValidationProps) {
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [isValidating, setIsValidating] = useState(false);

  // Usar React Query para validar inventario
  const {
    data: inventoryData = [],
    isLoading,
    error,
    refetch,
  } = useInventoryValidation(items);

  useEffect(() => {
    if (inventoryData.length > 0) {
      // Enriquecer con información de los items del carrito
      const enrichedResults: ValidationResult[] = inventoryData.map(result => {
        const item = items.find(
          i =>
            i.cocktail_id === result.cocktail_id &&
            i.sizes_id === result.sizes_id
        );

        return {
          ...result,
          cocktail_name: item?.cocktail_name || "Unknown Cocktail",
          size_name: item?.size_name || "Unknown Size",
        };
      });

      setValidationResults(enrichedResults);

      // Verificar si todos los items están disponibles
      const allAvailable = enrichedResults.every(
        result =>
          result.available && result.requested_quantity <= result.max_available
      );

      const unavailableItems = enrichedResults
        .filter(
          result =>
            !result.available ||
            result.requested_quantity > result.max_available
        )
        .map(result => result.cocktail_name);

      onValidationComplete(allAvailable, unavailableItems);
    }
  }, [inventoryData, items, onValidationComplete]);

  const handleRetry = () => {
    setIsValidating(true);
    refetch().finally(() => setIsValidating(false));
  };

  if (isLoading || isValidating) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
            <span className="text-yellow-600 font-medium">
              Verificando disponibilidad...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <span className="text-red-600 font-medium">
              Error verificando inventario
            </span>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (validationResults.length === 0) {
    return null;
  }

  const hasUnavailableItems = validationResults.some(
    result =>
      !result.available || result.requested_quantity > result.max_available
  );

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-cosmic-gold">
          Verificación de Inventario
        </h2>
        <div className="flex items-center space-x-2">
          {hasUnavailableItems ? (
            <span className="text-red-500 text-sm font-medium">
              ❌ Problemas de disponibilidad
            </span>
          ) : (
            <span className="text-green-500 text-sm font-medium">
              ✅ Todo disponible
            </span>
          )}
          <button
            onClick={handleRetry}
            className="text-cosmic-gold hover:text-cosmic-gold/80 text-sm"
            title="Actualizar inventario"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="space-y-3">
        {validationResults.map((result, index) => (
          <div
            key={`${result.cocktail_id}-${result.sizes_id}-${index}`}
            className={`p-3 rounded-lg border ${
              result.available &&
              result.requested_quantity <= result.max_available
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-500/5"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-cosmic-text">
                  {result.cocktail_name}
                </h3>
                <p className="text-sm text-cosmic-fog">{result.size_name}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-cosmic-fog">
                    Solicitado: {result.requested_quantity}
                  </span>
                  <span className="text-cosmic-fog">
                    Disponible: {result.stock_quantity}
                  </span>
                  <span className="text-cosmic-fog">
                    Máximo: {result.max_available}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {result.available &&
                result.requested_quantity <= result.max_available ? (
                  <span className="text-green-500 text-sm font-medium">
                    ✅ Disponible
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-medium">
                    ❌ No disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasUnavailableItems && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 text-sm">
            Algunos productos no están disponibles en la cantidad solicitada.
            Por favor, ajusta tu carrito antes de continuar.
          </p>
        </div>
      )}
    </div>
  );
}
