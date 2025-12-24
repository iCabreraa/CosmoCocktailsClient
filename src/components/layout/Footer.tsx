"use client";

import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-transparent text-cosmic-text mt-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 py-12 text-sm items-center text-center md:text-left">
        {/* Left: Account Links */}
        <div>
          <h4 className="text-cosmic-gold uppercase font-display tracking-wide mb-3">
            {t("nav.account")}
          </h4>
          <ul className="space-y-1">
            <li>
              <Link
                href="/account?tab=dashboard"
                className="hover:text-cosmic-gold transition"
              >
                {t("account.tabs.dashboard")}
              </Link>
            </li>
            <li>
              <Link
                href="/account?tab=orders"
                className="hover:text-cosmic-gold transition"
              >
                {t("account.tabs.orders")}
              </Link>
            </li>
            <li>
              <Link
                href="/account?tab=favorites"
                className="hover:text-cosmic-gold transition"
              >
                {t("account.tabs.favorites")}
              </Link>
            </li>
            <li>
              <Link
                href="/account?tab=settings"
                className="hover:text-cosmic-gold transition"
              >
                {t("account.tabs.settings")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Center: Branding */}
        <div className="flex flex-col items-center">
          <h4 className="text-cosmic-gold uppercase font-logo tracking-widest text-lg">
            CosmoCocktails
          </h4>
          <p className="text-cosmic-silver mt-2 max-w-sm text-center leading-relaxed">
            {t("footer.description")}
          </p>
        </div>

        {/* Right: Contact & Socials */}
        <div className="md:text-right">
          <p className="mb-2 text-cosmic-silver">
            {t("footer.contact")}{" "}
            <a
              href="mailto:cosmococktails2024@gmail.com"
              className="hover:text-cosmic-gold transition"
            >
              cosmococktails2024@gmail.com
            </a>
          </p>
          <div className="flex justify-center md:justify-end gap-4 mt-2">
            <a
              href="https://www.instagram.com/cosmococktails_2024/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cosmic-gold transition"
            >
              <FaInstagram />
            </a>
            {/* <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cosmic-gold transition"
            >
              <FaLinkedinIn />
            </a> */}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Copyright */}
      <div className="text-center py-4 text-xs text-cosmic-silver">
        {t("footer.copyright")}
      </div>
    </footer>
  );
}
