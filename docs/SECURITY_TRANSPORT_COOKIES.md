# Transport & Cookie Hardening (Issue #158)

## Transport
- HSTS enabled in middleware: `Strict-Transport-Security` with preload.
- CSP and basic security headers configured in `src/middleware.ts`.

## Cookie Flags
- Supabase SSR cookies inherit defaults with `Secure` in production and `SameSite=Lax`.
- Logout clears Supabase session cookies.
- Legacy `/api/login` auth cookie fue retirado con la consolidación de Supabase Auth.

## Notes
- `Secure` is only enforced in production to avoid local HTTP breakage.
