/**
 * Módulo de Validación
 *
 * Exporta todos los esquemas y utilidades de validación para uso en la aplicación
 *
 * @fileoverview Módulo principal de validación
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

// Esquemas de validación
export * from "./schemas";

// Utilidades de validación
export * from "./utils";

// Re-exportar Zod para conveniencia
export { z } from "zod";

