"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, User, Menu, X, Globe } from "lucide-react";
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
import UserAvatar from "@/components/ui/UserAvatar";
import RoleBadge from "@/components/ui/RoleBadge";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import "@fontsource/major-mono-display";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { canAccessAdmin } = useAdminAccess();
  const pathname = usePathname();

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
    if (isInAccountSection) {
      setAccountDropdownOpen(true);
    } else {
      setAccountDropdownOpen(false);
    }
  }, [isInAccountSection]);

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
    const getUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();
          setUser(userData || authUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // User signed in, fetch user data
        try {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setUser(userData || session.user);
        } catch (error) {
          console.error("Error fetching user data after sign in:", error);
          setUser(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        // User signed out
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setMenuOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getAccountTabs = () => {
    const baseTabs = [
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

    if (canAccessAdmin) {
      baseTabs.push({
        id: "admin",
        name: t("account.tabs.admin"),
        icon: HiOutlineCog6Tooth,
        href: "/account?tab=admin",
      });
    }

    return baseTabs;
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
              <div className="p-4 sm:p-6 pb-32">
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
                  <div className="mt-4">
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
                      <nav className="space-y-1 mt-2 ml-6">
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
                  </div>
                )}
              </div>

              {/* Language Selector - Above user section */}
              <div className="absolute bottom-32 left-0 right-0 px-4 sm:px-6">
                <div className="flex justify-start">
                  <LanguageSelector />
                </div>
              </div>

              {/* User Section - At the very bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-slate-700/40 bg-gradient-to-t from-slate-900/50 to-white/5 backdrop-blur-md">
                {user ? (
                  <div className="space-y-3">
                    {/* User Profile Card - Compact */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 backdrop-blur-sm">
                      {/* User Info - Avatar, Name and Role */}
                      <div className="flex items-center space-x-3">
                        {/* Avatar - Smaller */}
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-cosmic-gold/30 to-sky-300/30 border border-cosmic-gold/40 flex items-center justify-center shadow-md">
                          {user?.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={
                                user?.full_name ||
                                user?.email?.split("@")[0] ||
                                "Usuario"
                              }
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <HiOutlineUser className="text-sm text-cosmic-gold" />
                          )}
                        </div>

                        {/* Name and Role - Compact */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-100 truncate">
                              {user?.full_name ||
                                user?.email?.split("@")[0] ||
                                "Usuario"}
                            </span>
                            {user?.role && <RoleBadge role={user.role} />}
                          </div>
                        </div>
                      </div>

                      {/* Admin Panel Button - Compact */}
                      {(user.role === "admin" ||
                        user.role === "super_admin" ||
                        user.role === "staff" ||
                        user.role === "manager") && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center justify-center px-3 py-2 mt-2 text-xs font-medium rounded-lg bg-gradient-to-r from-cosmic-gold/20 to-sky-300/20 text-cosmic-gold hover:from-cosmic-gold/30 hover:to-sky-300/30 transition-all duration-200 border border-cosmic-gold/30 shadow-md hover:shadow-cosmic-gold/25"
                        >
                          <HiOutlineCog6Tooth className="h-3 w-3 mr-2" />
                          <span>Panel de Administración</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout Button - Compact */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-400/40"
                    >
                      <HiXMark className="h-4 w-4 mr-2" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-slate-100 rounded-lg transition-colors border border-white/10"
                  >
                    <HiOutlineUser className="h-4 w-4 mr-2" />
                    {t("nav.login")}
                  </Link>
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
                  {navLinks.map(item => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={clsx(
                        "nav-link font-medium tracking-wide transition-colors duration-200",
                        "text-cosmic-silver hover:text-cosmic-gold"
                      )}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  ))}
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
                    className="hover:text-cosmic-gold transition-colors duration-200"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </Link>

                  {/* User Account Icon with Login Indicator */}
                  <Link
                    href={user ? "/account?tab=dashboard" : "/account"}
                    className="hover:text-cosmic-gold transition-colors duration-200 relative"
                    aria-label={user ? "User Dashboard" : "User Account"}
                  >
                    <User className="w-5 h-5" />
                    {/* Login Indicator Circle */}
                    {user && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-cosmic-gold rounded-full border border-slate-900"></div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
