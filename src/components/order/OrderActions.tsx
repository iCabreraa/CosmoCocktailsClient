"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  orderId: string;
  orderRef?: string | null;
};

export default function OrderActions({ orderId, orderRef }: Props) {
  const [copied, setCopied] = useState(false);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(orderRef || `#${orderId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm font-[--font-josefin]">
      <button
        onClick={copyRef}
        className="text-cosmic-silver hover:text-cosmic-gold underline-offset-4 hover:underline"
      >
        {copied ? "Copiado" : "Copiar nº pedido"}
      </button>
      <span className="text-cosmic-silver/40">·</span>
      <button
        onClick={printReceipt}
        className="text-cosmic-silver hover:text-cosmic-gold underline-offset-4 hover:underline"
      >
        Descargar recibo
      </button>
      <span className="text-cosmic-silver/40">·</span>
      <Link
        href="/account?tab=orders"
        className="text-cosmic-silver hover:text-cosmic-gold underline-offset-4 hover:underline"
      >
        Ver mis pedidos
      </Link>
    </div>
  );
}
