"use client";

import { CocktailWithPrice } from "@/types";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/cart/AddToCartButton";

type CocktailRowProps = {
  title: string;
  cocktails: CocktailWithPrice[];
};

export default function CocktailRow({ title, cocktails }: CocktailRowProps) {
  if (cocktails.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-[--font-unica] text-cosmic-gold mb-6">
          {title}
        </h2>

        <div className="flex overflow-x-auto gap-6 pb-2">
          {cocktails.map((cocktail) => (
            <div
              key={cocktail.id}
              className="min-w-[220px] flex-shrink-0 rounded-lg bg-white/5 backdrop-blur-sm p-4 border border-cosmic-gold/10 hover:border-cosmic-gold/30 hover:scale-105 transition-transform duration-300"
            >
              <Link href={`/shop/${cocktail.id}`}>
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={cocktail.image_url ?? "/images/default-cocktail.webp"}
                    alt={cocktail.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-cosmic-gold text-lg font-[--font-unica] mb-1">
                  {cocktail.name}
                </h3>
                <p className="text-cosmic-silver text-sm italic">
                  {cocktail.min_price
                    ? `From €${cocktail.min_price}`
                    : "Coming soon"}
                </p>
              </Link>
              {cocktail.min_price !== null && cocktail.min_size_id && (
                <AddToCartButton
                  product={{
                    id: cocktail.min_size_id,
                    name: cocktail.name,
                    slug: cocktail.id,
                    image:
                      cocktail.image_url ?? "/images/default-cocktail.webp",
                    description: cocktail.description ?? "",
                    price: cocktail.min_price,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
