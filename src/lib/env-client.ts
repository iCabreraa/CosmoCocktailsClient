import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),
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
