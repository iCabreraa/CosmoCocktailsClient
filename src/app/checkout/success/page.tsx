"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Package, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccess() {
  const [orderId, setOrderId] = useState<string | null>(null);

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
              ¡Pago Exitoso!
            </h1>
            <p className="text-purple-300 text-lg">
              Tu pedido ha sido procesado correctamente
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">
                Detalles del Pedido
              </h2>
            </div>

            {orderId && (
              <div className="text-sm text-purple-300 mb-2">
                <span className="font-medium">ID del Pedido:</span> {orderId}
              </div>
            )}

            <div className="text-sm text-purple-300">
              Recibirás un email de confirmación en breve con todos los detalles
              de tu pedido.
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              Próximos Pasos
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Confirmación</p>
                  <p className="text-purple-300 text-sm">
                    Recibirás un email de confirmación
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Preparación</p>
                  <p className="text-purple-300 text-sm">
                    Preparamos tu pedido con cuidado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Envío</p>
                  <p className="text-purple-300 text-sm">
                    Te notificaremos cuando esté en camino
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
              Seguir Comprando
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20"
            >
              <Home className="w-4 h-4" />
              Ir al Inicio
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-purple-300">
              ¿Tienes alguna pregunta?{" "}
              <a
                href="mailto:support@cosmococktails.com"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
