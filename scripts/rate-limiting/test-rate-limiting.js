/**
 * Rate Limiting Test Script
 *
 * Script para probar el sistema de rate limiting
 *
 * @fileoverview Script de testing para rate limiting
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { rateLimitService } from "../src/lib/rate-limiting";

/**
 * Función principal de testing
 */
async function testRateLimiting() {
  console.log("🧪 Iniciando tests de Rate Limiting...\n");

  const testIdentifier = "test-ip-192.168.1.1";
  const testEndpoint = "/api/login";

  try {
    // Test 1: Requests normales
    console.log("📋 Test 1: Requests normales (deberían pasar)");
    for (let i = 1; i <= 3; i++) {
      const result = await rateLimitService.checkRateLimit(
        testIdentifier,
        testEndpoint,
        "unauthenticated"
      );
      console.log(
        `  Request ${i}: ${result.allowed ? "✅ Permitido" : "❌ Bloqueado"} (Restantes: ${result.remaining})`
      );
    }

    console.log("\n📋 Test 2: Exceder límite (debería bloquear)");
    // Test 2: Exceder límite
    for (let i = 4; i <= 7; i++) {
      const result = await rateLimitService.checkRateLimit(
        testIdentifier,
        testEndpoint,
        "unauthenticated"
      );
      console.log(
        `  Request ${i}: ${result.allowed ? "✅ Permitido" : "❌ Bloqueado"} (Restantes: ${result.remaining})`
      );
      if (!result.allowed) {
        console.log(`    Mensaje: ${result.message}`);
        console.log(
          `    Reset en: ${new Date(result.resetTime).toLocaleString()}`
        );
        break;
      }
    }

    console.log("\n📋 Test 3: Diferentes endpoints");
    const endpoints = [
      "/api/login",
      "/api/signup",
      "/api/create-payment-intent",
    ];
    for (const endpoint of endpoints) {
      const result = await rateLimitService.checkRateLimit(
        testIdentifier,
        endpoint,
        "unauthenticated"
      );
      console.log(
        `  ${endpoint}: ${result.allowed ? "✅ Permitido" : "❌ Bloqueado"} (Restantes: ${result.remaining})`
      );
    }

    console.log("\n📋 Test 4: Estadísticas");
    const stats = await rateLimitService.getRateLimitStats(
      testIdentifier,
      "login_unauth"
    );
    console.log(`  Requests actuales: ${stats.currentCount}`);
    console.log(`  Límite: ${stats.limit}`);
    console.log(`  Restantes: ${stats.remaining}`);
    console.log(`  Reset en: ${new Date(stats.resetTime).toLocaleString()}`);

    console.log("\n✅ Tests completados exitosamente!");
  } catch (error) {
    console.error("❌ Error en tests:", error);
  }
}

/**
 * Función para limpiar datos de test
 */
async function cleanupTestData() {
  console.log("\n🧹 Limpiando datos de test...");
  try {
    await rateLimitService.cleanupExpiredLimits();
    console.log("✅ Limpieza completada");
  } catch (error) {
    console.error("❌ Error en limpieza:", error);
  }
}

/**
 * Función para simular carga alta
 */
async function simulateHighLoad() {
  console.log("\n🚀 Simulando carga alta...");

  const testIdentifier = "load-test-ip";
  const testEndpoint = "/api/create-payment-intent";

  const promises = [];
  const startTime = Date.now();

  // Crear 20 requests simultáneos
  for (let i = 0; i < 20; i++) {
    promises.push(
      rateLimitService.checkRateLimit(
        testIdentifier,
        testEndpoint,
        "unauthenticated"
      )
    );
  }

  const results = await Promise.all(promises);
  const endTime = Date.now();

  const allowed = results.filter(r => r.allowed).length;
  const blocked = results.filter(r => !r.allowed).length;

  console.log(`  Tiempo total: ${endTime - startTime}ms`);
  console.log(`  Requests permitidos: ${allowed}`);
  console.log(`  Requests bloqueados: ${blocked}`);
  console.log(
    `  Tasa de bloqueo: ${((blocked / results.length) * 100).toFixed(1)}%`
  );
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
  testRateLimiting()
    .then(() => simulateHighLoad())
    .then(() => cleanupTestData())
    .catch(console.error);
}

export { testRateLimiting, cleanupTestData, simulateHighLoad };

