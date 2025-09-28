"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientLabels() {
  const { t } = useLanguage();

  useEffect(() => {
    // Replace certain placeholder labels rendered in the server component
    const map: Record<string, string> = {
      "Flavor profile": t("cocktail.flavor_profile"),
      "Alcohol strength": t("cocktail.alcohol_strength"),
      "Non-alcoholic option available": t("cocktail.non_alcoholic_available"),
      "Available Sizes": t("cocktail.available_sizes"),
    };

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    const toChange: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (map[node.nodeValue?.trim() || ""]) toChange.push(node);
    }
    toChange.forEach(node => {
      const trimmed = node.nodeValue?.trim() || "";
      if (map[trimmed])
        node.nodeValue =
          node.nodeValue?.replace(trimmed, map[trimmed]) || map[trimmed];
    });
  });

  return null;
}
