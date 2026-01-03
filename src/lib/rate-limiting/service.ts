/**
 * Rate Limiting Service
 *
 * Servicio profesional de rate limiting usando Vercel KV
 * Implementa múltiples capas de protección y logging detallado
 *
 * @fileoverview Servicio principal de rate limiting
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { kv } from "@vercel/kv";
import {
  RateLimitConfig,
  RateLimitResult,
  RateLimitType,
  RATE_LIMIT_CONFIGS,
  RATE_LIMIT_MESSAGES,
} from "./types";
import { validateKVConfig } from "./config";

/**
 * Clase principal del servicio de Rate Limiting
 */
export class RateLimitService {
  private static instance: RateLimitService;
  private readonly isProduction: boolean;
  private readonly isConfigured: boolean;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === "production";

    // Validar configuración de Vercel KV
    this.isConfigured = validateKVConfig();
    if (!this.isConfigured) {
      // const debug = getKVConfigDebug();
      // console.error("🚨 Vercel KV no configurado correctamente:", debug);
      if (!this.isProduction) {
        console.warn("⚠️ Vercel KV no configurado: rate limiting desactivado.");
      }
    }
  }

  /**
   * Singleton pattern para asegurar una sola instancia
   */
  public static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  /**
   * Verifica si un request está permitido según los límites configurados
   *
   * @param identifier - Identificador único (IP, userId, etc.)
   * @param endpoint - Endpoint que se está accediendo
   * @param type - Tipo de rate limiting a aplicar
   * @param userId - ID del usuario (opcional, para requests autenticados)
   * @returns Promise<RateLimitResult>
   */
  public async checkRateLimit(
    identifier: string,
    endpoint: string,
    type: RateLimitType,
    userId?: string
  ): Promise<RateLimitResult> {
    if (!this.isConfigured) {
      return {
        allowed: true,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        message: "Rate limiting desactivado (KV no configurado)",
      };
    }

    try {
      // Obtener configuración para el endpoint
      const config = this.getConfigForEndpoint(endpoint, type, !!userId);

      // Generar clave única para el límite
      const key = this.generateKey(identifier, config.key, userId);

      // Verificar límite actual
      const result = await this.checkLimit(key, config);

      // Logging para debugging y monitoreo
      this.logRateLimitCheck(identifier, endpoint, type, result, userId);

      return result;
    } catch {
      // console.error("🚨 Rate limiting error:", error);

      // En caso de error, permitir el request pero logear el error
      return {
        allowed: true,
        remaining: 0,
        resetTime: Date.now() + 3600000, // 1 hora
        message: "Error en rate limiting - request permitido",
      };
    }
  }

  /**
   * Obtiene la configuración de rate limiting para un endpoint específico
   */
  private getConfigForEndpoint(
    endpoint: string,
    type: RateLimitType,
    isAuthenticated: boolean
  ): RateLimitConfig {
    const endpointConfig =
      RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS["default"];

    switch (type) {
      case "authenticated":
        return endpointConfig.authenticated;
      case "unauthenticated":
        return endpointConfig.unauthenticated;
      case "global":
        return endpointConfig.global;
      case "endpoint":
        return isAuthenticated
          ? endpointConfig.authenticated
          : endpointConfig.unauthenticated;
      default:
        return endpointConfig.global;
    }
  }

  /**
   * Genera una clave única para el límite en Vercel KV
   */
  private generateKey(
    identifier: string,
    configKey: string,
    userId?: string
  ): string {
    const prefix = this.isProduction ? "rl" : "rl_dev";
    const userSuffix = userId ? `_user_${userId}` : "";
    return `${prefix}:${configKey}:${identifier}${userSuffix}`;
  }

  /**
   * Verifica el límite actual en Vercel KV
   */
  private async checkLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.window * 1000;

    // Obtener requests existentes
    const existingRequests = await kv.zrange(key, windowStart, "+inf", {
      byScore: true,
    });

    // Si no hay requests previos, crear el primer registro
    if (existingRequests.length === 0) {
      await kv.zadd(key, { score: now, member: now.toString() });
      await kv.expire(key, config.window);

      return {
        allowed: true,
        remaining: config.limit - 1,
        resetTime: now + config.window * 1000,
        message: undefined,
      };
    }

    // Limpiar requests antiguos fuera de la ventana
    // await kv.zremrangebyscore(key, "-inf", windowStart as any);

    // Contar requests actuales
    const currentCount = await kv.zcard(key);

    // Verificar si se excede el límite
    if (currentCount >= config.limit) {
      const oldestRequest = await kv.zrange(key, 0, 0, { withScores: true });
      const resetTime =
        oldestRequest.length > 0
          ? (oldestRequest[0] as number) + config.window * 1000
          : now + config.window * 1000;

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        message: config.message || RATE_LIMIT_MESSAGES.TOO_MANY_REQUESTS,
      };
    }

    // Agregar nuevo request
    await kv.zadd(key, { score: now, member: now.toString() });
    await kv.expire(key, config.window);

    return {
      allowed: true,
      remaining: config.limit - currentCount - 1,
      resetTime: now + config.window * 1000,
      message: undefined,
    };
  }

  /**
   * Logging detallado para debugging y monitoreo
   */
  private logRateLimitCheck(
    identifier: string,
    endpoint: string,
    type: RateLimitType,
    result: RateLimitResult,
    userId?: string
  ): void {
    // Logging deshabilitado para producción
    // const logData = {
    //   timestamp: new Date().toISOString(),
    //   identifier: this.maskIdentifier(identifier),
    //   endpoint,
    //   type,
    //   userId: userId ? this.maskUserId(userId) : undefined,
    //   allowed: result.allowed,
    //   remaining: result.remaining,
    //   resetTime: new Date(result.resetTime).toISOString(),
    //   environment: process.env.NODE_ENV,
    // };
    // if (result.allowed) {
    //   console.log("✅ Rate limit check passed:", logData);
    // } else {
    //   console.warn("🚫 Rate limit exceeded:", logData);
    // }
  }

  /**
   * Enmascara identificadores sensibles para logging
   */
  private maskIdentifier(identifier: string): string {
    if (identifier.length <= 8) return "***";
    return (
      identifier.substring(0, 4) +
      "***" +
      identifier.substring(identifier.length - 4)
    );
  }

  /**
   * Enmascara user IDs para logging
   */
  private maskUserId(userId: string): string {
    if (userId.length <= 8) return "***";
    return userId.substring(0, 4) + "***" + userId.substring(userId.length - 4);
  }

  /**
   * Limpia límites expirados (útil para mantenimiento)
   */
  public async cleanupExpiredLimits(): Promise<void> {
    if (!this.isConfigured) return;
    try {
      const pattern = this.isProduction ? "rl:*" : "rl_dev:*";
      const keys = await kv.keys(pattern);

      for (const key of keys) {
        const ttl = await kv.ttl(key);
        if (ttl === -1) {
          // Clave sin TTL, eliminarla
          await kv.del(key);
          // console.log("🧹 Cleaned up expired rate limit key:", key);
        }
      }
    } catch {
      // console.error("🚨 Error cleaning up rate limits:", error);
    }
  }

  /**
   * Obtiene estadísticas de rate limiting para un identificador
   */
  public async getRateLimitStats(
    identifier: string,
    configKey: string
  ): Promise<{
    currentCount: number;
    limit: number;
    resetTime: number;
    remaining: number;
  }> {
    if (!this.isConfigured) {
      return {
        currentCount: 0,
        limit: 0,
        resetTime: 0,
        remaining: 0,
      };
    }

    try {
      const key = this.generateKey(identifier, configKey);
      const now = Date.now();
      const windowStart = now - 3600 * 1000; // Última hora

      const currentCount = await kv.zcount(key, windowStart, "+inf");
      const config = RATE_LIMIT_CONFIGS["default"].global; // Usar configuración por defecto

      return {
        currentCount,
        limit: config.limit,
        resetTime: now + config.window * 1000,
        remaining: Math.max(0, config.limit - currentCount),
      };
    } catch {
      // console.error("🚨 Error getting rate limit stats:", error);
      return {
        currentCount: 0,
        limit: 0,
        resetTime: 0,
        remaining: 0,
      };
    }
  }
}

/**
 * Instancia singleton del servicio
 */
export const rateLimitService = RateLimitService.getInstance();
