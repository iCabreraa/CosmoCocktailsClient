import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-client";

// Sistema de caché inteligente para invalidación automática
export class SmartCache {
  private static instance: SmartCache;
  private invalidationRules: Map<string, string[]> = new Map();

  private constructor() {
    this.setupInvalidationRules();
  }

  public static getInstance(): SmartCache {
    if (!SmartCache.instance) {
      SmartCache.instance = new SmartCache();
    }
    return SmartCache.instance;
  }

  private setupInvalidationRules() {
    // Reglas de invalidación automática
    this.invalidationRules.set("inventory", [
      "inventory",
      "products",
      "orders",
    ]);

    this.invalidationRules.set("orders", ["inventory", "orders"]);

    this.invalidationRules.set("products", ["products"]);

    this.invalidationRules.set("user", ["user", "orders"]);
  }

  // Invalidar caché basado en el tipo de operación
  public invalidateByType(type: string) {
    const relatedKeys = this.invalidationRules.get(type) || [];

    relatedKeys.forEach(key => {
      queryClient.invalidateQueries({
        queryKey: [key],
      });
    });

    console.log(`🔄 Cache invalidated for type: ${type}`, relatedKeys);
  }

  // Invalidar caché específico
  public invalidateSpecific(key: readonly unknown[]) {
    queryClient.invalidateQueries({
      queryKey: key,
    });

    console.log(`🔄 Cache invalidated for key:`, key);
  }

  // Prefetch datos críticos
  public async prefetchCriticalData() {
    try {
      // Prefetch productos destacados
      await queryClient.prefetchQuery({
        queryKey: ["products", "featured"],
        staleTime: 5 * 60 * 1000, // 5 minutos
      });

      // Prefetch configuración
      await queryClient.prefetchQuery({
        queryKey: ["config", "app"],
        staleTime: 60 * 60 * 1000, // 1 hora
      });

      console.log("🚀 Critical data prefetched successfully");
    } catch (error) {
      console.error("❌ Error prefetching critical data:", error);
    }
  }

  // Limpiar caché expirado
  public clearExpiredCache() {
    queryClient.clear();
    console.log("🧹 Expired cache cleared");
  }

  // Obtener estadísticas de caché
  public getCacheStats() {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    const stats = {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      freshQueries: queries.filter(q => !q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === "error").length,
      loadingQueries: queries.filter(q => q.state.status === "pending").length,
    };

    return stats;
  }

  // Optimizar caché (eliminar queries no utilizados)
  public optimizeCache() {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    // Eliminar queries que no se han usado en los últimos 10 minutos
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    queries.forEach(query => {
      if (query.state.dataUpdatedAt < tenMinutesAgo && !query.isActive()) {
        queryClient.removeQueries({
          queryKey: query.queryKey,
        });
      }
    });

    console.log("⚡ Cache optimized");
  }

  // Invalidar caché cuando se actualiza inventario
  public onInventoryUpdate(cocktailId: string, sizeId: string) {
    this.invalidateSpecific(
      queryKeys.inventory.byCocktailSize(cocktailId, sizeId)
    );
    this.invalidateSpecific(queryKeys.inventory.byCocktail(cocktailId));
    this.invalidateByType("inventory");
  }

  // Invalidar caché cuando se crea un pedido
  public onOrderCreate(userId: string) {
    this.invalidateSpecific(queryKeys.orders.byUser(userId));
    this.invalidateSpecific(queryKeys.orders.recent(5));
    this.invalidateByType("orders");
  }

  // Invalidar caché cuando se actualiza un producto
  public onProductUpdate(productId: string) {
    this.invalidateSpecific(queryKeys.products.byId(productId));
    this.invalidateByType("products");
  }

  // Invalidar caché cuando se actualiza usuario
  public onUserUpdate(userId: string) {
    this.invalidateSpecific(queryKeys.user.profile);
    this.invalidateByType("user");
  }
}

// Instancia singleton
export const smartCache = SmartCache.getInstance();

// Hook para usar el caché inteligente
export function useSmartCache() {
  return {
    invalidateByType: (type: string) => smartCache.invalidateByType(type),
    invalidateSpecific: (key: readonly unknown[]) =>
      smartCache.invalidateSpecific(key),
    prefetchCriticalData: () => smartCache.prefetchCriticalData(),
    clearExpiredCache: () => smartCache.clearExpiredCache(),
    getCacheStats: () => smartCache.getCacheStats(),
    optimizeCache: () => smartCache.optimizeCache(),
    onInventoryUpdate: (cocktailId: string, sizeId: string) =>
      smartCache.onInventoryUpdate(cocktailId, sizeId),
    onOrderCreate: (userId: string) => smartCache.onOrderCreate(userId),
    onProductUpdate: (productId: string) =>
      smartCache.onProductUpdate(productId),
    onUserUpdate: (userId: string) => smartCache.onUserUpdate(userId),
  };
}
