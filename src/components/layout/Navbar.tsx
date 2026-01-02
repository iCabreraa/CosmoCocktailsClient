"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineCog,
  HiOutlineCog6Tooth,
  HiXMark,
  HiOutlineShoppingCart,
  HiOutlineCalendar,
  HiOutlineInformationCircle,
  HiOutlinePhone,
} from "react-icons/hi2";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useFavorites } from "@/hooks/queries/useFavorites";
import { useCart } from "@/store/cart";
import { useAuthUnified } from "@/hooks/useAuthUnified";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/feedback/ToastProvider";
import "@fontsource/major-mono-display";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLanguage();
  const { canAccess: canAccessAdmin } = useAdminAccess();
  const { user, logout } = useAuthUnified();
  const pathname = usePathname();
  const router = useRouter();
  const { notify } = useToast();
  const hasFavoritesAccess = Boolean(user);
  const { favoritesQuery } = useFavorites<"ids">({
    enabled: hasFavoritesAccess && accountDropdownOpen,
    mode: "ids",
  });
  const favoritesCount =
    hasFavoritesAccess && Array.isArray(favoritesQuery.data)
      ? favoritesQuery.data.length
      : 0;
  const { item_count, hasHydrated } = useCart();
  const cartCount = hasHydrated ? item_count : 0;

  const showBg = scrolled || hovered;

  // Function to check if a route is active
  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Check if we're in account section
  const isInAccountSection = pathname.startsWith("/account");

  // Get current account tab from URL
  const getCurrentAccountTab = () => {
    if (!isInAccountSection) return null;
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab") || "dashboard";
    return tab;
  };

  // Auto-open account dropdown if we're in account section
  useEffect(() => {
    if (!isInAccountSection) {
      setAccountDropdownOpen(false);
      return;
    }
    if (menuOpen) {
      setAccountDropdownOpen(true);
    }
  }, [isInAccountSection, menuOpen]);

  const navLinks = [
    { key: "home", href: "/", icon: HiOutlineHome },
    { key: "shop", href: "/shop", icon: HiOutlineShoppingCart },
    { key: "events", href: "/events", icon: HiOutlineCalendar },
    { key: "about", href: "/about", icon: HiOutlineInformationCircle },
    { key: "contact", href: "/contact", icon: HiOutlinePhone },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!accountDropdownOpen || menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountDropdownOpen, menuOpen]);

  // Block body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) throw error;
      setMenuOpen(false);
      setAccountDropdownOpen(false);
      notify({
        type: "success",
        title: t("auth.logout_success_title"),
        message: t("auth.logout_success_message"),
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      notify({
        type: "error",
        title: t("auth.logout_error_title"),
        message: t("auth.logout_error_message"),
      });
    }
  };

  const getAccountTabs = () => {
    return [
      {
        id: "dashboard",
        name: t("account.tabs.dashboard"),
        icon: HiOutlineHome,
        href: "/account?tab=dashboard",
      },
      {
        id: "profile",
        name: t("account.tabs.profile"),
        icon: HiOutlineUser,
        href: "/account?tab=profile",
      },
      {
        id: "orders",
        name: t("account.tabs.orders"),
        icon: HiOutlineShoppingBag,
        href: "/account?tab=orders",
      },
      {
        id: "favorites",
        name: t("account.tabs.favorites"),
        icon: HiOutlineHeart,
        href: "/account?tab=favorites",
      },
      {
        id: "settings",
        name: t("account.tabs.settings"),
        icon: HiOutlineCog,
        href: "/account?tab=settings",
      },
    ];
  };

  return (
    <>
      {/* Mobile Sidebar - Rendered outside header to cover entire screen */}
      {menuOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="md:hidden fixed inset-0 z-[100]">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-72 sm:w-80 bg-white/5 backdrop-blur-md shadow-xl z-[101]">
              <div className="p-4 sm:p-6 pb-40">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-semibold text-slate-100">
                    {t("nav.menu")}
                  </h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-200 hover:bg-white/10"
                  >
                    <HiXMark className="h-5 w-5" />
                  </button>
                </div>

                {/* Main Navigation */}
                <nav className="space-y-1">
                  {navLinks.map(item => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? "bg-white/10 text-sky-300 border-r-2 border-sky-500"
                            : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span>{t(`nav.${item.key}`)}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Account Section */}
                {user && (
                  <div className="mt-8">
                    <button
                      onClick={() => {
                        if (!isInAccountSection) {
                          setAccountDropdownOpen(!accountDropdownOpen);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isInAccountSection
                          ? "bg-white/10 text-sky-300 border-r-2 border-sky-500 cursor-default"
                          : "text-slate-300 hover:bg-white/5 hover:text-slate-100 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center">
                        <HiOutlineUser className="h-5 w-5 mr-3" />
                        <span>{t("nav.account")}</span>
                      </div>
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          accountDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Account Dropdown */}
                    {accountDropdownOpen && (
                      <nav className="space-y-2 mt-4 ml-6">
                        {getAccountTabs().map(tab => {
                          const Icon = tab.icon;
                          const currentTab = getCurrentAccountTab();
                          const isActive = currentTab === tab.id;
                          return (
                            <Link
                              key={tab.id}
                              href={tab.href}
                              onClick={() => {
                                setMenuOpen(false);
                                if (!isInAccountSection) {
                                  setAccountDropdownOpen(false);
                                }
                              }}
                              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                  ? "bg-white/10 text-sky-300 border-r-2 border-sky-500"
                                  : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                              }`}
                            >
                              <Icon className="h-4 w-4 mr-3" />
                              <span>{tab.name}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    )}

                    {/* Admin Panel Button - Compact, aligned with other links */}
                    {canAccessAdmin && (
                      <div className="mt-2 ml-6">
                        <Link
                          href="/admin"
                          onClick={() => {
                            setMenuOpen(false);
                            setAccountDropdownOpen(false);
                          }}
                          className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-cosmic-gold/20 to-sky-300/20 border border-cosmic-gold/40 text-cosmic-gold hover:from-cosmic-gold/30 hover:to-sky-300/30 hover:border-cosmic-gold/60 hover:scale-105 shadow-lg shadow-cosmic-gold/10"
                        >
                          <HiOutlineCog6Tooth className="h-4 w-4 mr-3" />
                          <span>{t("admin.short")}</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Section - Minimalist design */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-slate-700/40 bg-gradient-to-t from-slate-900/50 to-white/5 backdrop-blur-md">
                {user ? (
                  <div className="space-y-3">
                    {/* Language Selector - Above user info */}
                    <div className="flex justify-center pb-2 border-b border-slate-700/30">
                      <LanguageSelector />
                    </div>

                    {/* User Info - Minimalist inline design */}
                    <div className="flex items-center justify-between">
                      {/* User Profile - Avatar and Name */}
                      <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10 backdrop-blur-sm flex-1 mr-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-cosmic-gold/30 to-sky-300/30 border border-cosmic-gold/40 flex items-center justify-center">
                          {user?.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={
                                user?.full_name ||
                                user?.email?.split("@")[0] ||
                                t("common.user")
                              }
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <HiOutlineUser className="text-sm text-cosmic-gold" />
                          )}
                        </div>

                        {/* Name */}
                        <span className="text-sm font-medium text-slate-100 truncate">
                          {user?.full_name ||
                            user?.email?.split("@")[0] ||
                            "Usuario"}
                        </span>
                      </div>

                      {/* Logout Button - Red square with X */}
                      <button
                        onClick={handleLogout}
                        className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 hover:border-red-400/60 rounded-lg flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
                        title="Cerrar Sesión"
                      >
                        <HiXMark className="h-5 w-5 text-red-300 hover:text-red-200" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Language Selector - Above login */}
                    <div className="flex justify-center pb-2 border-b border-slate-700/30">
                      <LanguageSelector />
                    </div>

                    {/* Login Button */}
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-slate-100 rounded-lg transition-colors border border-white/10"
                    >
                      <HiOutlineUser className="h-4 w-4 mr-2" />
                      {t("nav.login")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      <header
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          menuOpen
            ? "bg-gradient-to-r from-slate-200/25 via-blue-100/35 to-slate-200/25 backdrop-blur-xl border-b border-cosmic-gold/20 text-cosmic-silver"
            : showBg
              ? "bg-gradient-to-r from-slate-200/30 via-blue-100/40 to-slate-200/30 backdrop-blur-xl border-b border-cosmic-gold/30 text-cosmic-silver"
              : "bg-gradient-to-r from-slate-200/20 via-blue-100/30 to-slate-200/20 backdrop-blur-lg border-b border-cosmic-gold/10 text-cosmic-silver"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between">
            {/* Mobile Logo */}
            <Link
              href="/"
              className="text-xl sm:text-2xl font-logo tracking-widest uppercase transition-colors text-cosmic-gold hover:text-cosmic-gold/80 hover:scale-105"
            >
              CosmoCocktails
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-cosmic-gold hover:text-cosmic-gold/80 transition-colors duration-200 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            {/* Centered Layout Container */}
            <div className="flex flex-col items-center space-y-8">
              {/* Logo and Navigation - Always Centered Together */}
              <div className="flex flex-col items-center space-y-4">
                {/* Logo - Centered */}
                <Link
                  href="/"
                  className="text-4xl font-logo tracking-widest uppercase transition-colors text-cosmic-gold hover:text-cosmic-gold/80 hover:scale-105"
                >
                  CosmoCocktails
                </Link>

                {/* Navigation - Perfectly Centered with Logo */}
                <nav className="flex items-center space-x-12 text-sm uppercase">
                  {navLinks.map(item => {
                    const isActive = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={clsx(
                          "nav-link font-medium tracking-wide transition-colors duration-200",
                          isActive
                            ? "nav-link-active"
                            : "text-cosmic-silver hover:text-cosmic-gold"
                        )}
                      >
                        {t(`nav.${item.key}`)}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Side Elements - Better spaced from edges */}
              <div className="relative w-full max-w-6xl">
                {/* Left Side Elements - More space from edge */}
                <div className="absolute left-12 top-0 flex items-center space-x-4">
                  <a
                    href="https://www.instagram.com/cosmococktails_2024/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cosmic-gold transition-colors duration-200"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <LanguageSelector />
                </div>

                {/* Right Side Elements - More space from edge */}
                <div className="absolute right-12 top-0 flex items-center space-x-4">
                  <Link
                    href="/cart"
                    className="relative hover:text-cosmic-gold transition-colors duration-200"
                    aria-label={t("nav.cart")}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cosmic-gold px-1 text-[10px] font-semibold text-black">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Admin Panel Button - Only for admins */}
                  {canAccessAdmin && (
                    <Link
                      href="/admin"
                      className="hover:text-cosmic-gold transition-colors duration-200"
                      aria-label="Admin Panel"
                      title="Panel de Administración"
                    >
                      <HiOutlineCog6Tooth className="w-5 h-5" />
                    </Link>
                  )}

                  {/* User Account */}
                  {user ? (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setAccountDropdownOpen(prev => !prev)
                        }
                        className="hover:text-cosmic-gold transition-colors duration-200 relative"
                        aria-label={t("nav.account")}
                        aria-expanded={accountDropdownOpen}
                      >
                        <User className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border border-slate-900 bg-cosmic-gold" />
                      </button>

                      <AnimatePresence>
                        {accountDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-4 w-64 rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-left shadow-2xl backdrop-blur-xl"
                          >
                            <div className="px-3 pb-3">
                              <p className="text-sm font-semibold text-slate-100">
                                {user?.full_name ||
                                  user?.email?.split("@")[0] ||
                                  t("common.user")}
                              </p>
                              <p className="text-xs text-slate-400">
                                {user?.email}
                              </p>
                            </div>
                            <div className="h-px w-full bg-white/10" />
                            <div className="mt-3 space-y-1">
                              {getAccountTabs().map(tab => {
                                const Icon = tab.icon;
                                const currentTab = getCurrentAccountTab();
                                const isActive = currentTab === tab.id;
                                return (
                                  <Link
                                    key={tab.id}
                                    href={tab.href}
                                    onClick={() =>
                                      setAccountDropdownOpen(false)
                                    }
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                      isActive
                                        ? "bg-white/10 text-sky-300"
                                        : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      {tab.name}
                                    </span>
                                    {tab.id === "favorites" &&
                                      favoritesCount > 0 && (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cosmic-gold px-1 text-[10px] font-semibold text-black">
                                          {favoritesCount > 9
                                            ? "9+"
                                            : favoritesCount}
                                        </span>
                                      )}
                                  </Link>
                                );
                              })}
                              {canAccessAdmin && (
                                <Link
                                  href="/admin"
                                  onClick={() =>
                                    setAccountDropdownOpen(false)
                                  }
                                  className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-cosmic-gold hover:bg-cosmic-gold/10 transition-colors"
                                >
                                  <HiOutlineCog6Tooth className="mr-2 h-4 w-4" />
                                  {t("admin.short")}
                                </Link>
                              )}
                            </div>
                            <div className="mt-3 h-px w-full bg-white/10" />
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="mt-3 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <HiXMark className="mr-2 h-4 w-4" />
                              {t("account.logout")}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href="/account"
                      className="hover:text-cosmic-gold transition-colors duration-200 relative"
                      aria-label={t("nav.login")}
                    >
                      <User className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
