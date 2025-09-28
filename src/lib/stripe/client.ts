import { loadStripe } from "@stripe/stripe-js";
import { env } from "../env";

// Inicializar Stripe en el cliente
export const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

// Configuración de Stripe
export const stripeConfig = {
  publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  currency: "eur",
  locale: "es",
};
