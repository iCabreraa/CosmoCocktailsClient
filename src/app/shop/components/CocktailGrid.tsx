"use client";

import CocktailCard from "./CocktailCard";
import { CocktailWithPrice } from "@/types";

interface CocktailGridProps {
  cocktails: CocktailWithPrice[];
  showFavorites?: boolean;
}

export default function CocktailGrid({
  cocktails,
  showFavorites = false,
}: CocktailGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
      {cocktails.map(cocktail => (
        <CocktailCard
          key={cocktail.id}
          cocktail={cocktail}
          showFavorites={showFavorites}
        />
      ))}
    </div>
  );
}
