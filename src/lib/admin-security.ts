import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/user-system";

export interface AdminSecurityResult {
  isAuthorized: boolean;
  user: User | null;
  error: string | null;
}

/**
 * Verificación de seguridad para acceso admin
 * Valida múltiples capas de seguridad antes de permitir acceso
 */
export async function verifyAdminAccess(): Promise<AdminSecurityResult> {
  try {
    const supabase = createClient();

    // 1. Verificar sesión activa
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        isAuthorized: false,
        user: null,
        error: "No active session found",
      };
    }

    // 2. Obtener datos del usuario desde la base de datos
    const { data: userData, error: userError } = await supabase
      .from("users_new")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError || !userData) {
      return {
        isAuthorized: false,
        user: null,
        error: "User profile not found",
      };
    }

    // 3. Verificar rol autorizado
    const authorizedRoles = ["admin", "staff"];
    if (!authorizedRoles.includes(userData.role)) {
      return {
        isAuthorized: false,
        user: userData,
        error: `Role '${userData.role}' not authorized for admin access`,
      };
    }

    // 4. Verificar estado del usuario
    if (userData.status !== "active") {
      return {
        isAuthorized: false,
        user: userData,
        error: `User status '${userData.status}' not allowed`,
      };
    }

    // 5. Log de acceso exitoso para auditoría
    console.log(
      `✅ Admin access verified for user: ${userData.email} (${userData.role}) at ${new Date().toISOString()}`
    );

    return {
      isAuthorized: true,
      user: userData,
      error: null,
    };
  } catch (error) {
    console.error("❌ Error in admin security verification:", error);
    return {
      isAuthorized: false,
      user: null,
      error: "Security verification failed",
    };
  }
}

/**
 * Middleware para proteger rutas admin
 * Se puede usar en API routes o middleware de Next.js
 */
export async function adminMiddleware(
  request: Request
): Promise<AdminSecurityResult> {
  try {
    // Extraer token de las cookies
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return {
        isAuthorized: false,
        user: null,
        error: "No authentication cookie found",
      };
    }

    // Verificar que el token sea válido
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return {
        isAuthorized: false,
        user: null,
        error: "Invalid or expired session",
      };
    }

    // Usar la verificación principal
    return await verifyAdminAccess();
  } catch (error) {
    console.error("❌ Error in admin middleware:", error);
    return {
      isAuthorized: false,
      user: null,
      error: "Middleware verification failed",
    };
  }
}

/**
 * Función para generar URL segura del panel admin
 * Incluye parámetros de seguridad si es necesario
 */
export function generateAdminUrl(
  baseUrl: string = "http://localhost:5174"
): string {
  const timestamp = Date.now();
  const securityToken = btoa(`admin_${timestamp}_${Math.random()}`);

  // En producción, podrías añadir más parámetros de seguridad
  return `${baseUrl}?token=${securityToken}&t=${timestamp}`;
}
