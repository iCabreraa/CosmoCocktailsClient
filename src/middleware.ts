import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders } from "./lib/security";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Primero manejar autenticación con Supabase
  const supabaseResponse = await updateSession(request);

  // Luego aplicar headers de seguridad
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value);
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
