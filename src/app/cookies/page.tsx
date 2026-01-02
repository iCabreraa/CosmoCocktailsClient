"use client";

import Link from "next/link";
import CosmicBackground from "@/components/ui/CosmicBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CookiesPage() {
  const { t } = useLanguage();

  return (
    <CosmicBackground className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-700/40 bg-white/5 p-8 shadow-[0_0_40px_rgba(59,130,246,.08)] backdrop-blur">
        <h1 className="text-3xl font-semibold text-slate-100">
          {t("legal.cookies.title")}
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          {t("legal.cookies.updated")}
        </p>

        <div className="mt-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <p>{t("legal.cookies.intro")}</p>
          <p>{t("legal.cookies.essential")}</p>
          <p>{t("legal.cookies.analytics")}</p>
          <p>{t("legal.cookies.manage")}</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/account"
            className="rounded-full border border-cosmic-gold/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cosmic-gold transition hover:bg-cosmic-gold/10"
          >
            {t("common.back")}
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-cosmic-gold/40 hover:text-cosmic-gold"
          >
            {t("settings.legal.contact")}
          </Link>
        </div>
      </div>
    </CosmicBackground>
  );
}
