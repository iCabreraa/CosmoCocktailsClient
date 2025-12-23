import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
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
  const token = cookies().get("token")?.value;
  if (!token) {
    return null;
  }

  let decoded: { id: string } | null = null;
  try {
    decoded = jwt.verify(token, envServer.JWT_SECRET) as { id: string };
  } catch {
    return null;
  }

  const supabase = createClient(
    envServer.NEXT_PUBLIC_SUPABASE_URL,
    envServer.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: user, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", decoded.id)
    .single();

  if (error || !user) {
    return null;
  }

  const role = user.role ?? "customer";

  return {
    userId: user.id,
    role,
    isAdmin: adminRoles.has(role),
  };
}
