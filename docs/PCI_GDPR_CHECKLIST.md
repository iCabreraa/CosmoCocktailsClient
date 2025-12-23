# PCI / GDPR Checklist (Issue #159)

## PCI (Payments)
- [x] Card data handled by Stripe (Elements / Payment Intents).
- [x] No card PAN/CVV stored in application DB.
- [x] Only Stripe `payment_intent_id` persisted in `orders`.
- [x] Metadata sent to Stripe includes item IDs and totals only.

Evidence
- `src/app/api/create-payment-intent/route.ts` uses Stripe payment intents.
- `src/app/api/create-order/route.ts` stores `payment_intent_id` only.

## GDPR (Personal Data)
- [x] PII stored in `users`, `orders`, `clients` (email, name, phone, address).
- [x] PII transmitted via checkout and contact forms.
- [ ] Privacy policy / consent copy reviewed and surfaced in UI.
- [ ] Data retention policy documented.
- [ ] Provide user data export/delete process.

Notes
- Client-side `localStorage` fallback stores PII (`useClientData`).
- Server logs currently include PII in `/api/contact` and checkout logs.

Recommended Follow-ups
- #158 remove/redact PII logs, harden cookies.
- Remove or minimize PII in localStorage.
- Add privacy policy/consent text to checkout and contact.
