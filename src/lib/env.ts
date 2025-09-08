import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  NEXT_PUBLIC_ADMIN_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Función para validar variables de entorno con mejor manejo de errores
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("❌ Error de validación de variables de entorno:");
    if (error instanceof z.ZodError) {
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    // En desarrollo, usar valores por defecto para continuar
    if (process.env.NODE_ENV === 'development') {
      console.warn("⚠️ Usando valores por defecto para desarrollo...");
      return {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key",
        JWT_SECRET: process.env.JWT_SECRET || "your_super_secret_jwt_key_that_is_at_least_32_characters_long_for_security",
        NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001",
        NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
      };
    }
    
    throw error;
  }
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
