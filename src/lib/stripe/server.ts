import Stripe from "stripe";
import { envServer } from "../env-server";

// Inicializar Stripe en el servidor
export const stripe = new Stripe(envServer.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

// Configuración de Stripe
export const stripeConfig = {
  secretKey: envServer.STRIPE_SECRET_KEY,
  webhookSecret: envServer.STRIPE_WEBHOOK_SECRET,
  currency: "eur",
  locale: "es",
};
