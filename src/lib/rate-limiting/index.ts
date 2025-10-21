/**
 * Rate Limiting Module
 *
 * Módulo completo de rate limiting para CosmoCocktails
 * Exporta todas las funcionalidades necesarias
 *
 * @fileoverview Módulo principal de rate limiting
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

// Servicios principales
export { rateLimitService, RateLimitService } from "./service";

// Middleware
export {
  rateLimitMiddleware,
  authRateLimitMiddleware,
  paymentRateLimitMiddleware,
} from "./middleware";

// Tipos y configuraciones
export type {
  RateLimitConfig,
  RateLimitResult,
  RateLimitType,
  EndpointRateLimit,
} from "./types";

export { RATE_LIMIT_CONFIGS, RATE_LIMIT_MESSAGES } from "./types";

// Utilidades de debugging
export { createRateLimitDebugger } from "./debug";

// Configuración de Vercel KV
export {
  getKVUrl,
  getKVToken,
  validateKVConfig,
  getKVConfigDebug,
} from "./config";
