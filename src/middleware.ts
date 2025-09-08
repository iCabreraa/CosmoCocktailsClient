import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders } from "./lib/security";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    // 1. Manejar autenticación con Supabase
    const supabaseResponse = await updateSession(request);

    // 2. Aplicar headers de seguridad
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      supabaseResponse.headers.set(key, value);
    });

    // 3. Headers adicionales para rendimiento y seguridad
    supabaseResponse.headers.set("X-DNS-Prefetch-Control", "on");
    supabaseResponse.headers.set("X-XSS-Protection", "1; mode=block");
    supabaseResponse.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );

    // 4. Cache control para assets estáticos
    if (request.nextUrl.pathname.startsWith("/_next/static/")) {
      supabaseResponse.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);

    // En caso de error, devolver respuesta básica con headers de seguridad
    const response = NextResponse.next();
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
