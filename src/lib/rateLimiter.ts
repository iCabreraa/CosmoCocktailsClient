// Rate limiter simple para APIs de autenticación
const attempts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxAttempts: 5, // Máximo 5 intentos
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 30 * 60 * 1000, // Bloquear 30 minutos después de exceder límite
};

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const userAttempts = attempts.get(identifier);

  if (!userAttempts) {
    attempts.set(identifier, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxAttempts - 1,
      resetTime: now + RATE_LIMIT.windowMs,
    };
  }

  // Si el tiempo de ventana ha expirado, resetear
  if (now > userAttempts.resetTime) {
    attempts.set(identifier, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxAttempts - 1,
      resetTime: now + RATE_LIMIT.windowMs,
    };
  }

  // Si ha excedido el límite, bloquear
  if (userAttempts.count >= RATE_LIMIT.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: userAttempts.resetTime + RATE_LIMIT.blockDurationMs,
    };
  }

  // Incrementar contador
  userAttempts.count++;
  attempts.set(identifier, userAttempts);

  return {
    allowed: true,
    remaining: RATE_LIMIT.maxAttempts - userAttempts.count,
    resetTime: userAttempts.resetTime,
  };
}

export function resetRateLimit(identifier: string): void {
  attempts.delete(identifier);
}
