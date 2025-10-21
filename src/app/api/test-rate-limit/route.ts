/**
 * Rate Limiting Test API Endpoint
 *
 * Endpoint para probar el sistema de rate limiting en tiempo real
 *
 * @fileoverview API endpoint para testing de rate limiting
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitService } from "@/lib/rate-limiting";

/**
 * GET /api/test-rate-limit
 *
 * Endpoint para probar rate limiting
 * Devuelve información sobre el estado actual del rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "/api/test-rate-limit";
    const type = searchParams.get("type") || "unauthenticated";

    // Obtener IP del cliente
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");

    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      realIp ||
      cfConnectingIp ||
      request.ip ||
      "unknown";

    // Verificar rate limiting
    const result = await rateLimitService.checkRateLimit(
      clientIp,
      endpoint,
      type as any
    );

    // Obtener estadísticas
    const stats = await rateLimitService.getRateLimitStats(
      clientIp,
      "default_unauth"
    );

    const response = NextResponse.json({
      success: true,
      rateLimit: {
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: new Date(result.resetTime).toISOString(),
        message: result.message,
      },
      stats: {
        currentCount: stats.currentCount,
        limit: stats.limit,
        remaining: stats.remaining,
        resetTime: new Date(stats.resetTime).toISOString(),
      },
      client: {
        ip: clientIp.substring(0, 8) + "***",
        endpoint,
        type,
      },
      timestamp: new Date().toISOString(),
    });

    // Agregar headers informativos
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      Math.ceil(result.resetTime / 1000).toString()
    );

    if (!result.allowed) {
      response.headers.set(
        "Retry-After",
        Math.ceil((result.resetTime - Date.now()) / 1000).toString()
      );
    }

    return response;
  } catch (error) {
    console.error("🚨 Rate limit test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Error testing rate limiting",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test-rate-limit
 *
 * Endpoint para probar rate limiting con diferentes configuraciones
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      endpoint = "/api/test-rate-limit",
      type = "unauthenticated",
      count = 1,
    } = body;

    // Obtener IP del cliente
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");

    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      realIp ||
      cfConnectingIp ||
      request.ip ||
      "unknown";

    const results = [];

    // Ejecutar múltiples checks
    for (let i = 0; i < count; i++) {
      const result = await rateLimitService.checkRateLimit(
        clientIp,
        endpoint,
        type as any
      );

      results.push({
        request: i + 1,
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: new Date(result.resetTime).toISOString(),
        message: result.message,
      });
    }

    const response = NextResponse.json({
      success: true,
      results,
      summary: {
        totalRequests: count,
        allowed: results.filter(r => r.allowed).length,
        blocked: results.filter(r => !r.allowed).length,
        finalRemaining: results[results.length - 1]?.remaining || 0,
      },
      client: {
        ip: clientIp.substring(0, 8) + "***",
        endpoint,
        type,
      },
      timestamp: new Date().toISOString(),
    });

    // Agregar headers del último resultado
    const lastResult = results[results.length - 1];
    if (lastResult) {
      response.headers.set(
        "X-RateLimit-Remaining",
        lastResult.remaining.toString()
      );
      response.headers.set(
        "X-RateLimit-Reset",
        Math.ceil(new Date(lastResult.resetTime).getTime() / 1000).toString()
      );

      if (!lastResult.allowed) {
        response.headers.set(
          "Retry-After",
          Math.ceil(
            (new Date(lastResult.resetTime).getTime() - Date.now()) / 1000
          ).toString()
        );
      }
    }

    return response;
  } catch (error) {
    console.error("🚨 Rate limit test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Error testing rate limiting",
      },
      { status: 500 }
    );
  }
}

