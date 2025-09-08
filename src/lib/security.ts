// Configuración de seguridad básica
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://qpztyzhosqbmzptazlnx.supabase.co",
    "font-src 'self'",
    "connect-src 'self' https://qpztyzhosqbmzptazlnx.supabase.co",
    "frame-ancestors 'none'",
  ].join('; '),
};

export function getSecurityHeaders() {
  return securityHeaders;
}
