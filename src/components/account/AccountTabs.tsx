"use client";

import { useState } from "react";
import { User } from "@/types/user-system";
import dynamic from "next/dynamic";
const UserDashboard = dynamic(() => import("./UserDashboard"), {
  ssr: true,
  loading: () => (
    <div className="h-48 w-full animate-pulse bg-white/10 rounded-xl" />
  ),
});
const UserProfile = dynamic(() => import("./UserProfile"), {
  ssr: true,
  loading: () => (
    <div className="h-64 w-full animate-pulse bg-white/10 rounded-xl" />
  ),
});
import AdminAccessButton from "@/components/admin/AdminAccessButton";
const UserOrders = dynamic(() => import("./UserOrders"), {
  ssr: true,
  loading: () => (
    <div className="h-64 w-full animate-pulse bg-white/10 rounded-xl" />
  ),
});
const UserFavorites = dynamic(() => import("./UserFavorites"), {
  ssr: true,
  loading: () => (
    <div className="h-64 w-full animate-pulse bg-white/10 rounded-xl" />
  ),
});
const UserSettings = dynamic(() => import("./UserSettings"), {
  ssr: true,
  loading: () => (
    <div className="h-64 w-full animate-pulse bg-white/10 rounded-xl" />
  ),
});
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineCog,
  HiXMark,
} from "react-icons/hi2";

interface AccountTabsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
  onLogout: () => void;
}

const tabs = [
  { id: "dashboard", name: "Dashboard", icon: HiOutlineHome },
  { id: "profile", name: "Perfil", icon: HiOutlineUser },
  { id: "orders", name: "Pedidos", icon: HiOutlineShoppingBag },
  { id: "favorites", name: "Favoritos", icon: HiOutlineHeart },
  { id: "settings", name: "Configuración", icon: HiOutlineCog },
];

export default function AccountTabs({
  user,
  onUpdate,
  onLogout,
}: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock data - en el futuro esto vendrá de APIs
  const mockStats = {
    totalOrders: 0,
    totalSpent: 0,
    favoriteCocktails: 0,
    recentOrders: [],
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <AdminAccessButton />
            <UserDashboard user={user} stats={mockStats} />
          </div>
        );
      case "profile":
        return <UserProfile user={user} onUpdate={onUpdate} />;
      case "orders":
        return <UserOrders userId={user.id} />;
      case "favorites":
        return <UserFavorites userId={user.id} />;
      case "settings":
        return <UserSettings user={user} onUpdate={onUpdate} />;
      default:
        return (
          <div className="space-y-6">
            <AdminAccessButton />
            <UserDashboard user={user} stats={mockStats} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-[radial-gradient(ellipse_at_top,_#0b1220_0%,_#040816_40%,_#00030a_100%)]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/5 backdrop-blur-md border-b border-slate-700/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">Mi Cuenta</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-200 hover:bg-white/10"
          >
            {isMobileMenuOpen ? (
              <HiXMark className="h-5 w-5" />
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white/5 backdrop-blur-md border-r border-slate-700/40 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {user.full_name?.charAt(0).toUpperCase() ||
                    user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-slate-100">
                  {user.full_name || "Usuario"}
                </h2>
                <p className="text-sm text-slate-300">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-white/10 text-sky-300 border-r-2 border-sky-500"
                        : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-700/40">
              <button
                onClick={onLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <HiXMark className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-64 bg-white/5 backdrop-blur-md shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-semibold text-slate-100">
                    Mi Cuenta
                  </h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-200 hover:bg-white/10"
                  >
                    <HiXMark className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-white/10 text-sky-300"
                            : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-6 border-t border-slate-700/40">
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <HiXMark className="h-5 w-5 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
