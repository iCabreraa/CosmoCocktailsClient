"use client";

import { useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Truck,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/feedback/ToastProvider";

interface OrderDetailActionsProps {
  orderId: string;
  orderRef?: string | null;
  status: string;
}

export default function OrderDetailActions({
  orderId,
  orderRef,
  status,
}: OrderDetailActionsProps) {
  const { t, isInitialized } = useLanguage();
  const { notify } = useToast();
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");

  // Wait for language context to be initialized
  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto"></div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ordered":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          message: t("order.status_messages.ordered"),
          nextStep: t("order.status_messages.ordered_next"),
        };
      case "preparing":
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          message: t("order.status_messages.preparing"),
          nextStep: t("order.status_messages.preparing_next"),
        };
      case "on_the_way":
        return {
          icon: <Truck className="h-5 w-5 text-purple-500" />,
          message: t("order.status_messages.shipping"),
          nextStep: t("order.status_messages.shipping_next"),
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          message: t("order.status_messages.completed"),
          nextStep: t("order.status_messages.completed_next"),
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          message: t("order.status_messages.processing"),
          nextStep: t("order.status_messages.processing_next"),
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  const handleSubmitMessage = async () => {
    if (!message.trim()) return;

    // Aquí podrías enviar el mensaje a un sistema de soporte
    console.log("Mensaje enviado:", { orderId, orderRef, message });

    // Simular envío
    notify({
      type: "success",
      title: t("feedback.message_sent_title"),
      message: t("feedback.message_sent_message"),
    });
    setMessage("");
    setShowContactForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Estado actual y próximos pasos */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-start gap-4">
          {statusInfo.icon}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {t("order.current_status")}
            </h3>
            <p className="text-blue-100 mb-3">{statusInfo.message}</p>
            <p className="text-sm text-blue-200">{statusInfo.nextStep}</p>
          </div>
        </div>
      </div>

      {/* Acciones de contacto */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-gray-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t("order.need_help")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setShowContactForm(!showContactForm)}
            className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <div className="text-left">
              <div className="font-medium text-blue-300">
                {t("order.ask_about_order")}
              </div>
              <div className="text-sm text-blue-200">
                {t("order.send_direct_message")}
              </div>
            </div>
          </button>

          <a
            href="tel:+34123456789"
            className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-400/30 rounded-lg hover:bg-green-500/20 transition-colors"
          >
            <Phone className="h-5 w-5 text-green-400" />
            <div className="text-left">
              <div className="font-medium text-green-300">
                {t("order.call_phone")}
              </div>
              <div className="text-sm text-green-200">+34 123 456 789</div>
            </div>
          </a>
        </div>

        {/* Formulario de contacto */}
        {showContactForm && (
          <div className="mt-4 p-4 bg-gray-500/10 rounded-lg border border-gray-400/20">
            <h4 className="font-medium text-white mb-3">
              {t("order.send_message")}
            </h4>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t("order.message_placeholder")}
              className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleSubmitMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("order.send_message")}
              </button>
              <button
                onClick={() => setShowContactForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t("order.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
