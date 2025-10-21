"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = { id: string; orderRef?: string | null };

export default function OrderTitle({ id, orderRef }: Props) {
  const { t, isInitialized } = useLanguage();
  const [copied, setCopied] = useState(false);
  const refText = orderRef || `#${id}`;

  // Wait for language context to be initialized
  if (!isInitialized) {
    return (
      <div className="flex flex-col gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold"></div>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(refText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado principal */}
      <h1 className="text-3xl font-[--font-unica] text-[#D8DAE3]">
        {t("order.success_title")}
      </h1>

      {/* Número de pedido en la parte inferior */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-cosmic-silver font-[--font-josefin]">
          {t("order.order_number")}:
        </span>
        <span className="text-lg font-mono text-cosmic-gold font-medium">
          {refText}
        </span>
        <button
          onClick={copy}
          className="text-xs text-cosmic-silver hover:text-cosmic-gold underline-offset-4 hover:underline px-2 py-1 rounded border border-cosmic-gold/20 hover:border-cosmic-gold/40 transition-colors"
        >
          {copied ? `✓ ${t("order.copied")}` : t("order.copy")}
        </button>
      </div>
    </div>
  );
}
