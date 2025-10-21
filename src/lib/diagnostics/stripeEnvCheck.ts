export function warnIfStripeEnvInvalid(): void {
  if (process.env.NODE_ENV !== "development") return;
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhook = process.env.STRIPE_WEBHOOK_SECRET;

  const missing: string[] = [];
  if (!publishable) missing.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  if (!secret) missing.push("STRIPE_SECRET_KEY");
  if (!webhook) missing.push("STRIPE_WEBHOOK_SECRET");

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[StripeEnvCheck] Missing env vars: ${missing.join(", ")}. ` +
        "Stripe checkout/webhooks may fail. Configure .env.local accordingly."
    );
  }
}

