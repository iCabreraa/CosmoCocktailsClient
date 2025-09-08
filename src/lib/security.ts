// Configuración de seguridad empresarial avanzada
interface SecurityConfig {
  isDevelopment: boolean;
  supabaseUrl: string;
}

export function getSecurityHeaders(config?: Partial<SecurityConfig>) {
  const isDev = config?.isDevelopment ?? process.env.NODE_ENV === 'development';
  const supabaseUrl = config?.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  
  // CSP más estricto para producción
  const cspDirectives = isDev ? [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ] : [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return {
    // Headers de seguridad básicos
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-DNS-Prefetch-Control": "on",
    "X-XSS-Protection": "1; mode=block",
    
    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    // Permissions Policy
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
    
    // Content Security Policy
    "Content-Security-Policy": cspDirectives.join("; "),
    
    // Strict Transport Security (solo en producción)
    ...(isDev ? {} : {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
    }),
    
    // Cross-Origin Policies
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

// Función para headers específicos de API
export function getApiSecurityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}

// Función para headers de assets estáticos
export function getStaticAssetHeaders() {
  return {
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
}
