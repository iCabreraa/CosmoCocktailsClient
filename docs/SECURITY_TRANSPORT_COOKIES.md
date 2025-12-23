# Transport & Cookie Hardening (Issue #158)

## Transport
- HSTS enabled in middleware: `Strict-Transport-Security` with preload.
- CSP and basic security headers configured in `src/middleware.ts`.

## Cookie Flags
- Auth token cookie (`/api/login`) now uses `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Supabase SSR cookies inherit defaults with `Secure` in production and `SameSite=Lax`.
- Logout deletes cookie with explicit path.

## Notes
- `Secure` is only enforced in production to avoid local HTTP breakage.
