import { createBrowserClient } from "@supabase/ssr";
import { envClient } from "../env-client";

// Singleton pattern: solo una instancia en todo el cliente
let supabaseClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      envClient.NEXT_PUBLIC_SUPABASE_URL,
      envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return supabaseClient;
}
