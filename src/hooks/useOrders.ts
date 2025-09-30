"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Order,
  OrderItem,
  OrderFilter,
  PaginatedResponse,
} from "@/types/shared";

interface UseOrdersReturn {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  currentPage: number;

  // Acciones
  fetchOrders: (filter?: OrderFilter, page?: number) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<void>;
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;

  // Utilidades
  clearError: () => void;
  refreshOrders: () => Promise<void>;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();
  const ITEMS_PER_PAGE = 10;

  // Calcular paginación
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Obtener pedidos
  const fetchOrders = async (filter: OrderFilter = {}, page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          user:users(id, full_name, email, phone, avatar_url),
          delivery_address:addresses(*),
          order_items(
            *,
            cocktail:cocktails(name, image_url),
            size:sizes(name, volume_ml)
          )
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filter.status) {
        query = query.eq("status", filter.status);
      }
      if (filter.payment_status) {
        query = query.eq("payment_status", filter.payment_status);
      }
      if (filter.date_from) {
        query = query.gte("order_date", filter.date_from);
      }
      if (filter.date_to) {
        query = query.lte("order_date", filter.date_to);
      }
      if (filter.user_id) {
        query = query.eq("user_id", filter.user_id);
      }
      if (filter.search) {
        query = query.or(
          `order_ref.ilike.%${filter.search}%,notes.ilike.%${filter.search}%`
        );
      }

      // Aplicar paginación
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setOrders(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar pedidos";
      setError(errorMessage);
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener un pedido específico
  const fetchOrder = async (orderId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:users(id, full_name, email, phone, avatar_url),
          delivery_address:addresses(*),
          order_items(
            *,
            cocktail:cocktails(name, image_url),
            size:sizes(name, volume_ml)
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setCurrentOrder(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar el pedido";
      setError(errorMessage);
      console.error("Error fetching order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo pedido
  const createOrder = async (
    orderData: Partial<Order>
  ): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generar referencia de pedido
      const orderRef = await generateOrderRef();

      const orderToCreate = {
        ...orderData,
        order_ref: orderRef,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error: createError } = await (supabase as any)
        .from("orders")
        .insert(orderToCreate as any)
        .select(
          `
          *,
          user:users(id, full_name, email, phone, avatar_url),
          delivery_address:addresses(*),
          order_items(
            *,
            cocktail:cocktails(name, image_url),
            size:sizes(name, volume_ml)
          )
        `
        )
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      // Actualizar lista de pedidos
      setOrders(prev => [data, ...prev]);

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear el pedido";
      setError(errorMessage);
      console.error("Error creating order:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar pedido
  const updateOrder = async (
    orderId: string,
    updates: Partial<Order>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await (supabase as any)
        .from("orders")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", orderId)
        .select(
          `
          *,
          user:users(id, full_name, email, phone, avatar_url),
          delivery_address:addresses(*),
          order_items(
            *,
            cocktail:cocktails(name, image_url),
            size:sizes(name, volume_ml)
          )
        `
        )
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Actualizar lista de pedidos
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? data : order))
      );

      // Actualizar pedido actual si es el mismo
      if (currentOrder?.id === orderId) {
        setCurrentOrder(data);
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar el pedido";
      setError(errorMessage);
      console.error("Error updating order:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar pedido
  const cancelOrder = async (orderId: string): Promise<boolean> => {
    return updateOrder(orderId, {
      status: "cancelled",
      updated_at: new Date().toISOString(),
    });
  };

  // Limpiar error
  const clearError = () => setError(null);

  // Refrescar pedidos
  const refreshOrders = async () => {
    await fetchOrders({}, currentPage);
  };

  // Generar referencia de pedido
  const generateOrderRef = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc("generate_order_ref");
      if (error) throw error;
      return data;
    } catch (err) {
      // Fallback: generar referencia local
      const timestamp = Date.now().toString().slice(-6);
      return `ORD${timestamp}`;
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    totalCount,
    hasNextPage,
    hasPrevPage,
    currentPage,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    cancelOrder,
    clearError,
    refreshOrders,
  };
}

// Hook específico para un pedido
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchOrder = async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:users(id, full_name, email, phone, avatar_url),
          delivery_address:addresses(*),
          order_items(
            *,
            cocktail:cocktails(name, image_url),
            size:sizes(name, volume_ml)
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setOrder(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar el pedido";
      setError(errorMessage);
      console.error("Error fetching order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
  };
}
