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

  // Build a CSP compatible with Stripe/Supabase, using a per-request nonce
  const nonce = crypto.randomUUID();
  const nonceDirective = `'nonce-${nonce}'`;

  const stripeJs = "https://js.stripe.com";
  const stripeApi = "https://api.stripe.com";
  const stripeNetwork = "https://m.stripe.network";
  const stripeTelemetry = "https://r.stripe.com";
  const stripeFrames = "https://hooks.stripe.com";
  const vercelInsightsScript = "https://va.vercel-scripts.com";
  const vercelInsightsConnect = "https://vitals.vercel-insights.com";
  const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const connectSrc = [
    "'self'",
    stripeApi,
    stripeNetwork,
    stripeTelemetry,
    vercelInsightsConnect,
    supabaseProjectUrl,
  ]
    .filter(Boolean)
    .join(" ");

  const isDev = process.env.NODE_ENV === "development";

  const scriptSrcParts = ["'self'", nonceDirective, stripeJs, vercelInsightsScript];

  // Next.js dev server uses eval for source maps; permit only in development
  if (isDev) {
    scriptSrcParts.push("'unsafe-eval'");
    scriptSrcParts.push("'unsafe-inline'");
  }

  const scriptSrc = scriptSrcParts.join(" ");

  const imgSrc = "'self' data: https: blob:";
  const styleSrcParts = ["'self'", nonceDirective];
  if (isDev) {
    styleSrcParts.push("'unsafe-inline'");
  }
  const styleSrc = styleSrcParts.join(" ");

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    "style-src-attr 'unsafe-inline'",
    `connect-src ${connectSrc}`,
    "img-src " + imgSrc,
    "font-src 'self' data:",
    `frame-src 'self' ${stripeJs} ${stripeFrames}`,
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
