// Tipos para integración con Stripe
export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "canceled"
    | "succeeded";
  client_secret: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type:
    | "card"
    | "sepa_debit"
    | "ideal"
    | "sofort"
    | "bancontact"
    | "eps"
    | "giropay"
    | "p24";
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key?: string;
  };
}

// Eventos específicos de webhook que manejamos
export type StripeWebhookEventType =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "payment_intent.canceled"
  | "payment_intent.requires_action"
  | "checkout.session.completed"
  | "checkout.session.expired"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed";

export interface StripeCheckoutSession {
  id: string;
  payment_intent?: string;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  status: "open" | "complete" | "expired";
  customer_email?: string;
  amount_total: number;
  currency: string;
  metadata?: Record<string, string>;
}

// Configuración de productos para Stripe
export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, string>;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  active: boolean;
  metadata?: Record<string, string>;
}

// Respuestas de la API
export interface CreatePaymentIntentResponse {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

export interface WebhookHandlerResponse {
  success: boolean;
  message: string;
  orderId?: string;
}
