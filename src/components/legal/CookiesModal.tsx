"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CookiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookiesModal({ isOpen, onClose }: CookiesModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookies-title"
      aria-describedby="cookies-content"
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/95 shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-700/40 px-6 py-4">
          <h2 id="cookies-title" className="text-xl font-semibold text-slate-100">
            {t("legal.cookies.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-300 hover:text-slate-100 hover:bg-white/10"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          id="cookies-content"
          className="space-y-4 overflow-y-auto px-6 py-5 text-sm text-slate-300 leading-relaxed"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {t("legal.cookies.updated")}
          </p>
          <p>{t("legal.cookies.intro")}</p>
          <p>{t("legal.cookies.essential")}</p>
          <p>{t("legal.cookies.analytics")}</p>
          <p>{t("legal.cookies.manage")}</p>
        </div>

        <div className="flex justify-end border-t border-slate-700/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cosmic-gold px-4 py-2 text-sm font-medium text-black hover:bg-cosmic-gold/80 transition"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
