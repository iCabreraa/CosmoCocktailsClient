"use client";

import { useState } from "react";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import PrivacyModal from "@/components/privacy/PrivacyModal";

export default function Footer() {
  const { t } = useLanguage();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="bg-transparent text-cosmic-text mt-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 py-12 text-sm text-center md:text-left">
        {/* Left: Branding */}
        <div className="flex flex-col items-center gap-4 md:items-start">
          <h4 className="text-cosmic-gold uppercase font-logo tracking-widest text-lg">
            CosmoCocktails
          </h4>
          <p className="text-cosmic-silver max-w-sm leading-relaxed">
            {t("footer.description")}
          </p>
          <div className="flex items-center gap-4 text-cosmic-silver">
            <a
              href="https://www.instagram.com/cosmococktails_2024/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cosmic-gold transition"
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Middle: Explore */}
        <div>
          <h4 className="text-cosmic-gold uppercase font-display tracking-wide mb-3">
            {t("footer.explore")}
          </h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="/shop"
                className="hover:text-cosmic-gold transition"
              >
                {t("nav.shop")}
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="hover:text-cosmic-gold transition"
              >
                {t("nav.events")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Right: Contact */}
        <div className="md:text-right">
          <h4 className="text-cosmic-gold uppercase font-display tracking-wide mb-3">
            {t("nav.contact")}
          </h4>
          <p className="text-cosmic-silver">
            {t("footer.contact")}{" "}
            <a
              href="mailto:cosmococktails2024@gmail.com"
              className="hover:text-cosmic-gold transition"
            >
              cosmococktails2024@gmail.com
            </a>
          </p>
          <div className="mt-4 flex flex-col items-center gap-2 md:items-end">
            <Link
              href="/contact"
              className="hover:text-cosmic-gold transition"
            >
              {t("nav.contact")}
            </Link>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-cosmic-gold transition"
            >
              {t("privacy.title")}
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Copyright */}
      <div className="text-center py-4 text-xs text-cosmic-silver">
        {t("footer.copyright")}
      </div>

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </footer>
  );
}
