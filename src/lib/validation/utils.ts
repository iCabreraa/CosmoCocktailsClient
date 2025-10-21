/**
 * Utilidades de Validación
 *
 * Funciones helper para validar datos con Zod y manejar errores de forma consistente
 *
 * @fileoverview Utilidades de validación centralizadas
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// TIPOS DE ERROR
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida datos con un esquema Zod y retorna resultado estructurado
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.issues.map(err => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: [
        {
          field: "unknown",
          message: "Error de validación desconocido",
          code: "unknown",
        },
      ],
    };
  }
}

/**
 * Valida datos de forma segura (no lanza excepciones)
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result;
}

/**
 * Valida el body de una request de Next.js
 */
export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    return validateData(schema, body);
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: "body",
          message: "Body de la request no es JSON válido",
          code: "invalid_json",
        },
      ],
    };
  }
}

/**
 * Valida query parameters de una request
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest
): ValidationResult<T> {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  return validateData(schema, params);
}

/**
 * Valida parámetros de ruta dinámica
 */
export function validateRouteParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[] | undefined>
): ValidationResult<T> {
  return validateData(schema, params);
}

// ============================================================================
// FUNCIONES DE SANITIZACIÓN
// ============================================================================

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remover < y >
    .replace(/javascript:/gi, "") // Remover javascript:
    .replace(/on\w+=/gi, ""); // Remover event handlers
}

/**
 * Sanitiza un objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      (sanitized as any)[key] = sanitizeString(sanitized[key] as string);
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      (sanitized as any)[key] = sanitizeObject(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Sanitiza datos antes de la validación
 */
export function sanitizeAndValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  if (typeof data === "object" && data !== null) {
    const sanitized = sanitizeObject(data as Record<string, any>);
    return validateData(schema, sanitized);
  }

  return validateData(schema, data);
}

// ============================================================================
// FUNCIONES DE MANEJO DE ERRORES
// ============================================================================

/**
 * Convierte errores de validación a mensajes de usuario
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map(error => {
    switch (error.code) {
      case "invalid_type":
        return `El campo ${error.field} tiene un tipo incorrecto`;
      case "too_small":
        return `El campo ${error.field} es demasiado pequeño`;
      case "too_big":
        return `El campo ${error.field} es demasiado grande`;
      case "invalid_string":
        return `El campo ${error.field} tiene un formato inválido`;
      case "invalid_email":
        return `El campo ${error.field} debe ser un email válido`;
      case "invalid_uuid":
        return `El campo ${error.field} debe ser un ID válido`;
      default:
        return error.message;
    }
  });
}

/**
 * Crea respuesta de error para APIs
 */
export function createValidationErrorResponse(
  errors: ValidationError[],
  status: number = 400
) {
  return NextResponse.json(
    {
      success: false,
      message: "Error de validación",
      errors: formatValidationErrors(errors),
      details: errors,
    },
    { status }
  );
}

/**
 * Middleware de validación para API routes
 */
export function createValidationMiddleware<T>(
  schema: z.ZodSchema<T>,
  options: {
    sanitize?: boolean;
    source?: "body" | "query" | "params";
  } = {}
) {
  return async (request: NextRequest, params?: Record<string, string>) => {
    const { sanitize = true, source = "body" } = options;

    let validationResult: ValidationResult<T>;

    switch (source) {
      case "body":
        validationResult = await validateRequestBody(schema, request);
        break;
      case "query":
        validationResult = validateQueryParams(schema, request);
        break;
      case "params":
        if (!params) {
          return {
            success: false,
            errors: [
              {
                field: "params",
                message: "Parámetros no encontrados",
                code: "missing_params",
              },
            ],
          };
        }
        validationResult = validateRouteParams(schema, params);
        break;
      default:
        return {
          success: false,
          errors: [
            {
              field: "source",
              message: "Fuente de validación inválida",
              code: "invalid_source",
            },
          ],
        };
    }

    if (!validationResult.success) {
      return validationResult;
    }

    if (sanitize && validationResult.data) {
      const sanitizedResult = sanitizeAndValidate(
        schema,
        validationResult.data
      );
      return sanitizedResult;
    }

    return validationResult;
  };
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN ESPECÍFICAS
// ============================================================================

/**
 * Valida que un usuario tenga permisos para acceder a un recurso
 */
export function validateUserAccess(
  userId: string,
  resourceUserId: string,
  userRole: string
): boolean {
  // Admin puede acceder a todo
  if (userRole === "admin") return true;

  // Staff puede acceder a recursos de customers
  if (userRole === "staff") return true;

  // Customer solo puede acceder a sus propios recursos
  return userId === resourceUserId;
}

/**
 * Valida que un usuario tenga un rol específico
 */
export function validateUserRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Valida que un precio esté dentro de un rango aceptable
 */
export function validatePriceRange(
  price: number,
  min: number = 0,
  max: number = 9999.99
): boolean {
  return price >= min && price <= max;
}

/**
 * Valida que una cantidad esté disponible en stock
 */
export function validateStockAvailability(
  requested: number,
  available: number
): boolean {
  return requested > 0 && requested <= available;
}

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

export const VALIDATION_LIMITS = {
  MAX_STRING_LENGTH: 1000,
  MAX_EMAIL_LENGTH: 255,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_PHONE_LENGTH: 20,
  MAX_ADDRESS_LENGTH: 200,
  MAX_CITY_LENGTH: 100,
  MAX_POSTAL_CODE_LENGTH: 20,
  MAX_COUNTRY_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 500,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_SUBJECT_LENGTH: 200,
  MAX_QUANTITY: 100,
  MAX_STOCK: 1000,
  MAX_PRICE: 9999.99,
  MAX_ITEMS_PER_ORDER: 20,
  MAX_DIETARY_RESTRICTIONS: 10,
} as const;

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[0-9\s\-\(\)]+$/,
  POSTAL_CODE: /^[0-9\-\s]+$/,
  NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
} as const;
