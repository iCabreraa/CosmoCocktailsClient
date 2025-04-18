import Link from "next/link";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-transparent text-cosmic-text mt-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 py-12 text-sm items-center text-center md:text-left">
        {/* Left: Quick Links - split in 2 columns */}
        <div>
          <h4 className="text-cosmic-gold uppercase font-display tracking-wide mb-3">
            Explore
          </h4>
          <div className="grid grid-cols-2">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-cosmic-gold transition"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-cosmic-gold transition"
                >
                  About Us
                </Link>
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/services"
                  className="hover:text-cosmic-gold transition"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-cosmic-gold transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Center: Branding */}
        <div className="flex flex-col items-center">
          <h4 className="text-cosmic-gold uppercase font-logo tracking-widest text-lg">
            CosmoCocktails
          </h4>
          <p className="text-cosmic-silver mt-2 max-w-sm text-center leading-relaxed">
            Curated drinks & premium cocktail experiences, served with stellar
            taste.
          </p>
        </div>

        {/* Right: Contact & Socials */}
        <div className="md:text-right">
          <p className="mb-2 text-cosmic-silver">
            Contact:{" "}
            <a
              href="mailto:hello@cosmococktails.nl"
              className="hover:text-cosmic-gold transition"
            >
              hello@cosmococktails.nl
            </a>
          </p>
          <div className="flex justify-center md:justify-end gap-4 mt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cosmic-gold transition"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cosmic-gold transition"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Copyright */}
      <div className="text-center py-4 text-xs text-cosmic-silver">
        © 2025 CosmoCocktails. All rights reserved.
      </div>
    </footer>
  );
}
