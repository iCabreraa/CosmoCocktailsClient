"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { envClient } from "@/lib/env-client";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import { CartItem } from "@/types/shared";

const stripePromise = loadStripe(envClient.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentCompleteProps {
  clientSecret: string;
  items: CartItem[];
  total: number;
  user?: any;
  shippingAddress?: any;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
}

function PaymentForm({
  clientSecret,
  items,
  total,
  user,
  shippingAddress,
  onPaymentSuccess,
  onPaymentError,
}: StripePaymentCompleteProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

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
        const errorMessage =
          error instanceof Error ? error.message : "Error inesperado";
        setError(errorMessage);
        onPaymentError(errorMessage);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Crear pedido después del pago exitoso
        await createOrder(paymentIntent);
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

  const createOrder = async (paymentIntent: any) => {
    setIsCreatingOrder(true);

    try {
      const orderData = {
        items: items,
        total: total,
        user_id: user?.id || null,
        shipping_address: shippingAddress,
        payment_intent_id: paymentIntent.id,
      };

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const orderResult = await response.json();
      console.log("Order created successfully:", orderResult);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Información de Pago
          </h3>
        </div>

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

          <div className="flex items-center gap-2 text-sm text-purple-300">
            <Lock className="w-4 h-4" />
            <span>
              Tu información de pago está protegida con encriptación de nivel
              bancario
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-purple-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Procesado de forma segura por Stripe</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isLoading || isCreatingOrder}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingOrder ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creando pedido...
            </>
          ) : isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Procesando pago...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Completar Pago - €{total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function StripePaymentComplete({
  clientSecret,
  items,
  total,
  user,
  shippingAddress,
  onPaymentSuccess,
  onPaymentError,
}: StripePaymentCompleteProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm
        clientSecret={clientSecret}
        items={items}
        total={total}
        user={user}
        shippingAddress={shippingAddress}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
}
