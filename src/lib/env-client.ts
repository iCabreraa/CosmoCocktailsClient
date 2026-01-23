import { z } from "zod";

const placeholderValues = new Set([
  "https://placeholder.supabase.co",
  "placeholder_key",
  "pk_test_placeholder",
  "pk_live_placeholder",
]);

const isPlaceholder = (value: string) => placeholderValues.has(value.trim());

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_URL is required")
    .refine(value => !isPlaceholder(value), {
      message: "NEXT_PUBLIC_SUPABASE_URL must be configured",
    }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .refine(value => !isPlaceholder(value), {
      message: "NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured",
    }),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required")
    .refine(value => !isPlaceholder(value), {
      message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be configured",
    })
    .refine(value => value.startsWith("pk_"), {
      message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_",
    }),
  NEXT_PUBLIC_STRIPE_ALLOW_TEST_PAYMENTS: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_MANAGEMENT_URL: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export const envClient: ClientEnv = (() => {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_ALLOW_TEST_PAYMENTS:
      process.env.NEXT_PUBLIC_STRIPE_ALLOW_TEST_PAYMENTS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MANAGEMENT_URL: process.env.NEXT_PUBLIC_MANAGEMENT_URL,
  });

  if (!parsed.success) {
    if (typeof window !== "undefined") {
      console.error("❌ Client env validation failed:");
      for (const issue of parsed.error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
    }
    throw new Error("Missing required NEXT_PUBLIC_* environment variables");
  }

  return parsed.data;
})();
