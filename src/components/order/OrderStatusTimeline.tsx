"use client";

import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  status:
    | "ordered"
    | "paid"
    | "preparing"
    | "on_the_way"
    | "completed"
    | string;
};

export default function OrderStatusTimeline({ status }: Props) {
  const { t, isInitialized } = useLanguage();

  // Wait for language context to be initialized
  if (!isInitialized) {
    return (
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cosmic-gold"></div>
    );
  }

  const steps: Array<{ key: string; label: string }> = [
    { key: "ordered", label: t("order.status_ordered") },
    { key: "preparing", label: t("order.status_preparation") },
    { key: "on_the_way", label: t("order.status_shipping") },
    { key: "completed", label: t("order.status_completed") },
  ];

  const index = Math.max(
    0,
    steps.findIndex(s => s.key === status)
  );

  return (
    <ol className="flex items-center gap-6 text-xs font-[--font-josefin] text-cosmic-silver mt-4">
      {steps.map((s, i) => {
        const active = i <= index;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${active ? "bg-cosmic-gold" : "bg-cosmic-gold/25"}`}
            />
            <span
              className={`${active ? "text-cosmic-gold font-medium" : "text-cosmic-silver/70"}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="w-12 h-[2px] bg-gradient-to-r from-cosmic-gold/20 to-transparent inline-block ml-2" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
