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
  sizes?: Array<{
    id: string;
    price: number;
    sizes_id: string;
    size_name: string | null;
    volume_ml: number | null;
    available?: boolean | null;
    stock_quantity?: number | null;
  }>;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export interface CocktailSize {
  id: string;
  price: number;
  available: boolean;
  sizes_id: string;
  size: {
    name: string | null;
    volume_ml: number | null;
  } | null;
}

// Tipos para las respuestas de Supabase
export interface CocktailSizesRow {
  cocktail_id: string;
  sizes_id: string;
  price: number;
  available: boolean;
  stock_quantity: number;
  cocktails: {
    id: string;
    name: string;
    image_url: string | null;
  };
  sizes: {
    id: string;
    name: string;
    volume_ml: number;
  };
}

export interface InventoryCheckRow {
  available: boolean;
  stock_quantity: number;
  cocktail_id: string;
  sizes_id: string;
}
