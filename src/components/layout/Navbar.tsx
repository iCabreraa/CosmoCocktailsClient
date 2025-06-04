"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import "@fontsource/major-mono-display";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const showBg = scrolled || hovered;
  const navLinks = ["shop", "events", "about", "contact"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={clsx(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        menuOpen
          ? "bg-transparent text-cosmic-text"
          : showBg
          ? "md:bg-cosmic-light md:text-black bg-transparent text-cosmic-text"
          : "bg-transparent text-cosmic-text"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* LINE 1: Logo */}
        <div className="flex justify-center pb-3">
          <Link
            href="/"
            className="text-3xl font-logo tracking-widest uppercase transition-colors text-cosmic-gold"
          >
            CosmoCocktails
          </Link>
        </div>

        {/* LINE 2: Socials | Nav | Icons */}
        <div className="flex items-center justify-between">
          {/* Socials */}
          <div className="hidden md:flex items-center gap-4 text-sm">
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-sm uppercase py-2">
            {navLinks.map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                className={clsx(
                  "nav-link",
                  showBg ? "text-black" : "text-cosmic-silver",
                  "hover:text-cosmic-gold"
                )}
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/cart" className="hover:text-cosmic-gold transition">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link href="/account" className="hover:text-cosmic-gold transition">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Hamburger menu (mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-cosmic-gold focus:outline-none"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Animated */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="md:hidden bg-transparent text-cosmic-text px-6 pb-6"
          >
            <nav className="flex flex-col divide-y divide-cosmic-silver/20 text-center text-sm uppercase">
              {navLinks.map((item) => (
                <Link
                  key={item}
                  href={`/${item}`}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 hover:text-cosmic-gold transition"
                >
                  {item}
                </Link>
              ))}
            </nav>

            <hr className="my-6 border-cosmic-silver/30" />

            {/* Footer botones mobile */}
            <div className="flex items-center justify-between">
              {/* Redes */}
              <div className="flex items-center gap-4">
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

              {/* Iconos */}
              <div className="flex items-center gap-4">
                <Link
                  href="/cart"
                  className="hover:text-cosmic-gold transition"
                  aria-label="Cart"
                >
                  <ShoppingCart />
                </Link>
                <Link
                  href="/account"
                  className="hover:text-cosmic-gold transition"
                  aria-label="Account"
                >
                  <User />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
