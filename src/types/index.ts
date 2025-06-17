export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  price: number;
  alcoholFree?: boolean;
  tags?: string[];
}

export type CocktailWithPrice = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  min_price: number | null;
  min_size_id: string | null;
  alcohol_percentage: number;
  has_non_alcoholic_version: boolean;
};

export interface CocktailSize {
  id: string;
  price: number;
  sizes: {
    name: string | null;
    volume_ml: number | null;
  } | null;
}
