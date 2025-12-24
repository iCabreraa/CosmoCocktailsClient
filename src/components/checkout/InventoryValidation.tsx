"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useInventoryValidationServer } from "@/hooks/useInventoryValidationServer";
import { CartItem } from "@/types/shared";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/store/cart";

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

const MAX_PER_ORDER = 10;

export default function InventoryValidation({
  items,
  onValidationComplete,
}: InventoryValidationProps) {
  const { t } = useLanguage();
  const { validateInventory, isLoading, error } =
    useInventoryValidationServer();
  const { updateQuantity, removeFromCart } = useCart();
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
        max_available: Math.min(result.stock_quantity ?? 0, MAX_PER_ORDER),
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

  const handleAdjustQuantity = (result: ValidationResult) => {
    if (result.max_available > 0) {
      updateQuantity(
        result.cocktail_id,
        result.sizes_id,
        result.max_available
      );
    } else {
      removeFromCart(result.cocktail_id, result.sizes_id);
    }
  };

  const handleRemoveItem = (result: ValidationResult) => {
    removeFromCart(result.cocktail_id, result.sizes_id);
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
          {t("checkout.inventory_validation")}
        </h3>

        <div className="flex items-center gap-2">
          {lastValidated && (
            <span className="text-xs text-cosmic-fog">
              {t("checkout.last_verification")}:{" "}
              {lastValidated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={performValidation}
            disabled={isLoading}
            className="p-2 text-cosmic-fog hover:text-cosmic-gold transition disabled:opacity-50"
            title={t("checkout.verify_inventory")}
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
            <span>{t("checkout.verifying_availability")}</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="w-4 h-4" />
            <span>
              {t("checkout.inventory_error")}: {error}
            </span>
          </div>
        )}

        {status === "available" && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-4 h-4" />
            <span>{t("checkout.all_products_available")}</span>
          </div>
        )}

        {status === "unavailable" && (
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="w-4 h-4" />
            <span>{t("checkout.some_products_unavailable")}</span>
          </div>
        )}
      </div>

      {/* Lista de productos */}
      {validationResults.length > 0 && (
        <div className="space-y-3">
          {validationResults.map((result, index) => {
            const isOverLimit =
              result.requested_quantity > result.max_available;
            const isUnavailable = !result.available || isOverLimit;

            return (
              <div
                key={`${result.cocktail_id}-${result.sizes_id}-${index}`}
                className={`p-3 rounded-lg border ${
                  !isUnavailable
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
                      {t("checkout.requested")}: {result.requested_quantity}{" "}
                      {t("checkout.units")}
                    </p>
                  </div>

                  <div className="text-right">
                    {!isUnavailable ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">
                          {t("checkout.available")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">
                          {!result.available
                            ? t("checkout.not_available")
                            : `${t("checkout.maximum")}: ${result.max_available}`}
                        </span>
                      </div>
                    )}

                    {result.stock_quantity > 0 && (
                      <p className="text-xs text-cosmic-fog mt-1">
                        {t("checkout.stock")}: {result.stock_quantity}{" "}
                        {t("checkout.units")}
                      </p>
                    )}
                  </div>
                </div>
                {isUnavailable && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.max_available > 0 && isOverLimit && (
                      <button
                        type="button"
                        onClick={() => handleAdjustQuantity(result)}
                        className="rounded-full border border-cosmic-gold/40 px-3 py-1 text-xs text-cosmic-gold transition hover:border-cosmic-gold hover:text-black hover:bg-cosmic-gold"
                      >
                        {t("checkout.adjust_quantity", {
                          max: result.max_available,
                        })}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(result)}
                      className="rounded-full border border-red-400/50 px-3 py-1 text-xs text-red-300 transition hover:border-red-400 hover:text-red-100"
                    >
                      {t("cart.remove_item")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-cosmic-fog/10 rounded-lg">
        <p className="text-xs text-cosmic-fog">
          <strong>{t("checkout.note")}:</strong> {t("checkout.inventory_note")}
        </p>
      </div>
    </div>
  );
}
