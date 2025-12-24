"use client";

import { useCart } from "@/store/cart";
import { useState, useEffect } from "react";
import {
  CreditCard,
  MapPin,
  User,
  Check,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import AddressForm from "./AddressForm";
import InventoryValidation from "./InventoryValidation";
import StripePaymentComplete from "./StripePaymentComplete";
import PrivacyModal from "@/components/privacy/PrivacyModal";
import { Address } from "@/types/shared";
import { useClientData } from "@/hooks/useClientData";
import { useAuthUnified } from "@/hooks/useAuthUnified";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CheckoutClient() {
  const { t } = useLanguage();
  const {
    items,
    subtotal,
    vat_amount,
    shipping_cost,
    total,
    item_count,
    clearCart,
    isLoading,
    error,
    hasHydrated,
  } = useCart();

  const { getFormDataForEmail, saveClientData } = useClientData();
  const { user: authUser } = useAuthUnified();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [selectedAddress, setSelectedAddress] = useState<Address | null>({
    id: "default",
    name: "Casa",
    street: "Calle Principal 123",
    city: "Madrid",
    postalCode: "28001",
    country: "España",
    phone: "+34 123 456 789",
    isDefault: true,
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryValid, setInventoryValid] = useState(true);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const isContactComplete = Boolean(
    form.name.trim() && form.email.trim() && form.phone.trim()
  );
  const isAddressComplete = Boolean(selectedAddress);
  const isShippingComplete = inventoryValid;
  const isPaymentReady = privacyAccepted;

  const stepCompletion = [
    isContactComplete,
    isAddressComplete,
    isShippingComplete,
    isPaymentReady,
  ];
  const firstIncomplete = stepCompletion.findIndex(done => !done);
  const maxAllowedStep =
    firstIncomplete === -1 ? stepCompletion.length : firstIncomplete;
  const isLastStep = currentStep === stepCompletion.length;
  const canAdvance = currentStep < stepCompletion.length
    ? stepCompletion[currentStep]
    : true;

  const steps = [
    { id: "checkout-contact", label: t("checkout.contact_info") },
    { id: "checkout-address", label: t("checkout.shipping_address") },
    { id: "checkout-shipping", label: t("checkout.shipping") },
    { id: "checkout-payment", label: t("checkout.payment_info") },
    { id: "checkout-summary", label: t("checkout.order_summary") },
  ];

  const handleStepJump = (index: number) => {
    if (index <= maxAllowedStep) {
      setCurrentStep(index);
    }
  };

  // Auto-rellenar formulario si el usuario está autenticado
  useEffect(() => {
    if (authUser && !form.email) {
      setForm(prev => ({
        ...prev,
        email: authUser.email,
        name: authUser.full_name || "",
        phone: authUser.phone || "",
      }));
      console.log(
        "✅ Auto-filled form with authenticated user data:",
        authUser
      );
    }
  }, [authUser, form.email]);

  // NO guardar datos de clientes para usuarios registrados
  const shouldSaveClientData = !authUser;

  const handleChange = async (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Auto-rellenar formulario cuando se ingresa un email
    if (field === "email" && value.includes("@")) {
      // Prioridad 1: Si hay usuario autenticado y el email coincide
      if (authUser && authUser.email === value) {
        setForm(prev => ({
          ...prev,
          name: authUser.full_name || prev.name,
          phone: authUser.phone || prev.phone,
        }));
        console.log("✅ Auto-filled from authenticated user:", authUser);
        return;
      }

      // Prioridad 2: Buscar en datos de clientes (guest)
      const clientData = await getFormDataForEmail(value);
      if (clientData) {
        setForm(prev => ({
          ...prev,
          name: clientData.name || prev.name,
          phone: clientData.phone || prev.phone,
        }));

        if (clientData.address) {
          setSelectedAddress(clientData.address);
        }
        console.log("✅ Auto-filled from client data:", clientData);
      }
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const createPaymentIntent = async () => {
    try {
      console.log("🔍 Creating payment intent with data:", {
        items,
        address: selectedAddress,
        form: { name: form.name, email: form.email },
      });

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items,
          address: selectedAddress,
        }),
      });

      console.log("📡 Payment intent response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Payment intent error:", errorData);
        throw new Error(errorData.error || "Failed to create payment intent");
      }

      const responseData = await response.json();
      console.log("✅ Payment intent response data:", responseData);

      const { clientSecret } = responseData;
      console.log(
        "🔑 Client secret received:",
        clientSecret ? "✅ Yes" : "❌ No"
      );

      setClientSecret(clientSecret);
    } catch (error) {
      console.error("❌ Error creating payment intent:", error);
      setPaymentError("Error al crear el pago. Inténtalo de nuevo.");
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log("Payment successful:", paymentIntent);

    // Guardar datos del cliente solo si NO está autenticado
    if (shouldSaveClientData) {
      try {
        await saveClientData({
          email: form.email,
          full_name: form.name,
          phone: form.phone,
          address: selectedAddress,
          is_guest: true,
          user_id: undefined,
        });
        console.log("✅ Guest client data saved successfully");
      } catch (error) {
        console.error("❌ Error saving guest client data:", error);
      }
    } else {
      console.log("✅ Authenticated user - skipping client data save");
    }

    clearCart();
    // La redirección al detalle del pedido la realiza StripePaymentComplete
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  // Crear payment intent cuando el formulario esté listo
  useEffect(() => {
    console.log("🔍 useEffect triggered with:", {
      inventoryValid,
      selectedAddress: !!selectedAddress,
      formName: !!form.name,
      formEmail: !!form.email,
      privacyAccepted,
      clientSecret: !!clientSecret,
    });

    if (
      inventoryValid &&
      selectedAddress &&
      form.name &&
      form.email &&
      privacyAccepted &&
      currentStep >= 3 &&
      !clientSecret
    ) {
      console.log("🚀 Creating payment intent...");
      createPaymentIntent();
    } else {
      console.log("⏸️ Payment intent creation skipped:", {
        reason: !inventoryValid
          ? "inventory not valid"
          : !selectedAddress
            ? "no address selected"
            : !form.name
              ? "no name provided"
              : !form.email
                ? "no email provided"
                : !privacyAccepted
                  ? "privacy consent not accepted"
                : clientSecret
                  ? "already has client secret"
                  : "unknown",
      });
    }
  }, [
    inventoryValid,
    selectedAddress,
    form.name,
    form.email,
    privacyAccepted,
    clientSecret,
    currentStep,
  ]);

  const handleInventoryValidation = (
    isValid: boolean,
    unavailable: string[]
  ) => {
    setInventoryValid(isValid);
    setUnavailableItems(unavailable);
  };

  // El pago se maneja a través de StripePaymentComplete
  // No necesitamos handleSubmit aquí

  if (!hasHydrated) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto mb-4"></div>
          <p className="text-cosmic-fog">{t("checkout.loading")}</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto mb-4"></div>
          <p className="text-cosmic-fog">{t("checkout.loading")}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {t("checkout.error_loading")}: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cosmic-gold text-black rounded-full hover:bg-cosmic-gold/80 transition"
          >
            {t("common.retry")}
          </button>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-[--font-unica] text-cosmic-fog mb-4">
            {t("checkout.empty_cart")}
          </h1>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cosmic-gold text-black hover:bg-cosmic-gold/80 transition font-medium"
          >
            {t("checkout.start_shopping")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-[--font-unica] text-cosmic-gold mb-2">
            {t("checkout.title")}
          </h1>
          <p className="text-cosmic-fog">{t("checkout.subtitle")}</p>
        </div>

        <div className="mb-10 rounded-2xl border border-cosmic-gold/20 bg-white/5 px-4 py-5 backdrop-blur-sm">
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => handleStepJump(index)}
                  disabled={index > maxAllowedStep}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                    index === currentStep
                      ? "border-cosmic-gold text-cosmic-text bg-cosmic-gold/10"
                      : index <= maxAllowedStep
                        ? "border-transparent text-cosmic-fog hover:border-cosmic-gold/40 hover:text-cosmic-text"
                        : "border-transparent text-cosmic-fog/40 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                      index < stepCompletion.length && stepCompletion[index]
                        ? "border-cosmic-gold bg-cosmic-gold text-black"
                        : "border-cosmic-gold/40 text-cosmic-gold"
                    }`}
                  >
                    {index < stepCompletion.length && stepCompletion[index] ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className="text-sm font-medium">
                    {step.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-8">
          {currentStep === 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cosmic-gold/40 text-xs font-semibold text-cosmic-gold">
                  01
                </span>
                <h2 className="text-xl font-[--font-unica] text-cosmic-gold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("checkout.contact_info")}
                </h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-cosmic-fog mb-2">
                      {t("checkout.full_name")} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("checkout.full_name_placeholder")}
                      className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                      value={form.name}
                      onChange={e => handleChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cosmic-fog mb-2">
                      {t("checkout.email")} *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={t("checkout.email_placeholder")}
                      className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                      value={form.email}
                      onChange={e => handleChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-cosmic-fog mb-2">
                    {t("checkout.phone")} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t("checkout.phone_placeholder")}
                    className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                    value={form.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cosmic-gold/40 text-xs font-semibold text-cosmic-gold">
                  02
                </span>
                <h2 className="text-xl font-[--font-unica] text-cosmic-gold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {t("checkout.shipping_address")}
                </h2>
              </div>
              <AddressForm
                onAddressSelect={handleAddressSelect}
                selectedAddress={selectedAddress}
              />
            </div>
          )}

          {currentStep === 2 && (
            <section className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cosmic-gold/40 text-xs font-semibold text-cosmic-gold">
                    03
                  </span>
                  <h2 className="text-xl font-[--font-unica] text-cosmic-gold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {t("checkout.shipping")}
                  </h2>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-lg border border-cosmic-gold/20 bg-black/20 p-4">
                  <div>
                    <p className="text-sm font-medium text-cosmic-text">
                      {t("checkout.shipping")}
                    </p>
                    <p className="text-xs text-cosmic-fog">
                      {t("checkout.free_shipping_note")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-cosmic-gold">
                    {shipping_cost > 0
                      ? `€${shipping_cost.toFixed(2)}`
                      : t("checkout.free")}
                  </span>
                </div>
              </div>

              <InventoryValidation
                items={items}
                onValidationComplete={handleInventoryValidation}
              />
            </section>
          )}

          {currentStep === 3 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cosmic-gold/40 text-xs font-semibold text-cosmic-gold">
                  04
                </span>
                <h2 className="text-xl font-[--font-unica] text-cosmic-gold flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t("checkout.payment_info")}
                </h2>
              </div>

              <div className="mb-4 space-y-2">
                <label className="flex items-start gap-2 text-sm text-cosmic-fog">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={e => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-cosmic-fog/50 bg-transparent text-cosmic-gold focus:ring-cosmic-gold"
                  />
                  <span>
                    {t("checkout.privacy_consent_prefix")}{" "}
                    <button
                      type="button"
                      onClick={() => setIsPrivacyOpen(true)}
                      className="text-cosmic-gold hover:text-cosmic-gold/80 underline"
                    >
                      {t("checkout.privacy_policy")}
                    </button>
                    {t("checkout.privacy_consent_suffix")}
                  </span>
                </label>
                {!privacyAccepted && (
                  <p className="text-sm text-red-400">
                    {t("checkout.privacy_consent_required")}
                  </p>
                )}
              </div>

              {paymentError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{paymentError}</span>
                </div>
              )}

              {clientSecret && privacyAccepted ? (
                <StripePaymentComplete
                  clientSecret={clientSecret}
                  items={items}
                  total={total}
                  user={authUser}
                  shippingAddress={selectedAddress}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              ) : (
                <div className="bg-cosmic-fog/10 rounded-lg p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold mx-auto mb-2"></div>
                  <p className="text-cosmic-fog text-sm">
                    {privacyAccepted
                      ? t("checkout.preparing_payment")
                      : t("checkout.privacy_consent_required")}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cosmic-gold/40 text-xs font-semibold text-cosmic-gold">
                    05
                  </span>
                  <h2 className="text-xl font-[--font-unica] text-cosmic-gold">
                    {t("checkout.order_summary")}
                  </h2>
                </div>

                <div className="space-y-3 mb-6">
                  {items.map((item, index) => (
                    <div
                      key={`${item.cocktail_id}-${item.sizes_id}-${index}`}
                      className="flex justify-between text-sm"
                    >
                      <div>
                        <span className="text-cosmic-text">
                          {item.cocktail_name}
                        </span>
                        <span className="text-cosmic-fog block">
                          {item.size_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-cosmic-text">
                          x{item.quantity}
                        </span>
                        <span className="text-cosmic-gold block">
                          €{(item.item_total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm pt-4 border-t border-cosmic-fog/30">
                  <div className="flex justify-between text-cosmic-text">
                    <span>
                      {t("checkout.subtotal")} ({item_count}{" "}
                      {t("checkout.items")})
                    </span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cosmic-text">
                    <span>{t("checkout.vat")} (21%)</span>
                    <span>€{vat_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cosmic-text">
                    <span>{t("checkout.shipping")}</span>
                    <span>
                      {shipping_cost > 0
                        ? `€${shipping_cost.toFixed(2)}`
                        : t("checkout.free")}
                    </span>
                  </div>
                  <div className="border-t border-cosmic-fog/30 pt-2">
                    <div className="flex justify-between text-lg font-semibold text-cosmic-gold">
                      <span>{t("checkout.total")}</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {shipping_cost > 0 && (
                  <p className="text-xs text-cosmic-fog mt-4 text-center">
                    {t("checkout.free_shipping_note")}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
              disabled={currentStep === 0}
              className="rounded-full border border-cosmic-fog/40 px-5 py-2 text-sm text-cosmic-fog transition hover:border-cosmic-gold hover:text-cosmic-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.back")}
            </button>

            {!isLastStep && (
              <button
                type="button"
                onClick={() => {
                  if (canAdvance) {
                    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
                  }
                }}
                disabled={!canAdvance}
                className="rounded-full bg-cosmic-gold px-6 py-2 text-sm font-medium text-black transition hover:bg-cosmic-gold/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.next")}
              </button>
            )}
          </div>
        </div>
      </div>

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </main>
  );
}
