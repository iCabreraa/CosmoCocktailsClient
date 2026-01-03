import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { envServer } from "@/lib/env-server";

type AuthContext = {
  userId: string;
  role: string;
  isAdmin: boolean;
};

const adminRoles = new Set([
  "admin",
  "super_admin",
  "manager",
  "staff",
]);

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabaseAuth = createServerClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const supabase = createAdminClient(
    envServer.NEXT_PUBLIC_SUPABASE_URL,
    envServer.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: userRow } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", authUser.id)
    .single();

  const role = userRow?.role ?? "customer";

  return {
    userId: authUser.id,
    role,
    isAdmin: adminRoles.has(role),
  };
}
