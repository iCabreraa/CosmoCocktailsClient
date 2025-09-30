import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys, getQueryConfig } from "@/lib/query-client";
import { Order, OrderItem } from "@/types/shared";

const supabase = createClient();

// Hook para obtener todos los pedidos del usuario
export function useOrders(userId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.byUser(userId || ""),
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            cocktail:cocktails(name, image_url),
            size:sizes(name, volume_ml)
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Error fetching orders: ${error.message}`);
      }

      return data as Order[];
    },
    enabled: !!userId,
    ...getQueryConfig("orders"),
  });
}

// Hook para obtener un pedido específico
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.byId(orderId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            cocktail:cocktails(name, image_url),
            size:sizes(name, volume_ml)
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (error) {
        throw new Error(`Error fetching order: ${error.message}`);
      }

      return data as Order;
    },
    enabled: !!orderId,
    ...getQueryConfig("orders"),
  });
}

// Hook para obtener pedidos recientes
export function useRecentOrders(limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.orders.recent(limit),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            cocktail:cocktails(name, image_url),
            size:sizes(name, volume_ml)
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Error fetching recent orders: ${error.message}`);
      }

      return data as Order[];
    },
    ...getQueryConfig("orders"),
  });
}

// Hook para crear un nuevo pedido
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      user_id: string;
      items: Array<{
        cocktail_id: string;
        sizes_id: string;
        quantity: number;
        unit_price: number;
        item_total: number;
      }>;
      total: number;
      payment_intent_id?: string;
      shipping_address?: any;
    }) => {
      // Crear el pedido
      const { data: order, error: orderError } = await (supabase as any)
        .from("orders")
        .insert({
          user_id: orderData.user_id,
          total_price: orderData.total,
          payment_intent_id: orderData.payment_intent_id,
          shipping_address: orderData.shipping_address,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Error creating order: ${orderError.message}`);
      }

      // Crear los items del pedido
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        cocktail_id: item.cocktail_id,
        size_id: item.sizes_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        item_total: item.item_total,
      }));

      const { error: itemsError } = await (supabase as any)
        .from("order_items")
        .insert(orderItems as any[]);

      if (itemsError) {
        throw new Error(`Error creating order items: ${itemsError.message}`);
      }

      return order;
    },
    onSuccess: order => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.byUser(order.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.recent(5),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });
    },
  });
}

// Hook para actualizar el estado de un pedido
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      paymentStatus,
    }: {
      orderId: string;
      status?: string;
      paymentStatus?: string;
    }) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.payment_status = paymentStatus;

      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating order status: ${error.message}`);
      }

      return data;
    },
    onSuccess: order => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.byId(order.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.byUser(order.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });
    },
  });
}

// Hook para obtener estadísticas de pedidos
export function useOrderStats(userId?: string) {
  return useQuery({
    queryKey: ["orders", "stats", userId],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("status, payment_status, total_price, created_at");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching order stats: ${error.message}`);
      }

      const typedData = data as Array<{
        status: string;
        total_price: number;
        created_at: string;
      }> | null;

      const stats = {
        totalOrders: typedData?.length || 0,
        pendingOrders:
          typedData?.filter(o => o.status === "pending").length || 0,
        completedOrders:
          typedData?.filter(o => o.status === "completed").length || 0,
        totalRevenue:
          typedData?.reduce((sum, o) => sum + o.total_price, 0) || 0,
        averageOrderValue: typedData?.length
          ? typedData.reduce((sum, o) => sum + o.total_price, 0) /
            typedData.length
          : 0,
        ordersThisMonth:
          typedData?.filter(o => {
            const orderDate = new Date(o.created_at);
            const now = new Date();
            return (
              orderDate.getMonth() === now.getMonth() &&
              orderDate.getFullYear() === now.getFullYear()
            );
          }).length || 0,
      };

      return stats;
    },
    enabled: !!userId,
    ...getQueryConfig("orders"),
  });
}
