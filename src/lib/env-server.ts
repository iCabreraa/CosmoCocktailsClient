import { z } from "zod";

const serverEnvSchema = z.object({
  // Public required for some server operations too
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Private secrets (never imported in client components)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
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
