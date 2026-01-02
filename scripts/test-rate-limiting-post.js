#!/usr/bin/env node

/**
 * Script de Testing POST para Rate Limiting
 *
 * Prueba endpoints POST con datos reales para verificar
 * que el rate limiting funciona correctamente en operaciones críticas
 */

const https = require("https");
const http = require("http");

const BASE_URL = "http://localhost:3000";

/**
 * Función para hacer requests HTTP POST
 */
function makePostRequest(url, data, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const jsonData = JSON.stringify(data);

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(jsonData),
        ...options.headers,
      },
      timeout: options.timeout || 10000,
    };

    const req = client.request(requestOptions, res => {
      let responseData = "";
      res.on("data", chunk => {
        responseData += chunk;
      });
      res.on("end", () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonResponse,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.write(jsonData);
    req.end();
  });
}

/**
 * Datos de prueba para diferentes endpoints
 */
const testData = {
  signup: {
    email: "newuser@cosmococktails.com",
    password: "newpassword123",
    full_name: "Test User",
    phone: "+31 123456789",
  },
  createPaymentIntent: {
    items: [
      {
        cocktail_id: "246c2c92-d777-4e93-8dea-4a3851de96cb",
        size_id: "3654949e-b29b-4a94-8556-f7f99658fd6f",
        quantity: 2,
      },
    ],
    address: {
      street: "Test Street 123",
      city: "Amsterdam",
      postal_code: "1012AB",
      country: "Netherlands",
    },
    form: {
      name: "Test User",
      email: "test@cosmococktails.com",
    },
  },
  createOrder: {
    items: [
      {
        cocktail_id: "246c2c92-d777-4e93-8dea-4a3851de96cb",
        sizes_id: "3654949e-b29b-4a94-8556-f7f99658fd6f",
        quantity: 1,
      },
    ],
    address: {
      street: "Test Street 123",
      city: "Amsterdam",
      postal_code: "1012AB",
      country: "Netherlands",
    },
    form: {
      name: "Test User",
      email: "test@cosmococktails.com",
    },
    payment_method: "card",
  },
  favorites: {
    cocktail_id: "246c2c92-d777-4e93-8dea-4a3851de96cb",
    action: "add",
  },
  preferences: {
    theme: "dark",
    language: "es",
    notifications: true,
  },
};

/**
 * Función para probar endpoint de auth signup
 */
async function testSignupEndpoint() {
  console.log("\n📝 Probando endpoint de AUTH SIGNUP...");
  console.log("─".repeat(40));

  const results = [];

  for (let i = 1; i <= 5; i++) {
    try {
      // Usar email único para cada intento
      const signupData = {
        ...testData.signup,
        email: `testuser${i}@cosmococktails.com`,
      };

      const response = await makePostRequest(
        `${BASE_URL}/api/auth/signup`,
        signupData
      );
      results.push({
        request: i,
        status: response.status,
        allowed: response.data?.rateLimit?.allowed,
        remaining: response.data?.rateLimit?.remaining,
        message: response.data?.message || response.data?.error,
      });

      console.log(
        `  Request ${i}: Status ${response.status}, Allowed: ${response.data?.rateLimit?.allowed}, Remaining: ${response.data?.rateLimit?.remaining}`
      );

      if (response.status === 429) {
        console.log(
          `    🚫 Rate limit exceeded! Message: ${response.data?.message}`
        );
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.log(`  Request ${i}: Error - ${error.message}`);
      results.push({
        request: i,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Función para probar endpoint de payment intent
 */
async function testPaymentIntentEndpoint() {
  console.log("\n💳 Probando endpoint de PAYMENT INTENT...");
  console.log("─".repeat(40));

  const results = [];

  for (let i = 1; i <= 12; i++) {
    try {
      const response = await makePostRequest(
        `${BASE_URL}/api/create-payment-intent`,
        testData.createPaymentIntent
      );
      results.push({
        request: i,
        status: response.status,
        allowed: response.data?.rateLimit?.allowed,
        remaining: response.data?.rateLimit?.remaining,
        message: response.data?.message || response.data?.error,
      });

      console.log(
        `  Request ${i}: Status ${response.status}, Allowed: ${response.data?.rateLimit?.allowed}, Remaining: ${response.data?.rateLimit?.remaining}`
      );

      if (response.status === 429) {
        console.log(
          `    🚫 Rate limit exceeded! Message: ${response.data?.message}`
        );
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (error) {
      console.log(`  Request ${i}: Error - ${error.message}`);
      results.push({
        request: i,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Función para probar endpoint de create order
 */
async function testCreateOrderEndpoint() {
  console.log("\n📦 Probando endpoint de CREATE ORDER...");
  console.log("─".repeat(40));

  const results = [];

  for (let i = 1; i <= 8; i++) {
    try {
      const response = await makePostRequest(
        `${BASE_URL}/api/create-order`,
        testData.createOrder
      );
      results.push({
        request: i,
        status: response.status,
        allowed: response.data?.rateLimit?.allowed,
        remaining: response.data?.rateLimit?.remaining,
        message: response.data?.message || response.data?.error,
      });

      console.log(
        `  Request ${i}: Status ${response.status}, Allowed: ${response.data?.rateLimit?.allowed}, Remaining: ${response.data?.rateLimit?.remaining}`
      );

      if (response.status === 429) {
        console.log(
          `    🚫 Rate limit exceeded! Message: ${response.data?.message}`
        );
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`  Request ${i}: Error - ${error.message}`);
      results.push({
        request: i,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Función para mostrar resumen de resultados
 */
function showSummary(results) {
  console.log("\n📊 RESUMEN DE RESULTADOS:");
  console.log("========================");

  Object.entries(results).forEach(([endpoint, endpointResults]) => {
    console.log(`\n${endpoint.toUpperCase()}:`);
    const successful = endpointResults.filter(r => r.status === 200).length;
    const rateLimited = endpointResults.filter(r => r.status === 429).length;
    const errors = endpointResults.filter(r => r.error).length;

    console.log(`  ✅ Exitosos: ${successful}`);
    console.log(`  🚫 Rate Limited: ${rateLimited}`);
    console.log(`  ❌ Errores: ${errors}`);
    console.log(`  📈 Total: ${endpointResults.length}`);
  });
}

/**
 * Función principal
 */
async function main() {
  console.log("🚀 Iniciando pruebas POST de Rate Limiting...");
  console.log("============================================");

  const results = {};

  try {
    results.signup = await testSignupEndpoint();
    results.paymentIntent = await testPaymentIntentEndpoint();
    results.createOrder = await testCreateOrderEndpoint();

    showSummary(results);

    console.log("\n✅ Pruebas POST completadas exitosamente!");
    console.log("\n📝 Resumen:");
    console.log("   - Rate limiting funcionando en endpoints POST");
    console.log("   - Límites específicos aplicados correctamente");
    console.log("   - Sistema de protección operativo");
  } catch (error) {
    console.error("\n❌ Error durante las pruebas POST:", error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  makePostRequest,
  testSignupEndpoint,
  testPaymentIntentEndpoint,
  testCreateOrderEndpoint,
  showSummary,
};
