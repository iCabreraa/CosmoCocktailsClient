"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Package, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CheckoutSuccess() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Obtener el ID del pedido de la URL o localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get("order_id");

    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t("checkout.success.title")}
            </h1>
            <p className="text-purple-300 text-lg">
              {t("checkout.success.subtitle")}
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">
                {t("checkout.success.order_details_title")}
              </h2>
            </div>

            {orderId && (
              <div className="text-sm text-purple-300 mb-2">
                <span className="font-medium">
                  {t("checkout.success.order_id_label")}
                </span>{" "}
                {orderId}
              </div>
            )}

            <div className="text-sm text-purple-300">
              {t("checkout.success.confirmation_note")}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t("checkout.success.next_steps_title")}
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step1_title")}
                  </p>
                  <p className="text-purple-300 text-sm">
                    {t("checkout.success.step1_description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step2_title")}
                  </p>
                  <p className="text-purple-300 text-sm">
                    {t("checkout.success.step2_description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step3_title")}
                  </p>
                  <p className="text-purple-300 text-sm">
                    {t("checkout.success.step3_description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              {t("checkout.success.continue_shopping")}
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20"
            >
              <Home className="w-4 h-4" />
              {t("checkout.success.go_home")}
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-purple-300">
              {t("checkout.success.support_text")}{" "}
              <a
                href="mailto:support@cosmococktails.com"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                {t("checkout.success.contact_us")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
