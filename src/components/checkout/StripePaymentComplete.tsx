"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { envClient } from "@/lib/env-client";
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PaymentRequest } from "@stripe/stripe-js";

const stripePromise = loadStripe(envClient.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const getSucceededIntentId = (error: unknown): string | null => {
  const intent = (error as { payment_intent?: { status?: string; id?: string } })
    ?.payment_intent;
  if (intent?.status === "succeeded" && typeof intent.id === "string") {
    return intent.id;
  }
  return null;
};

interface StripePaymentCompleteProps {
  clientSecret: string;
  total: number;
  draftOrderId?: string | null;
  draftOrderRef?: string | null;
  paymentsEnabled?: boolean;
  onPaymentSuccess: (payload: {
    orderId: string;
    orderRef?: string;
    paymentIntentId: string;
  }) => void;
  onPaymentError: (error: string) => void;
}

function PaymentForm({
  clientSecret,
  total,
  draftOrderId,
  draftOrderRef,
  paymentsEnabled = true,
  onPaymentSuccess,
  onPaymentError,
}: StripePaymentCompleteProps) {
  const { t } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] =
    useState<PaymentRequest | null>(null);
  const [canUsePaymentRequest, setCanUsePaymentRequest] = useState(false);
  const confirmingRef = useRef(false);

  useEffect(() => {
    if (!stripe || !clientSecret) return;
    if (!paymentsEnabled) {
      setPaymentRequest(null);
      setCanUsePaymentRequest(false);
      return;
    }
    let isMounted = true;
    const pr = stripe.paymentRequest({
      country: "NL",
      currency: "eur",
      total: {
        label: "CosmoCocktails",
        amount: Math.round(total * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then(result => {
      if (!isMounted) return;
      if (result) {
        setPaymentRequest(pr);
        setCanUsePaymentRequest(true);
      } else {
        setPaymentRequest(null);
        setCanUsePaymentRequest(false);
      }
    });

    pr.on("paymentmethod", async event => {
      if (!stripe) return;
      if (confirmingRef.current) {
        event.complete("fail");
        return;
      }
      confirmingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: event.paymentMethod.id },
            { handleActions: false }
          );

        if (confirmError || !paymentIntent) {
          const succeededIntentId = getSucceededIntentId(confirmError);
          if (succeededIntentId) {
            event.complete("success");
            if (!draftOrderId) {
              onPaymentError(t("checkout.failed_create_order"));
              return;
            }
            onPaymentSuccess({
              orderId: draftOrderId,
              orderRef: draftOrderRef ?? undefined,
              paymentIntentId: succeededIntentId,
            });
            return;
          }
          event.complete("fail");
          const errorMessage =
            confirmError?.message ?? t("checkout.unexpected_error");
          setError(errorMessage);
          onPaymentError(errorMessage);
          setIsLoading(false);
          confirmingRef.current = false;
          return;
        }

        event.complete("success");

        if (paymentIntent.status === "requires_action") {
          const { error: actionError, paymentIntent: nextIntent } =
            await stripe.confirmCardPayment(clientSecret);
          if (actionError) {
            const errorMessage =
              actionError.message ?? t("checkout.unexpected_error");
            setError(errorMessage);
            onPaymentError(errorMessage);
            setIsLoading(false);
            return;
          }
          if (nextIntent?.status !== "succeeded") {
            setIsLoading(false);
            return;
          }
        }

        if (paymentIntent.status === "succeeded") {
          if (!draftOrderId) {
            onPaymentError(t("checkout.failed_create_order"));
            return;
          }
          onPaymentSuccess({
            orderId: draftOrderId,
            orderRef: draftOrderRef ?? undefined,
            paymentIntentId: paymentIntent.id,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("checkout.unexpected_error");
        setError(errorMessage);
        onPaymentError(errorMessage);
        confirmingRef.current = false;
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    stripe,
    clientSecret,
    total,
    draftOrderId,
    draftOrderRef,
    t,
    onPaymentError,
    onPaymentSuccess,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!paymentsEnabled) {
      setError(t("checkout.stripe_payments_locked"));
      onPaymentError(t("checkout.stripe_payments_locked"));
      return;
    }
    if (!stripe || !elements) {
      return;
    }
    if (confirmingRef.current) {
      return;
    }
    confirmingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: buildReturnUrl(),
        },
        redirect: "if_required",
      });

      if (error) {
        const succeededIntentId = getSucceededIntentId(error);
        if (succeededIntentId) {
          if (!draftOrderId) {
            onPaymentError(t("checkout.failed_create_order"));
            return;
          }
          onPaymentSuccess({
            orderId: draftOrderId,
            orderRef: draftOrderRef ?? undefined,
            paymentIntentId: succeededIntentId,
          });
          return;
        }
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("checkout.unexpected_error");
        setError(errorMessage);
        onPaymentError(errorMessage);
        confirmingRef.current = false;
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        if (!draftOrderId) {
          onPaymentError(t("checkout.failed_create_order"));
          return;
        }
        onPaymentSuccess({
          orderId: draftOrderId,
          orderRef: draftOrderRef ?? undefined,
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("checkout.unexpected_error");
      setError(errorMessage);
      onPaymentError(errorMessage);
      confirmingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const buildReturnUrl = () => {
    const params = new URLSearchParams();
    if (draftOrderId) {
      params.set("order_id", draftOrderId);
    }
    if (draftOrderRef) {
      params.set("order_ref", draftOrderRef);
    }
    const query = params.toString();
    return `${window.location.origin}/checkout/success${
      query ? `?${query}` : ""
    }`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {t("checkout.payment_info")}
          </h3>
        </div>

        <div className="space-y-4">
          {paymentsEnabled && canUsePaymentRequest && paymentRequest && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-cosmic-silver">
                <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cosmic-gold/40 to-transparent" />
                <span>{t("checkout.express_wallets")}</span>
                <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cosmic-gold/40 to-transparent" />
              </div>
              <PaymentRequestButtonElement
                options={{
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      type: "buy",
                      theme: "dark",
                      height: "44px",
                    },
                  },
                }}
              />
            </div>
          )}
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
            <span>{t("checkout.payment_protected")}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-purple-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>{t("checkout.processed_stripe")}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isLoading || !paymentsEnabled}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t("checkout.processing_payment")}
            </>
          ) : !paymentsEnabled ? (
            <>
              <Lock className="w-4 h-4" />
              {t("checkout.stripe_payments_locked")}
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              {t("checkout.complete_payment")} - €{total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function StripePaymentComplete({
  clientSecret,
  total,
  draftOrderId,
  draftOrderRef,
  paymentsEnabled,
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
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
      }}
    >
      <PaymentForm
        clientSecret={clientSecret}
        total={total}
        draftOrderId={draftOrderId}
        draftOrderRef={draftOrderRef}
        paymentsEnabled={paymentsEnabled}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
}
