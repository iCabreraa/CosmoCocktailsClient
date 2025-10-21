/**
 * Rate Limiting Configuration
 *
 * Configuración de variables de entorno para Vercel KV
 * Maneja la duplicación de prefijos que genera Vercel automáticamente
 *
 * @fileoverview Configuración de variables de entorno para rate limiting
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

/**
 * Obtiene la URL de la API REST de Vercel KV
 * Maneja tanto el formato duplicado (KV_KV_REST_API_URL) como el simple (KV_REST_API_URL)
 */
export function getKVUrl(): string {
  // Prioridad: Variables con prefijo duplicado (generadas por Vercel)
  const kvUrl = process.env.KV_KV_REST_API_URL || process.env.KV_REST_API_URL;

  if (!kvUrl) {
    throw new Error(
      "❌ KV_REST_API_URL no encontrada. " +
        "Variables disponibles: " +
        Object.keys(process.env)
          .filter(key => key.includes("KV"))
          .join(", ")
    );
  }

  return kvUrl;
}

/**
 * Obtiene el token de la API REST de Vercel KV
 * Maneja tanto el formato duplicado (KV_KV_REST_API_TOKEN) como el simple (KV_REST_API_TOKEN)
 */
export function getKVToken(): string {
  // Prioridad: Variables con prefijo duplicado (generadas por Vercel)
  const kvToken =
    process.env.KV_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!kvToken) {
    throw new Error(
      "❌ KV_REST_API_TOKEN no encontrado. " +
        "Variables disponibles: " +
        Object.keys(process.env)
          .filter(key => key.includes("KV"))
          .join(", ")
    );
  }

  return kvToken;
}

/**
 * Verifica que las variables de entorno de Vercel KV estén configuradas
 */
export function validateKVConfig(): boolean {
  try {
    getKVUrl();
    getKVToken();
    return true;
  } catch (error) {
    console.error("🚨 Error de configuración Vercel KV:", error);
    return false;
  }
}

/**
 * Obtiene información de debug sobre las variables de entorno disponibles
 */
export function getKVConfigDebug(): {
  availableVars: string[];
  kvUrl: string | null;
  kvToken: string | null;
  isValid: boolean;
} {
  const availableVars = Object.keys(process.env).filter(key =>
    key.includes("KV")
  );

  let kvUrl: string | null = null;
  let kvToken: string | null = null;

  try {
    kvUrl = getKVUrl();
  } catch (error) {
    // Ignorar error, ya está en null
  }

  try {
    kvToken = getKVToken();
  } catch (error) {
    // Ignorar error, ya está en null
  }

  return {
    availableVars,
    kvUrl,
    kvToken,
    isValid: kvUrl !== null && kvToken !== null,
  };
}

