"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface ItemsPerPageSelectorProps {
  currentItemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  options?: number[];
  className?: string;
}

const DEFAULT_OPTIONS = [6, 12, 24, 48];

export default function ItemsPerPageSelector({
  currentItemsPerPage,
  onItemsPerPageChange,
  options = DEFAULT_OPTIONS,
  className = "",
}: ItemsPerPageSelectorProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="items-per-page" className="text-cosmic-silver text-sm">
        Mostrar:
      </label>

      <div className="relative">
        <select
          id="items-per-page"
          value={currentItemsPerPage}
          onChange={e => onItemsPerPageChange(Number(e.target.value))}
          className="
            appearance-none bg-cosmic-bg border border-cosmic-gold/20 rounded-lg px-3 py-2 pr-8
            text-cosmic-gold text-sm focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50
            hover:border-cosmic-gold/40 transition-colors duration-200
          "
        >
          {options.map(option => (
            <option
              key={option}
              value={option}
              className="bg-cosmic-bg text-cosmic-gold"
            >
              {option} por página
            </option>
          ))}
        </select>

        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cosmic-gold pointer-events-none" />
      </div>
    </div>
  );
}
