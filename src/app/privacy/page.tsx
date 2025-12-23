/**
 * Privacy Policy Page
 *
 * Displays the privacy policy content and contact information.
 *
 * @fileoverview Privacy policy page
 */

"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#0b1220_0%,_#040816_40%,_#00030a_100%)] text-slate-100">
      <div className="bg-white/5 backdrop-blur-md border-b border-slate-700/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">
            {t("privacy.title")}
          </h1>
          <p className="text-lg text-slate-300">{t("privacy.intro")}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>{t("privacy.data_usage")}</p>
          <p>{t("privacy.data_sharing")}</p>
          <p>{t("privacy.rights")}</p>
          <p>
            {t("privacy.contact")}{" "}
            <a
              href="mailto:privacy@cosmococktails.com"
              className="text-sky-300 hover:text-sky-200 underline"
            >
              privacy@cosmococktails.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
