"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { CocktailSortOptions } from "@/hooks/useCocktailPagination";

interface SortSelectorProps {
  sortOptions: CocktailSortOptions;
  onSortChange: (sort: CocktailSortOptions) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { field: "name", direction: "asc", label: "Nombre (A-Z)" },
  { field: "name", direction: "desc", label: "Nombre (Z-A)" },
  { field: "price", direction: "asc", label: "Precio (menor a mayor)" },
  { field: "price", direction: "desc", label: "Precio (mayor a menor)" },
  {
    field: "alcohol_percentage",
    direction: "asc",
    label: "Alcohol (menor a mayor)",
  },
  {
    field: "alcohol_percentage",
    direction: "desc",
    label: "Alcohol (mayor a menor)",
  },
  { field: "created_at", direction: "desc", label: "Más recientes" },
  { field: "created_at", direction: "asc", label: "Más antiguos" },
];

export default function SortSelector({
  sortOptions,
  onSortChange,
  className = "",
}: SortSelectorProps) {
  const currentOption =
    SORT_OPTIONS.find(
      option =>
        option.field === sortOptions.field &&
        option.direction === sortOptions.direction
    ) || SORT_OPTIONS[0];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label
        htmlFor="sort-select"
        className="text-cosmic-silver text-sm font-medium"
      >
        Ordenar por:
      </label>

      <div className="relative">
        <select
          id="sort-select"
          value={`${sortOptions.field}-${sortOptions.direction}`}
          onChange={e => {
            const [field, direction] = e.target.value.split("-");
            onSortChange({
              field: field as any,
              direction: direction as any,
            });
          }}
          className="
            appearance-none bg-cosmic-bg border border-cosmic-gold/20 rounded-lg px-3 py-2 pr-8
            text-cosmic-gold text-sm focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50
            hover:border-cosmic-gold/40 transition-colors duration-200 min-w-[200px]
          "
        >
          {SORT_OPTIONS.map((option, index) => (
            <option
              key={index}
              value={`${option.field}-${option.direction}`}
              className="bg-cosmic-bg text-cosmic-gold"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cosmic-gold pointer-events-none" />
      </div>
    </div>
  );
}
