/**
 * Rate Limiting Debug Utilities
 *
 * Utilidades para debugging y monitoreo del sistema de rate limiting
 *
 * @fileoverview Utilidades de debugging para rate limiting
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { rateLimitService } from "./service";
import { RATE_LIMIT_CONFIGS } from "./types";

/**
 * Crea un debugger para rate limiting
 */
export function createRateLimitDebugger() {
  return {
    /**
     * Obtiene estadísticas detalladas de rate limiting
     */
    async getStats(identifier: string, endpoint: string) {
      const config =
        RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS["default"];

      return {
        identifier: identifier.substring(0, 8) + "***",
        endpoint,
        config: {
          global: config.global,
          authenticated: config.authenticated,
          unauthenticated: config.unauthenticated,
        },
        stats: await rateLimitService.getRateLimitStats(
          identifier,
          config.global.key
        ),
      };
    },

    /**
     * Simula múltiples requests para testing
     */
    async simulateRequests(
      identifier: string,
      endpoint: string,
      count: number
    ) {
      const results = [];

      for (let i = 0; i < count; i++) {
        const result = await rateLimitService.checkRateLimit(
          identifier,
          endpoint,
          "unauthenticated"
        );
        results.push({
          request: i + 1,
          allowed: result.allowed,
          remaining: result.remaining,
          resetTime: new Date(result.resetTime).toISOString(),
        });

        // Pequeña pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      return results;
    },

    /**
     * Limpia todos los límites para un identificador
     */
    async clearLimits(identifier: string) {
      // Esta función sería implementada en el servicio si fuera necesario
      console.log(
        `🧹 Clearing rate limits for: ${identifier.substring(0, 8)}***`
      );
    },
  };
}

