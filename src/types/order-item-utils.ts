export type OrderItemInput = {
  cocktail_id: string;
  sizes_id?: string | null;
  size_id?: string | null;
  quantity: number;
  unit_price: number;
  item_total?: number;
};

export type NormalizedOrderItem = {
  cocktail_id: string;
  sizes_id: string;
  quantity: number;
  unit_price: number;
  item_total?: number;
};

export type OrderItemInsert = {
  order_id?: string;
  cocktail_id: string;
  size_id: string;
  quantity: number;
  unit_price: number;
  item_total: number;
};

export type OrderItemRow = {
  cocktail_id: string;
  size_id: string;
  quantity: number;
  unit_price: number;
  item_total: number;
  cocktails?: { name?: string | null; image_url?: string | null };
  sizes?: { name?: string | null };
};

export type OrderItemDetail = {
  cocktail_id: string;
  sizes_id: string;
  quantity: number;
  unit_price: number;
  item_total: number;
  cocktail_name: string;
  cocktail_image: string | null;
  size_name: string;
};

export const normalizeOrderItemInput = (
  item: OrderItemInput
): NormalizedOrderItem => {
  const sizesId = item.sizes_id ?? item.size_id;
  if (!sizesId) {
    throw new Error("Missing sizes_id for order item");
  }

  return {
    cocktail_id: item.cocktail_id,
    sizes_id: sizesId,
    quantity: item.quantity,
    unit_price: item.unit_price,
    item_total: item.item_total,
  };
};

export const normalizeOrderItems = (
  items: OrderItemInput[]
): NormalizedOrderItem[] => items.map(normalizeOrderItemInput);

export const toOrderItemInsert = (
  item: NormalizedOrderItem,
  orderId?: string
): OrderItemInsert => ({
  order_id: orderId,
  cocktail_id: item.cocktail_id,
  size_id: item.sizes_id,
  quantity: item.quantity,
  unit_price: item.unit_price,
  item_total: item.item_total ?? item.unit_price * item.quantity,
});

export const toOrderItemInserts = (
  items: NormalizedOrderItem[],
  orderId?: string
): OrderItemInsert[] => items.map(item => toOrderItemInsert(item, orderId));

export const toOrderItemMetadata = (item: NormalizedOrderItem) => ({
  cocktail_id: item.cocktail_id,
  size_id: item.sizes_id,
  quantity: item.quantity,
  unit_price: item.unit_price,
});

export const fromOrderItemRow = (row: OrderItemRow): OrderItemDetail => ({
  cocktail_id: row.cocktail_id,
  sizes_id: row.size_id,
  quantity: row.quantity,
  unit_price: row.unit_price,
  item_total: row.item_total,
  cocktail_name: row.cocktails?.name ?? "",
  cocktail_image: row.cocktails?.image_url ?? null,
  size_name: row.sizes?.name ?? "",
});
