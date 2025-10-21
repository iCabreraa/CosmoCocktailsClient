/**
 * Rate Limiting Types
 *
 * Definiciones de tipos para el sistema de rate limiting con Vercel KV
 *
 * @fileoverview Tipos TypeScript para rate limiting
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

/**
 * Configuración de límites de rate limiting
 */
export interface RateLimitConfig {
  /** Número máximo de requests permitidos */
  limit: number;
  /** Ventana de tiempo en segundos */
  window: number;
  /** Identificador único para el límite */
  key: string;
  /** Mensaje de error personalizado */
  message?: string;
}

/**
 * Resultado de la verificación de rate limiting
 */
export interface RateLimitResult {
  /** Si el request está permitido */
  allowed: boolean;
  /** Número de requests restantes */
  remaining: number;
  /** Timestamp de cuando se resetea el límite */
  resetTime: number;
  /** Mensaje de error si no está permitido */
  message?: string;
}

/**
 * Configuración de límites por endpoint
 */
export interface EndpointRateLimit {
  /** Límite para requests autenticados */
  authenticated: RateLimitConfig;
  /** Límite para requests no autenticados */
  unauthenticated: RateLimitConfig;
  /** Límite global por IP */
  global: RateLimitConfig;
}

/**
 * Tipos de rate limiting
 */
export type RateLimitType =
  | "global" // Límite global por IP
  | "authenticated" // Límite por usuario autenticado
  | "unauthenticated" // Límite para usuarios no autenticados
  | "endpoint"; // Límite específico por endpoint

/**
 * Configuración de rate limiting por endpoint
 */
export const RATE_LIMIT_CONFIGS: Record<string, EndpointRateLimit> = {
  // Autenticación
  "/api/login": {
    authenticated: { limit: 5, window: 900, key: "login_auth" }, // 5 intentos / 15 min
    unauthenticated: { limit: 5, window: 900, key: "login_unauth" }, // 5 intentos / 15 min
    global: { limit: 20, window: 900, key: "login_global" }, // 20 intentos / 15 min por IP
  },

  "/api/signup": {
    authenticated: { limit: 3, window: 3600, key: "signup_auth" }, // 3 intentos / hora
    unauthenticated: { limit: 3, window: 3600, key: "signup_unauth" }, // 3 intentos / hora
    global: { limit: 10, window: 3600, key: "signup_global" }, // 10 intentos / hora por IP
  },

  // Pagos y pedidos
  "/api/create-payment-intent": {
    authenticated: { limit: 10, window: 3600, key: "payment_auth" }, // 10 intentos / hora
    unauthenticated: { limit: 5, window: 3600, key: "payment_unauth" }, // 5 intentos / hora
    global: { limit: 50, window: 3600, key: "payment_global" }, // 50 intentos / hora por IP
  },

  "/api/create-order": {
    authenticated: { limit: 10, window: 3600, key: "order_auth" }, // 10 intentos / hora
    unauthenticated: { limit: 5, window: 3600, key: "order_unauth" }, // 5 intentos / hora
    global: { limit: 30, window: 3600, key: "order_global" }, // 30 intentos / hora por IP
  },

  // APIs generales
  "/api/favorites": {
    authenticated: { limit: 100, window: 3600, key: "favorites_auth" }, // 100 requests / hora
    unauthenticated: { limit: 20, window: 3600, key: "favorites_unauth" }, // 20 requests / hora
    global: { limit: 200, window: 3600, key: "favorites_global" }, // 200 requests / hora por IP
  },

  "/api/preferences": {
    authenticated: { limit: 50, window: 3600, key: "preferences_auth" }, // 50 requests / hora
    unauthenticated: { limit: 10, window: 3600, key: "preferences_unauth" }, // 10 requests / hora
    global: { limit: 100, window: 3600, key: "preferences_global" }, // 100 requests / hora por IP
  },

  // Límite global por defecto
  default: {
    authenticated: { limit: 200, window: 3600, key: "default_auth" }, // 200 requests / hora
    unauthenticated: { limit: 100, window: 3600, key: "default_unauth" }, // 100 requests / hora
    global: { limit: 500, window: 3600, key: "default_global" }, // 500 requests / hora por IP
  },
};

/**
 * Mensajes de error personalizados
 */
export const RATE_LIMIT_MESSAGES = {
  TOO_MANY_REQUESTS:
    "Demasiadas peticiones. Por favor, espera antes de intentar de nuevo.",
  LOGIN_LIMIT_EXCEEDED:
    "Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.",
  SIGNUP_LIMIT_EXCEEDED:
    "Demasiados intentos de registro. Inténtalo de nuevo en una hora.",
  PAYMENT_LIMIT_EXCEEDED:
    "Demasiados intentos de pago. Inténtalo de nuevo más tarde.",
  ORDER_LIMIT_EXCEEDED:
    "Demasiados intentos de pedido. Inténtalo de nuevo más tarde.",
  GLOBAL_LIMIT_EXCEEDED:
    "Límite global de peticiones excedido. Inténtalo de nuevo más tarde.",
} as const;

