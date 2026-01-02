"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getQueryConfig } from "@/lib/query-client";

export type OrderListItem = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_date?: string | null;
  items?: Array<{ id: string }>;
};

export type OrdersResponse = {
  orders: OrderListItem[];
  meta?: {
    total_orders?: number;
    total_spent?: number;
    page?: number | null;
    page_size?: number | null;
    has_next?: boolean | null;
  };
};

export type OrdersQueryOptions = {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
  limit?: number;
  summary?: boolean;
  includeItems?: boolean;
  userId?: string | null;
};

const buildOrdersUrl = ({
  page,
  pageSize,
  limit,
  summary,
  includeItems,
}: OrdersQueryOptions) => {
  const params = new URLSearchParams();
  if (summary) params.set("summary", "1");
  if (includeItems === false) params.set("includeItems", "0");
  if (typeof limit === "number") params.set("limit", String(limit));
  if (typeof page === "number") params.set("page", String(page));
  if (typeof pageSize === "number") params.set("pageSize", String(pageSize));
  const query = params.toString();
  return query ? `/api/orders?${query}` : "/api/orders";
};

export const buildOrdersQueryKey = ({
  page,
  pageSize,
  limit,
  summary,
  includeItems,
  userId,
}: OrdersQueryOptions) => [
  "orders",
  userId ?? "anon",
  summary ? "summary" : "detail",
  includeItems === false ? "no-items" : "items",
  page ?? null,
  pageSize ?? null,
  limit ?? null,
] as const;

export const fetchOrders = async (
  options: OrdersQueryOptions
): Promise<OrdersResponse> => {
  const res = await fetch(buildOrdersUrl(options));
  if (res.status === 401) {
    const error = new Error("Unauthorized");
    (error as { status?: number }).status = 401;
    throw error;
  }
  if (!res.ok) {
    let message = "Failed to load orders";
    try {
      const payload = await res.json();
      if (payload?.error) message = payload.error;
    } catch {
      // ignore parsing errors
    }
    const error = new Error(message);
    (error as { status?: number }).status = res.status;
    throw error;
  }
  return (await res.json()) as OrdersResponse;
};

export function useOrders(options: OrdersQueryOptions = {}) {
  const {
    enabled = true,
    summary = false,
    includeItems = true,
    userId,
  } = options;
  const queryKey = buildOrdersQueryKey({
    ...options,
    summary,
    includeItems,
    userId,
  });

  return useQuery<OrdersResponse>({
    queryKey,
    queryFn: () => fetchOrders(options),
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...getQueryConfig("orders"),
  });
}
