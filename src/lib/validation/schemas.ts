/**
 * Esquemas de Validación con Zod
 *
 * Centraliza todas las validaciones de la aplicación para mantener consistencia
 * y facilitar el mantenimiento de las reglas de negocio.
 *
 * @fileoverview Esquemas de validación centralizados
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { z } from "zod";

// ============================================================================
// ESQUEMAS BASE
// ============================================================================

/**
 * Esquema base para UUIDs
 */
export const uuidSchema = z.string().uuid("ID debe ser un UUID válido");

/**
 * Esquema base para emails
 */
export const emailSchema = z
  .string()
  .email("Email debe tener un formato válido")
  .min(1, "Email es requerido")
  .max(255, "Email no puede exceder 255 caracteres");

/**
 * Esquema base para contraseñas
 */
export const passwordSchema = z
  .string()
  .min(8, "Contraseña debe tener al menos 8 caracteres")
  .max(128, "Contraseña no puede exceder 128 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Contraseña debe contener al menos una minúscula, una mayúscula y un número"
  );

/**
 * Esquema base para nombres
 */
export const nameSchema = z
  .string()
  .min(1, "Nombre es requerido")
  .max(100, "Nombre no puede exceder 100 caracteres")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    "Nombre solo puede contener letras y espacios"
  );

/**
 * Esquema base para teléfonos
 */
export const phoneSchema = z
  .string()
  .min(1, "Teléfono es requerido")
  .max(20, "Teléfono no puede exceder 20 caracteres")
  .regex(
    /^[\+]?[0-9\s\-\(\)]+$/,
    "Teléfono debe contener solo números, espacios, guiones y paréntesis"
  );

/**
 * Esquema base para cantidades
 */
export const quantitySchema = z
  .number()
  .int("Cantidad debe ser un número entero")
  .min(1, "Cantidad debe ser al menos 1")
  .max(100, "Cantidad no puede exceder 100");

/**
 * Esquema base para precios
 */
export const priceSchema = z
  .number()
  .positive("Precio debe ser positivo")
  .max(9999.99, "Precio no puede exceder 9999.99");

// ============================================================================
// ESQUEMAS DE USUARIO
// ============================================================================

/**
 * Esquema para registro de usuario
 */
export const userSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: nameSchema,
  phone: phoneSchema,
});

/**
 * Esquema para login de usuario
 */
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Contraseña es requerida"),
});

/**
 * Esquema para actualización de perfil de usuario
 */
export const userUpdateSchema = z.object({
  full_name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  avatar_url: z.string().url("URL de avatar debe ser válida").optional(),
});

// ============================================================================
// ESQUEMAS DE DIRECCIÓN
// ============================================================================

/**
 * Esquema para direcciones de usuario
 */
export const addressSchema = z.object({
  street: z
    .string()
    .min(1, "Calle es requerida")
    .max(200, "Calle no puede exceder 200 caracteres"),
  city: z
    .string()
    .min(1, "Ciudad es requerida")
    .max(100, "Ciudad no puede exceder 100 caracteres"),
  postal_code: z
    .string()
    .min(1, "Código postal es requerido")
    .max(20, "Código postal no puede exceder 20 caracteres")
    .regex(
      /^[0-9\-\s]+$/,
      "Código postal debe contener solo números, guiones y espacios"
    ),
  country: z
    .string()
    .min(1, "País es requerido")
    .max(100, "País no puede exceder 100 caracteres"),
  is_default: z.boolean().optional(),
});

// ============================================================================
// ESQUEMAS DE PRODUCTOS
// ============================================================================

/**
 * Esquema para creación de cócteles
 */
export const cocktailCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre del cóctel es requerido")
    .max(100, "Nombre no puede exceder 100 caracteres"),
  description: z
    .string()
    .min(1, "Descripción es requerida")
    .max(1000, "Descripción no puede exceder 1000 caracteres"),
  category: z
    .string()
    .min(1, "Categoría es requerida")
    .max(50, "Categoría no puede exceder 50 caracteres"),
  alcohol_content: z
    .number()
    .min(0, "Contenido de alcohol no puede ser negativo")
    .max(100, "Contenido de alcohol no puede exceder 100%"),
  image_url: z.string().url("URL de imagen debe ser válida").optional(),
});

/**
 * Esquema para actualización de cócteles
 */
export const cocktailUpdateSchema = cocktailCreateSchema.partial();

/**
 * Esquema para tamaños de cócteles
 */
export const cocktailSizeSchema = z.object({
  cocktail_id: uuidSchema,
  sizes_id: uuidSchema,
  price: priceSchema,
  stock_quantity: z
    .number()
    .int("Stock debe ser un número entero")
    .min(0, "Stock no puede ser negativo")
    .max(1000, "Stock no puede exceder 1000"),
  available: z.boolean(),
});

// ============================================================================
// ESQUEMAS DE CARRITO Y ÓRDENES
// ============================================================================

/**
 * Esquema para items del carrito
 */
export const cartItemSchema = z.object({
  cocktail_id: uuidSchema,
  sizes_id: uuidSchema,
  quantity: quantitySchema,
});

/**
 * Esquema para creación de órdenes
 */
export const orderCreateSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, "Debe incluir al menos un item")
    .max(20, "No puede exceder 20 items por orden"),
  address: addressSchema,
  payment_method: z.enum(["card", "cash", "bizum"], {
    message: "Método de pago debe ser: card, cash o bizum",
  }),
  notes: z
    .string()
    .max(500, "Notas no pueden exceder 500 caracteres")
    .optional(),
});

/**
 * Esquema para items de orden
 */
export const orderItemSchema = z.object({
  cocktail_id: uuidSchema,
  sizes_id: uuidSchema,
  quantity: quantitySchema,
  unit_price: priceSchema,
});

// ============================================================================
// ESQUEMAS DE PAGO
// ============================================================================

/**
 * Esquema para creación de Payment Intent
 */
export const paymentIntentSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Debe incluir al menos un item"),
  address: addressSchema,
  currency: z.literal("eur", {
    message: "Moneda debe ser EUR",
  }),
});

// ============================================================================
// ESQUEMAS DE FAVORITOS Y PREFERENCIAS
// ============================================================================

/**
 * Esquema para favoritos
 */
export const favoriteSchema = z.object({
  cocktail_id: uuidSchema,
});

/**
 * Esquema para preferencias de usuario
 */
export const userPreferencesSchema = z.object({
  language: z.enum(["es", "en", "nl"], {
    message: "Idioma debe ser: es, en o nl",
  }),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  dietary_restrictions: z
    .array(z.string())
    .max(10, "No puede exceder 10 restricciones dietéticas"),
});

// ============================================================================
// ESQUEMAS DE CONTACTO
// ============================================================================

/**
 * Esquema para formulario de contacto
 */
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .min(1, "Asunto es requerido")
    .max(200, "Asunto no puede exceder 200 caracteres"),
  message: z
    .string()
    .min(10, "Mensaje debe tener al menos 10 caracteres")
    .max(2000, "Mensaje no puede exceder 2000 caracteres"),
  phone: phoneSchema.optional(),
});

// ============================================================================
// ESQUEMAS DE ADMINISTRACIÓN
// ============================================================================

/**
 * Esquema para actualización de roles
 */
export const roleUpdateSchema = z.object({
  user_id: uuidSchema,
  role: z.enum(["admin", "staff", "customer"], {
    message: "Rol debe ser: admin, staff o customer",
  }),
});

/**
 * Esquema para actualización de stock
 */
export const stockUpdateSchema = z.object({
  cocktail_id: uuidSchema,
  sizes_id: uuidSchema,
  quantity: z
    .number()
    .int("Cantidad debe ser un número entero")
    .min(0, "Cantidad no puede ser negativa"),
});

// ============================================================================
// ESQUEMAS DE QUERY PARAMETERS
// ============================================================================

/**
 * Esquema para parámetros de paginación
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Página debe ser un número")
    .transform(Number)
    .refine(n => n >= 1, "Página debe ser al menos 1")
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Límite debe ser un número")
    .transform(Number)
    .refine(n => n >= 1 && n <= 100, "Límite debe estar entre 1 y 100")
    .optional(),
});

/**
 * Esquema para filtros de productos
 */
export const productFiltersSchema = z.object({
  category: z.string().optional(),
  min_price: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Precio mínimo debe ser un número")
    .transform(Number)
    .refine(n => n >= 0, "Precio mínimo no puede ser negativo")
    .optional(),
  max_price: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Precio máximo debe ser un número")
    .transform(Number)
    .refine(n => n >= 0, "Precio máximo no puede ser negativo")
    .optional(),
  available: z
    .string()
    .transform(val => val === "true")
    .optional(),
});

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type UserSignupInput = z.infer<typeof userSignupSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CocktailCreateInput = z.infer<typeof cocktailCreateSchema>;
export type CocktailUpdateInput = z.infer<typeof cocktailUpdateSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;
export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
