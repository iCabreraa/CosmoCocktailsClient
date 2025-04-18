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
