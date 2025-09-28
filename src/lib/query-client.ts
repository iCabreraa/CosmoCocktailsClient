import { QueryClient } from "@tanstack/react-query";

// Configuración optimizada de React Query siguiendo mejores prácticas de Google/Apple/Netflix
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" (no necesitan refetch)
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tiempo que los datos se mantienen en caché después de que no se usen
      gcTime: 10 * 60 * 1000, // 10 minutos (renombrado en v5)

      // Reintentos automáticos en caso de error
      retry: (failureCount, error: any) => {
        // No reintentar para errores 4xx (errores del cliente)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Máximo 3 reintentos para otros errores
        return failureCount < 3;
      },

      // Intervalo entre reintentos (exponencial backoff)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch automático cuando la ventana vuelve a tener foco
      refetchOnWindowFocus: true,

      // Refetch automático cuando se reconecta la red
      refetchOnReconnect: true,

      // No refetch automático en montaje si los datos están frescos
      refetchOnMount: "always",

      // Configuración de red
      networkMode: "online",
    },
    mutations: {
      // Reintentos para mutaciones
      retry: (failureCount, error: any) => {
        // No reintentar para errores 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Máximo 2 reintentos para mutaciones
        return failureCount < 2;
      },

      // Intervalo entre reintentos para mutaciones
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),

      // Configuración de red para mutaciones
      networkMode: "online",
    },
  },
});

// Configuraciones específicas por tipo de query
export const queryConfigs = {
  // Consultas de inventario (críticas, caché corto)
  inventory: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30 * 1000, // Refetch cada 30 segundos
  },

  // Consultas de productos (menos críticas, caché largo)
  products: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },

  // Consultas de pedidos (críticas, caché corto)
  orders: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  },

  // Consultas de usuario (moderadas)
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  },

  // Consultas de configuración (muy estables)
  config: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  },
} as const;

// Función helper para obtener configuración de query
export function getQueryConfig(type: keyof typeof queryConfigs) {
  return queryConfigs[type];
}

// Claves de query estandarizadas para consistencia
export const queryKeys = {
  // Inventario
  inventory: {
    all: ["inventory"] as const,
    byCocktail: (cocktailId: string) =>
      ["inventory", "cocktail", cocktailId] as const,
    byCocktailSize: (cocktailId: string, sizeId: string) =>
      ["inventory", "cocktail", cocktailId, "size", sizeId] as const,
    check: (items: Array<{ cocktail_id: string; sizes_id: string }>) =>
      ["inventory", "check", items] as const,
  },

  // Productos
  products: {
    all: ["products"] as const,
    byId: (id: string) => ["products", id] as const,
    byCategory: (category: string) =>
      ["products", "category", category] as const,
    search: (query: string) => ["products", "search", query] as const,
  },

  // Pedidos
  orders: {
    all: ["orders"] as const,
    byId: (id: string) => ["orders", id] as const,
    byUser: (userId: string) => ["orders", "user", userId] as const,
    recent: (limit: number) => ["orders", "recent", limit] as const,
  },

  // Usuario
  user: {
    profile: ["user", "profile"] as const,
    addresses: ["user", "addresses"] as const,
    preferences: ["user", "preferences"] as const,
  },

  // Configuración
  config: {
    app: ["config", "app"] as const,
    features: ["config", "features"] as const,
  },
} as const;
