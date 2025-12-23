# Security Data Audit (Issue #157)

## Scope
- Ecommerce app (client + API routes).
- Identify PII, tokens, and payment-related data.
- Focus on storage, transmission, and exposure via logs/responses.

## Inventory
| Area | Data | Storage | Transmission | Notes/Risks |
| --- | --- | --- | --- | --- |
| Auth session | Supabase access/refresh tokens | Cookies via `@supabase/ssr` | Browser <-> API | Managed by Supabase; verify cookie flags in #158. |
| User profile | `email`, `full_name`, `phone`, `avatar_url`, `role` | Supabase `users` table | `/api/users`, `/api/users/[id]` | Endpoints do not enforce auth; relies on RLS. |
| Client profile (guest) | `email`, `full_name`, `phone`, `address` | Supabase `clients` table + `localStorage` (`client_${email}`) | `useClientData` | PII stored client-side; logs include PII. |
| Orders | `user_id`, totals, `payment_intent_id`, `shipping_address` JSON | Supabase `orders` table | `/api/create-order`, `/api/orders/[id]` | `orders/[id]` uses service role and returns shipping address. |
| Order items | `cocktail_id`, `sizes_id`, `quantity`, `unit_price` | Supabase `order_items` | Checkout + Stripe metadata | Not PII; still order context. |
| Contact form | `name`, `email`, `subject`, `message`, `phone`, `ip`, `userAgent` | Not persisted (email/send) | `/api/contact` | PII logged in server console. |
| Cart | `cocktail_id`, `sizes_id`, `unit_price`, `quantity` | `localStorage` (`cosmic-cocktails-cart`) | Client only | Not PII; ok. |
| Preferences | `theme`, `language` | `localStorage` | Client only | Not PII. |
| Stripe payment | Payment intent id + totals | Stripe + `orders.payment_intent_id` | `/api/create-payment-intent` | Card data handled by Stripe (not stored). |

## Logging / Exposure Findings
- `cosmococktails-ecommerce/src/app/api/create-payment-intent/route.ts` logs items and shipping address (PII).
- `cosmococktails-ecommerce/src/app/api/contact/route.ts` logs contact payload with email, phone, IP.
- `cosmococktails-ecommerce/src/hooks/useClientData.ts` logs client records; also stores PII in `localStorage`.
- `cosmococktails-ecommerce/src/app/api/orders/[id]/route.ts` uses service role key and returns shipping address without auth.
- `cosmococktails-ecommerce/src/app/api/users/route.ts` and `cosmococktails-ecommerce/src/app/api/users/[id]/route.ts` return user data without auth (depends on RLS).

## Risks Summary
- PII in logs (contact + checkout + client data) can leak in shared logging pipelines.
- Public API routes exposing user/order data if RLS or routing is misconfigured.
- Client-side `localStorage` holds user PII (email, phone, address) in `useClientData`.
- Service role key usage in public endpoints increases blast radius of auth issues.

## Suggested Follow-ups (out of scope for #157)
- Remove or redact PII logs; add structured logging with safe fields (#158).
- Require auth + role checks for `/api/users*` and `/api/orders/[id]` (#158/#159).
- Reduce client-side PII persistence or encrypt; prefer server storage only (#159).
- Review cookie flags and transport security (HTTPS/SameSite/Secure) (#158).
