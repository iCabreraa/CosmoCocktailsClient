import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "Supabase URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Supabase service role key is required"),
  JWT_SECRET: z.string().min(1, "JWT secret is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT refresh secret is required"),
  NEXT_PUBLIC_ADMIN_URL: z.string().optional(),

  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Stripe publishable key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Función para validar variables de entorno con mejor manejo de errores
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    // Log validation errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Error de validación de variables de entorno:");
      if (error instanceof z.ZodError) {
        error.issues.forEach(err => {
          console.error(`  - ${err.path.join(".")}: ${err.message}`);
        });
      }
      console.warn("⚠️ Usando valores por defecto para desarrollo...");

      return {
        NEXT_PUBLIC_SUPABASE_URL:
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          "https://placeholder.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key",
        SUPABASE_SERVICE_ROLE_KEY:
          process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_service_key",
        JWT_SECRET:
          process.env.JWT_SECRET || "a8f5f167f44f4964e6c998dee827110c",
        JWT_REFRESH_SECRET:
          process.env.JWT_REFRESH_SECRET || "b9e6e278g55g5075f7d009eff938221d",
        NEXT_PUBLIC_ADMIN_URL:
          process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001",
        STRIPE_SECRET_KEY:
          process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
        STRIPE_PUBLISHABLE_KEY:
          process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder",
        STRIPE_WEBHOOK_SECRET:
          process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder",
        NODE_ENV:
          (process.env.NODE_ENV as "development" | "production" | "test") ||
          "development",
      };
    }
    // En producción, propaga error claro para logs del servidor
    throw error;
  }
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
