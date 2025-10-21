/**
 * Rate Limiting Middleware
 *
 * Middleware profesional para Next.js que implementa rate limiting
 * en múltiples capas con Vercel KV
 *
 * @fileoverview Middleware de rate limiting para Next.js
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitService } from "./service";
import { RateLimitType } from "./types";

/**
 * Configuración de endpoints que requieren rate limiting
 */
const PROTECTED_ENDPOINTS = [
  "/api/login",
  "/api/signup",
  "/api/create-payment-intent",
  "/api/create-order",
  "/api/favorites",
  "/api/preferences",
  "/api/orders",
  "/api/users",
];

/**
 * Middleware principal de rate limiting
 */
export async function rateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    const { pathname } = request.nextUrl;

    // Solo aplicar rate limiting a endpoints protegidos
    if (!PROTECTED_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint))) {
      return null; // Continuar sin rate limiting
    }

    // Obtener información del request
    const identifier = getClientIdentifier(request);
    const userId = getUserIdFromRequest(request);
    const endpoint = pathname;

    // Determinar tipo de rate limiting
    const rateLimitType: RateLimitType = userId
      ? "authenticated"
      : "unauthenticated";

    // Verificar límites en múltiples capas
    const checks = await Promise.all([
      // Límite global por IP
      rateLimitService.checkRateLimit(identifier, endpoint, "global"),

      // Límite específico del endpoint
      rateLimitService.checkRateLimit(identifier, endpoint, "endpoint", userId),

      // Límite por usuario (si está autenticado)
      userId
        ? rateLimitService.checkRateLimit(userId, endpoint, "authenticated")
        : Promise.resolve({ allowed: true, remaining: 0, resetTime: 0 }),
    ]);

    // Si cualquier límite es excedido, bloquear el request
    const blockedCheck = checks.find(check => !check.allowed);
    if (blockedCheck) {
      return createRateLimitResponse(blockedCheck, request);
    }

    // Agregar headers informativos
    const response = NextResponse.next();
    addRateLimitHeaders(response, checks);

    return response;
  } catch (error) {
    console.error("🚨 Rate limiting middleware error:", error);

    // En caso de error, permitir el request pero logear
    return null;
  }
}

/**
 * Obtiene el identificador del cliente (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  // Intentar obtener IP real desde headers de proxy
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback a IP de conexión directa
  return request.ip || "unknown";
}

/**
 * Extrae el user ID del request (desde headers o cookies)
 */
function getUserIdFromRequest(request: NextRequest): string | undefined {
  // Intentar obtener desde header de autorización
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      // Aquí podrías decodificar el JWT para obtener el user ID
      // Por ahora, usamos un placeholder
      return "user_from_token";
    } catch (error) {
      console.warn("⚠️ Error parsing auth token:", error);
    }
  }

  // Intentar obtener desde cookies
  const userIdCookie = request.cookies.get("user_id");
  if (userIdCookie) {
    return userIdCookie.value;
  }

  return undefined;
}

/**
 * Crea una respuesta de rate limit excedido
 */
function createRateLimitResponse(
  blockedCheck: {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    message?: string;
  },
  request: NextRequest
): NextResponse {
  const response = NextResponse.json(
    {
      error: "Rate limit exceeded",
      message:
        blockedCheck.message ||
        "Demasiadas peticiones. Inténtalo de nuevo más tarde.",
      retryAfter: Math.ceil((blockedCheck.resetTime - Date.now()) / 1000),
      timestamp: new Date().toISOString(),
    },
    { status: 429 }
  );

  // Headers estándar de rate limiting
  response.headers.set(
    "Retry-After",
    Math.ceil((blockedCheck.resetTime - Date.now()) / 1000).toString()
  );
  response.headers.set("X-RateLimit-Limit", "0");
  response.headers.set("X-RateLimit-Remaining", "0");
  response.headers.set(
    "X-RateLimit-Reset",
    Math.ceil(blockedCheck.resetTime / 1000).toString()
  );

  // Headers de seguridad
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

/**
 * Agrega headers informativos de rate limiting
 */
function addRateLimitHeaders(
  response: NextResponse,
  checks: Array<{ allowed: boolean; remaining: number; resetTime: number }>
): void {
  // Usar el límite más restrictivo
  const minRemaining = Math.min(...checks.map(check => check.remaining));
  const maxResetTime = Math.max(...checks.map(check => check.resetTime));

  response.headers.set("X-RateLimit-Remaining", minRemaining.toString());
  response.headers.set(
    "X-RateLimit-Reset",
    Math.ceil(maxResetTime / 1000).toString()
  );

  // Headers de debugging (solo en desarrollo)
  if (process.env.NODE_ENV === "development") {
    response.headers.set(
      "X-RateLimit-Debug",
      JSON.stringify({
        checks: checks.length,
        remaining: minRemaining,
        resetTime: new Date(maxResetTime).toISOString(),
      })
    );
  }
}

/**
 * Middleware específico para endpoints de autenticación
 */
export async function authRateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/api/login") &&
    !pathname.startsWith("/api/signup")
  ) {
    return null;
  }

  const identifier = getClientIdentifier(request);

  // Límites más estrictos para autenticación
  const check = await rateLimitService.checkRateLimit(
    identifier,
    pathname,
    "unauthenticated"
  );

  if (!check.allowed) {
    return createRateLimitResponse(check, request);
  }

  const response = NextResponse.next();
  addRateLimitHeaders(response, [check]);

  return response;
}

/**
 * Middleware específico para endpoints de pago
 */
export async function paymentRateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/api/create-payment-intent") &&
    !pathname.startsWith("/api/create-order")
  ) {
    return null;
  }

  const identifier = getClientIdentifier(request);
  const userId = getUserIdFromRequest(request);

  // Verificar límites para pagos
  const checks = await Promise.all([
    rateLimitService.checkRateLimit(identifier, pathname, "global"),
    rateLimitService.checkRateLimit(identifier, pathname, "endpoint", userId),
  ]);

  const blockedCheck = checks.find(check => !check.allowed);
  if (blockedCheck) {
    return createRateLimitResponse(blockedCheck, request);
  }

  const response = NextResponse.next();
  addRateLimitHeaders(response, checks);

  return response;
}

