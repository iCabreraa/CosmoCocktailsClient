/**
 * API Endpoint para verificar configuración de Vercel KV
 *
 * @fileoverview Endpoint de verificación de configuración
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { getKVConfigDebug, validateKVConfig } from "@/lib/rate-limiting/config";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Verificando configuración de Vercel KV...");

    const debug = getKVConfigDebug();
    const isValid = validateKVConfig();

    const response = {
      timestamp: new Date().toISOString(),
      status: isValid ? "success" : "error",
      message: isValid
        ? "✅ Vercel KV configurado correctamente"
        : "❌ Vercel KV no configurado correctamente",
      config: {
        isValid,
        availableVars: debug.availableVars,
        kvUrl: debug.kvUrl ? "***CONFIGURADO***" : null,
        kvToken: debug.kvToken ? "***CONFIGURADO***" : null,
      },
      environment: process.env.NODE_ENV,
    };

    console.log("📊 Configuración KV:", response);

    return NextResponse.json(response, {
      status: isValid ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Config": isValid ? "valid" : "invalid",
      },
    });
  } catch (error) {
    console.error("🚨 Error verificando configuración KV:", error);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "error",
        message: "Error interno verificando configuración",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

