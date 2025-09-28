"use client";

import { CocktailWithPrice } from "@/types";
import CocktailCard from "./CocktailCard";
import { useState, useEffect, useRef } from "react";

interface CocktailGridOptimizedProps {
  cocktails: CocktailWithPrice[];
  loading?: boolean;
  className?: string;
}

export default function CocktailGridOptimized({
  cocktails,
  loading = false,
  className = "",
}: CocktailGridOptimizedProps) {
  const [visibleCocktails, setVisibleCocktails] = useState<CocktailWithPrice[]>(
    []
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Simular carga progresiva para mejor UX
  useEffect(() => {
    if (loading) {
      setVisibleCocktails([]);
      return;
    }

    if (cocktails.length === 0) {
      setVisibleCocktails([]);
      return;
    }

    // Cargar cócteles de forma progresiva
    const loadCocktails = async () => {
      setIsLoadingMore(true);

      for (let i = 0; i < cocktails.length; i += 6) {
        const batch = cocktails.slice(0, i + 6);
        setVisibleCocktails(batch);

        // Pequeña pausa para simular carga progresiva
        if (i + 6 < cocktails.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setIsLoadingMore(false);
    };

    loadCocktails();
  }, [cocktails, loading]);

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-white/5 rounded-lg p-4 border border-cosmic-gold/10"
          >
            <div className="w-full h-48 bg-cosmic-silver/20 rounded-lg mb-4"></div>
            <div className="h-4 bg-cosmic-silver/20 rounded mb-2"></div>
            <div className="h-3 bg-cosmic-silver/20 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (cocktails.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🍹</div>
        <h3 className="text-xl font-[--font-unica] text-cosmic-gold mb-2">
          No se encontraron cócteles
        </h3>
        <p className="text-cosmic-silver">
          Intenta ajustar los filtros o buscar algo diferente
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {visibleCocktails.map((cocktail, index) => (
          <div
            key={cocktail.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${Math.min(index * 0.1, 1)}s`,
            }}
          >
            <CocktailCard cocktail={cocktail} />
          </div>
        ))}
      </div>

      {/* Indicador de carga progresiva */}
      {isLoadingMore && visibleCocktails.length < cocktails.length && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2 text-cosmic-silver">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cosmic-gold"></div>
            <span className="text-sm">
              Cargando cócteles... {visibleCocktails.length} de{" "}
              {cocktails.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
