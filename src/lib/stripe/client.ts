import { loadStripe } from "@stripe/stripe-js";
import { envClient } from "../env-client";

// Inicializar Stripe en el cliente
export const stripePromise = loadStripe(
  envClient.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Configuración de Stripe
export const stripeConfig = {
  publishableKey: envClient.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  currency: "eur",
  locale: "es",
};
