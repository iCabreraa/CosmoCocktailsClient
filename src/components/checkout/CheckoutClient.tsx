"use client";

import { useCart } from "@/store/cart";
import { useState, useEffect } from "react";
import {
  CreditCard,
  Lock,
  MapPin,
  User,
  Mail,
  Phone,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import AddressForm from "./AddressForm";
import InventoryValidation from "./InventoryValidation";
import StripePaymentComplete from "./StripePaymentComplete";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryValid, setInventoryValid] = useState(true);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
    // Redirigir a página de éxito
    window.location.href = "/checkout/success";
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
      clientSecret: !!clientSecret,
    });

    if (
      inventoryValid &&
      selectedAddress &&
      form.name &&
      form.email &&
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
                : clientSecret
                  ? "already has client secret"
                  : "unknown",
      });
    }
  }, [inventoryValid, selectedAddress, form.name, form.email, clientSecret]);

  const handleInventoryValidation = (
    isValid: boolean,
    unavailable: string[]
  ) => {
    setInventoryValid(isValid);
    setUnavailableItems(unavailable);
  };

  // El pago se maneja a través de StripePaymentComplete
  // No necesitamos handleSubmit aquí

  if (isLoading) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto mb-4"></div>
          <p className="text-cosmic-fog">{t("common.loading")}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {t("common.error")}: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cosmic-gold text-black rounded-full hover:bg-cosmic-gold/80 transition"
          >
            Retry
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
            Your cart is empty
          </h1>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cosmic-gold text-black hover:bg-cosmic-gold/80 transition font-medium"
          >
            {t("cart.empty_button")}
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
          <p className="text-cosmic-fog">{t("checkout.order_summary")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
              <h2 className="text-xl font-[--font-unica] text-cosmic-gold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información de Contacto
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-cosmic-fog mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre completo"
                      className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                      value={form.name}
                      onChange={e => handleChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cosmic-fog mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com"
                      className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                      value={form.email}
                      onChange={e => handleChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-cosmic-fog mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+34 123 456 789"
                    className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                    value={form.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Address Management */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
              <h2 className="text-xl font-[--font-unica] text-cosmic-gold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dirección de Envío
              </h2>
              <AddressForm
                onAddressSelect={handleAddressSelect}
                selectedAddress={selectedAddress}
              />
            </div>

            {/* Inventory Validation */}
            <InventoryValidation
              items={items}
              onValidationComplete={handleInventoryValidation}
            />

            {/* Payment Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
              <h2 className="text-xl font-[--font-unica] text-cosmic-gold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t("checkout.payment_title")}
              </h2>

              {paymentError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{paymentError}</span>
                </div>
              )}

              {clientSecret ? (
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
                    Preparando pago seguro...
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              {/* Validation Status */}
              {!inventoryValid && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">
                    Algunos productos no están disponibles. Revisa tu carrito.
                  </span>
                </div>
              )}

              {!selectedAddress && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">
                    Por favor, selecciona una dirección de envío.
                  </span>
                </div>
              )}

              {/* El botón de pago está en StripePaymentComplete */}
            </div>
          </div>

          {/* Right column: summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10 sticky top-6">
              <h2 className="text-xl font-[--font-unica] text-cosmic-gold mb-4">
                {t("checkout.order_summary")}
              </h2>

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
                      <span className="text-cosmic-text">x{item.quantity}</span>
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
                    {t("cart.subtotal")} ({item_count}{" "}
                    {item_count === 1 ? t("cart.item") : t("cart.items")})
                  </span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cosmic-text">
                  <span>VAT (21%)</span>
                  <span>€{vat_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cosmic-text">
                  <span>{t("cart.shipping")}</span>
                  <span>
                    {shipping_cost > 0
                      ? `€${shipping_cost.toFixed(2)}`
                      : t("cart.free")}
                  </span>
                </div>
                <div className="border-t border-cosmic-fog/30 pt-2">
                  <div className="flex justify-between text-lg font-semibold text-cosmic-gold">
                    <span>{t("cart.total")}</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shipping_cost > 0 && (
                <p className="text-xs text-cosmic-fog mt-4 text-center">
                  {t("cart.free_shipping_note")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
