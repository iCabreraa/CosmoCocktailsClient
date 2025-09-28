"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { CocktailFilters as FilterType } from "@/hooks/useCocktailPagination";

interface CocktailFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onClearFilters: () => void;
  stats: {
    totalCocktails: number;
    filteredCocktails: number;
    nonAlcoholicCount: number;
    strongDrinksCount: number;
    averagePrice: number;
  };
  className?: string;
}

const CATEGORIES = [
  { value: "all", label: "Todas las categorías" },
  { value: "featured", label: "Destacados" },
  { value: "tropical", label: "Tropicales" },
  { value: "classic", label: "Clásicos" },
];

const ALCOHOL_LEVELS = [
  { value: "all", label: "Todos los niveles" },
  { value: "non-alcoholic", label: "Sin alcohol" },
  { value: "light", label: "Ligeros (0-14%)" },
  { value: "strong", label: "Fuertes (18%+)" },
];

const PRICE_RANGES = [
  { value: [0, 100], label: "Todos los precios" },
  { value: [0, 10], label: "€0 - €10" },
  { value: [10, 20], label: "€10 - €20" },
  { value: [20, 30], label: "€20 - €30" },
  { value: [30, 100], label: "€30+" },
];

export default function CocktailFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  stats,
  className = "",
}: CocktailFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onFiltersChange({ search: query });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ category });
  };

  const handleAlcoholLevelChange = (alcoholLevel: string) => {
    onFiltersChange({ alcoholLevel: alcoholLevel as any });
  };

  const handlePriceRangeChange = (priceRange: [number, number]) => {
    onFiltersChange({ priceRange });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.alcoholLevel !== "all" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 100;

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm rounded-xl border border-cosmic-gold/10 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="w-6 h-6 text-cosmic-gold" />
          <h3 className="text-xl font-[--font-unica] text-cosmic-gold">
            Filtros y Búsqueda
          </h3>
        </div>

        <div className="flex items-center space-x-4">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-2 text-cosmic-silver hover:text-cosmic-gold transition-colors duration-200"
            >
              <XMarkIcon className="w-4 h-4" />
              <span className="text-sm">Limpiar filtros</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cosmic-gold hover:text-cosmic-silver transition-colors duration-200"
          >
            {isExpanded ? "Ocultar" : "Mostrar"} filtros
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <label
          htmlFor="search"
          className="block text-cosmic-silver text-sm font-medium mb-2"
        >
          Buscar cócteles
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cosmic-silver" />
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Nombre, descripción o ingredientes..."
            className="
              w-full pl-10 pr-4 py-3 bg-cosmic-bg border border-cosmic-gold/20 rounded-lg
              text-cosmic-gold placeholder-cosmic-silver/50 focus:outline-none focus:ring-2
              focus:ring-cosmic-gold/50 focus:border-cosmic-gold/40 transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Filtros expandibles */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Categoría */}
          <div>
            <label className="block text-cosmic-silver text-sm font-medium mb-2">
              Categoría
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      filters.category === category.value
                        ? "bg-cosmic-gold text-cosmic-bg"
                        : "bg-cosmic-bg/50 text-cosmic-silver hover:bg-cosmic-gold/10 hover:text-cosmic-gold"
                    }
                  `}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de alcohol */}
          <div>
            <label className="block text-cosmic-silver text-sm font-medium mb-2">
              Nivel de alcohol
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ALCOHOL_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => handleAlcoholLevelChange(level.value)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      filters.alcoholLevel === level.value
                        ? "bg-cosmic-gold text-cosmic-bg"
                        : "bg-cosmic-bg/50 text-cosmic-silver hover:bg-cosmic-gold/10 hover:text-cosmic-gold"
                    }
                  `}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de precio */}
          <div>
            <label className="block text-cosmic-silver text-sm font-medium mb-2">
              Rango de precio
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {PRICE_RANGES.map((range, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handlePriceRangeChange(range.value as [number, number])
                  }
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      filters.priceRange[0] === range.value[0] &&
                      filters.priceRange[1] === range.value[1]
                        ? "bg-cosmic-gold text-cosmic-bg"
                        : "bg-cosmic-bg/50 text-cosmic-silver hover:bg-cosmic-gold/10 hover:text-cosmic-gold"
                    }
                  `}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="mt-6 pt-4 border-t border-cosmic-gold/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cosmic-gold">
              {stats.filteredCocktails}
            </div>
            <div className="text-sm text-cosmic-silver">
              {filters.search ||
              filters.category !== "all" ||
              filters.alcoholLevel !== "all"
                ? "Resultados"
                : "Total cócteles"}
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-cosmic-gold">
              {stats.nonAlcoholicCount}
            </div>
            <div className="text-sm text-cosmic-silver">Sin alcohol</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-cosmic-gold">
              {stats.strongDrinksCount}
            </div>
            <div className="text-sm text-cosmic-silver">Fuertes</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-cosmic-gold">
              €{stats.averagePrice}
            </div>
            <div className="text-sm text-cosmic-silver">Precio promedio</div>
          </div>
        </div>
      </div>
    </div>
  );
}
