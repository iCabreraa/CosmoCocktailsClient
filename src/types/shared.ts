// ========================================
// TIPOS COMPARTIDOS ENTRE ECOMMERCE Y MANAGEMENT
// ========================================

// ===== USUARIOS =====
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: "admin" | "staff" | "client";
  created_at: string;
  updated_at: string;
}

// ===== CÓCTELES =====
export interface Cocktail {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  alcohol_percentage: number;
  has_non_alcoholic_version: boolean;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CocktailSize {
  id: string;
  cocktail_id: string;
  sizes_id: string; // Corregido: en la BD real es sizes_id, no size_id
  price: number;
  available: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  // Relaciones
  cocktail?: Cocktail;
  size?: Size;
}

export interface Size {
  id: string;
  name: string;
  volume_ml: number;
  created_at: string;
  updated_at: string;
}

// ===== PEDIDOS =====
export interface Order {
  id: string;
  user_id: string;
  order_ref: string; // Referencia única del pedido
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
  total_amount: number;
  subtotal: number;
  vat_amount: number;
  shipping_cost: number;
  payment_method: "stripe" | "paypal" | "cash" | "bank_transfer";
  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  payment_intent_id?: string; // ID de Stripe
  order_date: string;
  delivery_date: string;
  delivery_address_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  user?: User;
  delivery_address?: Address;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  cocktail_id: string;
  sizes_id: string;
  quantity: number;
  unit_price: number;
  item_total: number;
  created_at: string;
  updated_at: string;
  // Relaciones
  cocktail?: Cocktail;
  size?: Size;
}

// ===== DIRECCIONES =====
export interface Address {
  id: string;
  user_id?: string;
  type?: "billing" | "shipping";
  name?: string; // Para compatibilidad con el código existente
  full_name?: string;
  street?: string; // Para compatibilidad con el código existente
  address_line_1?: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  postalCode?: string; // Para compatibilidad con el código existente
  country: string;
  phone?: string;
  is_default?: boolean;
  isDefault?: boolean; // Para compatibilidad con el código existente
  created_at?: string;
  updated_at?: string;
}

// ===== CARRITO (CLIENTE) =====
export interface CartItem {
  id: string;
  cocktail_id: string;
  sizes_id: string; // Corregido: en la BD real es sizes_id, no size_id
  quantity: number;
  unit_price: number;
  // Datos calculados
  item_total: number;
  // Datos de presentación
  cocktail_name: string;
  size_name: string;
  volume_ml: number;
  image_url: string | null;
  is_alcoholic?: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  vat_amount: number;
  shipping_cost: number;
  total: number;
  item_count: number;
}

// ===== CHECKOUT =====
export interface CheckoutData {
  // Información del cliente
  customer: {
    full_name: string;
    email: string;
    phone: string;
  };
  // Dirección de entrega
  delivery_address: {
    full_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  // Información de pago
  payment: {
    method: "stripe" | "paypal" | "cash" | "bank_transfer";
    save_address: boolean;
  };
  // Notas del pedido
  notes?: string;
}

// ===== PAGOS =====
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "succeeded"
    | "canceled";
  client_secret: string;
  metadata: Record<string, string>;
}

// ===== ESTADÍSTICAS =====
export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_order_value: number;
  top_cocktails: Array<{
    cocktail_id: string;
    cocktail_name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
}

// ===== FILTROS Y BÚSQUEDA =====
export interface OrderFilter {
  status?: Order["status"];
  payment_status?: Order["payment_status"];
  date_from?: string;
  date_to?: string;
  user_id?: string;
  search?: string;
}

export interface CocktailFilter {
  is_active?: boolean;
  has_non_alcoholic?: boolean;
  alcohol_percentage_min?: number;
  alcohol_percentage_max?: number;
  tags?: string[];
  search?: string;
}

// ===== PAGINACIÓN =====
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ===== CONSTANTES =====
export const ORDER_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
} as const;

export const PAYMENT_METHODS = {
  STRIPE: "stripe",
  PAYPAL: "paypal",
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  CLIENT: "client",
} as const;

// ===== UTILIDADES =====
export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
