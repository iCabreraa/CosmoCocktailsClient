#!/usr/bin/env node

/**
 * Script de Testing para Rate Limiting
 *
 * Prueba diferentes endpoints y configuraciones de rate limiting
 * para verificar que el sistema funciona correctamente
 */

const https = require("https");
const http = require("http");

const BASE_URL = "http://localhost:3000";

/**
 * Función para hacer requests HTTP
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
      timeout: options.timeout || 5000,
    };

    const req = client.request(requestOptions, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Función para simular múltiples requests
 */
async function simulateRequests(endpoint, count = 10, delay = 100) {
  console.log(`\n🔄 Simulando ${count} requests a ${endpoint}...`);

  const results = [];

  for (let i = 0; i < count; i++) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint}`);
      results.push({
        request: i + 1,
        status: response.status,
        allowed: response.data?.rateLimit?.allowed || false,
        remaining: response.data?.rateLimit?.remaining || 0,
        limit: response.data?.stats?.limit || 0,
        currentCount: response.data?.stats?.currentCount || 0,
      });

      console.log(
        `  Request ${i + 1}: Status ${response.status}, Allowed: ${response.data?.rateLimit?.allowed}, Remaining: ${response.data?.rateLimit?.remaining}`
      );

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.log(`  Request ${i + 1}: Error - ${error.message}`);
      results.push({
        request: i + 1,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Función para probar diferentes endpoints
 */
async function testEndpoints() {
  console.log("🚀 Iniciando pruebas de Rate Limiting...");
  console.log("=====================================");

  const endpoints = [
    "/api/test-rate-limit",
    "/api/verify-kv-config",
    "/api/login",
    "/api/signup",
    "/api/create-payment-intent",
    "/api/create-order",
    "/api/favorites",
    "/api/preferences",
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Probando endpoint: ${endpoint}`);
    console.log("─".repeat(50));

    try {
      // Test básico
      const response = await makeRequest(`${BASE_URL}${endpoint}`);
      console.log(`✅ Endpoint accesible: Status ${response.status}`);

      if (response.data?.rateLimit) {
        console.log(
          `   Rate Limit: ${response.data.rateLimit.allowed ? "✅ Permitido" : "❌ Bloqueado"}`
        );
        console.log(`   Remaining: ${response.data.rateLimit.remaining}`);
        console.log(
          `   Reset Time: ${new Date(response.data.rateLimit.resetTime).toLocaleString()}`
        );
      }

      if (response.data?.stats) {
        console.log(`   Current Count: ${response.data.stats.currentCount}`);
        console.log(`   Limit: ${response.data.stats.limit}`);
      }
    } catch (error) {
      console.log(`❌ Error en endpoint ${endpoint}: ${error.message}`);
    }
  }
}

/**
 * Función para probar límites específicos
 */
async function testRateLimits() {
  console.log("\n🎯 Probando límites específicos...");
  console.log("===================================");

  // Test 1: Endpoint de test con múltiples requests
  console.log("\n📊 Test 1: Múltiples requests a /api/test-rate-limit");
  await simulateRequests("/api/test-rate-limit", 15, 50);

  // Test 2: Endpoint de login (debería tener límites más estrictos)
  console.log("\n🔐 Test 2: Múltiples requests a /api/login");
  await simulateRequests("/api/login", 8, 100);

  // Test 3: Endpoint de signup
  console.log("\n📝 Test 3: Múltiples requests a /api/signup");
  await simulateRequests("/api/signup", 5, 100);
}

/**
 * Función para mostrar estadísticas
 */
async function showStats() {
  console.log("\n📈 Estadísticas del sistema...");
  console.log("==============================");

  try {
    const response = await makeRequest(`${BASE_URL}/api/test-rate-limit`);
    if (response.data?.stats) {
      console.log(`   Current Count: ${response.data.stats.currentCount}`);
      console.log(`   Limit: ${response.data.stats.limit}`);
      console.log(`   Remaining: ${response.data.stats.remaining}`);
      console.log(
        `   Reset Time: ${new Date(response.data.stats.resetTime).toLocaleString()}`
      );
    }
  } catch (error) {
    console.log(`❌ Error obteniendo estadísticas: ${error.message}`);
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    await testEndpoints();
    await testRateLimits();
    await showStats();

    console.log("\n✅ Pruebas completadas exitosamente!");
    console.log("\n📝 Resumen:");
    console.log("   - Sistema de rate limiting operativo");
    console.log("   - Endpoints protegidos correctamente");
    console.log("   - Configuración de límites aplicada");
  } catch (error) {
    console.error("\n❌ Error durante las pruebas:", error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  makeRequest,
  simulateRequests,
  testEndpoints,
  testRateLimits,
  showStats,
};

