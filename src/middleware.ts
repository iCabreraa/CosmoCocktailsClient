import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitMiddleware } from "@/lib/rate-limiting";

// Secure middleware with minimal, Stripe/Supabase-compatible CSP and security headers
export async function middleware(request: NextRequest) {
  // Apply rate limiting first for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  const response = NextResponse.next();

  // Build a minimal CSP compatible with Stripe and Supabase
  // Use a simple nonce for now (will be improved later)
  const nonce = "nextjs-nonce";

  const stripeJs = "https://js.stripe.com";
  const stripeApi = "https://api.stripe.com";
  const vercelInsightsScript = "https://va.vercel-scripts.com";
  const vercelInsightsConnect = "https://vitals.vercel-insights.com";
  const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const connectSrc = [
    "'self'",
    stripeApi,
    vercelInsightsConnect,
    supabaseProjectUrl,
  ]
    .filter(Boolean)
    .join(" ");

  const isDev = process.env.NODE_ENV === "development";
  
  // SOLUCIÓN TEMPORAL: Permitir scripts inline en producción para Next.js
  const scriptSrcParts = [
    "'self'",
    "'unsafe-inline'", // Temporal: permitir scripts inline
    stripeJs,
    vercelInsightsScript,
  ];
  
  // Next.js dev server uses eval for source maps; permit only in development
  if (isDev) {
    scriptSrcParts.push("'unsafe-eval'");
  }
  
  const scriptSrc = scriptSrcParts.join(" ");

  const imgSrc = "'self' data: https: blob:";

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `connect-src ${connectSrc}`,
    "img-src " + imgSrc,
    "font-src 'self' data:",
    `frame-src ${stripeJs}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  // Security headers
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=15552000; includeSubDomains; preload"
  );
  
  // Pass nonce to the response for use in layout
  response.headers.set("X-Nonce", nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     *
     * Note: API routes are now included for rate limiting
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
