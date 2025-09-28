"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock, AlertTriangle } from "lucide-react";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface StripePaymentProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
}

function PaymentForm({
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setError(error.message || "Error procesando el pago");
        onPaymentError(error.message || "Error procesando el pago");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado";
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
        <h3 className="text-lg font-[--font-unica] text-cosmic-gold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Información de Pago
        </h3>

        <div className="space-y-4">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-cosmic-gold text-black hover:bg-cosmic-gold/80 transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            Procesando...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pagar Ahora
          </>
        )}
      </button>

      <div className="flex items-center gap-2 text-xs text-cosmic-fog">
        <Lock className="w-3 h-3" />
        <span>Pago seguro procesado por Stripe</span>
      </div>
    </form>
  );
}

export default function StripePayment({
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
}: StripePaymentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
        <div className="animate-pulse">
          <div className="h-4 bg-cosmic-fog/20 rounded mb-4"></div>
          <div className="h-10 bg-cosmic-fog/20 rounded mb-4"></div>
          <div className="h-10 bg-cosmic-fog/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#D4AF37",
            colorBackground: "#1a1a1a",
            colorText: "#D8DAE3",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
          },
        },
      }}
    >
      <PaymentForm
        clientSecret={clientSecret}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
}
