"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-cosmic-silver">{t("common.error")}</p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-full border border-cosmic-gold/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold"
      >
        <RotateCcw className="h-4 w-4" />
        {t("common.retry")}
      </button>
    </div>
  );
}
