import { createClient } from "@supabase/supabase-js";
import { envClient } from "../env-client";

let publicClient:
  | ReturnType<typeof createClient>
  | undefined;

export function createPublicClient() {
  if (!publicClient) {
    publicClient = createClient(
      envClient.NEXT_PUBLIC_SUPABASE_URL,
      envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            apikey: envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        },
      }
    );
  }
  return publicClient;
}
