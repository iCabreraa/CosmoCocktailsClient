import "server-only";
import { z } from "zod";

const placeholderValues = new Set([
  "https://placeholder.supabase.co",
  "placeholder_key",
  "placeholder_service_key",
  "sk_test_placeholder",
  "sk_live_placeholder",
  "whsec_placeholder",
  "a8f5f167f44f4964e6c998dee827110c",
  "b9e6e278g55g5075f7d009eff938221d",
]);

const isPlaceholder = (value: string) => placeholderValues.has(value.trim());

const serverEnvSchema = z.object({
  // Public required for some server operations too
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1)
    .refine(value => !isPlaceholder(value), {
      message: "NEXT_PUBLIC_SUPABASE_URL must be configured",
    }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1)
    .refine(value => !isPlaceholder(value), {
      message: "NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured",
    }),

  // Private secrets (never imported in client components)
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1)
    .refine(value => !isPlaceholder(value), {
      message: "SUPABASE_SERVICE_ROLE_KEY must be configured",
    }),
  STRIPE_SECRET_KEY: z
    .string()
    .min(1)
    .refine(value => !isPlaceholder(value), {
      message: "STRIPE_SECRET_KEY must be configured",
    })
    .refine(value => value.startsWith("sk_") || value.startsWith("rk_"), {
      message: "STRIPE_SECRET_KEY must start with sk_ or rk_",
    }),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1)
    .refine(value => !isPlaceholder(value), {
      message: "STRIPE_WEBHOOK_SECRET must be configured",
    })
    .refine(value => value.startsWith("whsec_"), {
      message: "STRIPE_WEBHOOK_SECRET must start with whsec_",
    }),
  JWT_SECRET: z
    .string()
    .min(1)
    .refine(value => !isPlaceholder(value), {
      message: "JWT_SECRET must be configured",
    })
    .min(32, "JWT_SECRET should be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(1)
    .refine(value => !isPlaceholder(value), {
      message: "JWT_REFRESH_SECRET must be configured",
    })
    .min(32, "JWT_REFRESH_SECRET should be at least 32 characters"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const envServer: ServerEnv = (() => {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Server env validation failed:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error("Missing required server environment variables");
  }
  return parsed.data as ServerEnv;
})();
