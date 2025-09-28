"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useInventoryValidationServer } from "@/hooks/useInventoryValidationServer";
import { CartItem } from "@/types/shared";

interface InventoryValidationProps {
  items: CartItem[];
  onValidationComplete: (isValid: boolean, unavailableItems: string[]) => void;
}

interface ValidationResult {
  cocktail_id: string;
  sizes_id: string; // Corregido: en la BD real es sizes_id, no size_id
  cocktail_name: string;
  size_name: string;
  available: boolean;
  stock_quantity: number;
  requested_quantity: number;
  max_available: number;
}

export default function InventoryValidation({
  items,
  onValidationComplete,
}: InventoryValidationProps) {
  const { validateInventory, isLoading, error } =
    useInventoryValidationServer();
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      performValidation();
    }
  }, [items]);

  const performValidation = async () => {
    const results = await validateInventory(items);

    // Enriquecer con información de los items del carrito
    const enrichedResults: ValidationResult[] = results.map(result => {
      const item = items.find(
        i =>
          i.cocktail_id === result.cocktail_id && i.sizes_id === result.sizes_id
      );

      return {
        ...result,
        cocktail_name: item?.cocktail_name || "Unknown Cocktail",
        size_name: item?.size_name || "Unknown Size",
        requested_quantity: item?.quantity || 0,
        stock_quantity: result.stock_quantity ?? 0,
        max_available: Math.min(result.stock_quantity ?? 0, 10), // Máximo 10 por pedido
      };
    });

    setValidationResults(enrichedResults);
    setLastValidated(new Date());

    // Determinar si hay items no disponibles
    const unavailableItems = enrichedResults
      .filter(
        result =>
          !result.available || result.requested_quantity > result.max_available
      )
      .map(result => `${result.cocktail_name} (${result.size_name})`);

    onValidationComplete(unavailableItems.length === 0, unavailableItems);
  };

  const getValidationStatus = () => {
    if (isLoading) return "validating";
    if (error) return "error";
    if (validationResults.length === 0) return "pending";

    const hasUnavailable = validationResults.some(
      result =>
        !result.available || result.requested_quantity > result.max_available
    );

    return hasUnavailable ? "unavailable" : "available";
  };

  const status = getValidationStatus();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-[--font-unica] text-cosmic-gold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Validación de Inventario
        </h3>

        <div className="flex items-center gap-2">
          {lastValidated && (
            <span className="text-xs text-cosmic-fog">
              Última verificación: {lastValidated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={performValidation}
            disabled={isLoading}
            className="p-2 text-cosmic-fog hover:text-cosmic-gold transition disabled:opacity-50"
            title="Verificar inventario"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Estado de validación */}
      <div className="mb-4">
        {status === "validating" && (
          <div className="flex items-center gap-2 text-cosmic-fog">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verificando disponibilidad...</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="w-4 h-4" />
            <span>Error al verificar inventario: {error}</span>
          </div>
        )}

        {status === "available" && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-4 h-4" />
            <span>Todos los productos están disponibles</span>
          </div>
        )}

        {status === "unavailable" && (
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="w-4 h-4" />
            <span>Algunos productos no están disponibles</span>
          </div>
        )}
      </div>

      {/* Lista de productos */}
      {validationResults.length > 0 && (
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-cosmic-text">
                    {result.cocktail_name} - {result.size_name}
                  </h4>
                  <p className="text-sm text-cosmic-fog">
                    Solicitado: {result.requested_quantity} unidades
                  </p>
                </div>

                <div className="text-right">
                  {result.available &&
                  result.requested_quantity <= result.max_available ? (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Disponible</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-500">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">
                        {!result.available
                          ? "No disponible"
                          : `Máximo: ${result.max_available}`}
                      </span>
                    </div>
                  )}

                  {result.stock_quantity > 0 && (
                    <p className="text-xs text-cosmic-fog mt-1">
                      Stock: {result.stock_quantity} unidades
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-cosmic-fog/10 rounded-lg">
        <p className="text-xs text-cosmic-fog">
          <strong>Nota:</strong> El inventario se verifica en tiempo real. Si un
          producto no está disponible, será eliminado automáticamente del
          carrito.
        </p>
      </div>
    </div>
  );
}
