"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/types/user-system";
import { useLanguage } from "@/contexts/LanguageContext";
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
import UserStatsProvider from "./UserStatsProvider";
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
const UserAddresses = dynamic(() => import("./UserAddresses"), {
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
  HiXMark,
} from "react-icons/hi2";

interface AccountTabsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
  onLogout: () => void;
}

const getTabs = (t: (key: string) => string) => {
  return [
    { id: "dashboard", name: t("account.tabs.dashboard"), icon: HiOutlineHome },
    { id: "profile", name: t("account.tabs.profile"), icon: HiOutlineUser },
    {
      id: "orders",
      name: t("account.tabs.orders"),
      icon: HiOutlineShoppingBag,
    },
    {
      id: "favorites",
      name: t("account.tabs.favorites"),
      icon: HiOutlineHeart,
    },
  ];
};

export default function AccountTabs({
  user,
  onUpdate,
  onLogout,
}: AccountTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = getTabs(t);

  // Initialize active tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) {
      return;
    }
    if (tab === "addresses" || tab === "settings") {
      const params = new URLSearchParams(searchParams);
      params.set("tab", "profile");
      setActiveTab("profile");
      router.replace(`/account?${params.toString()}`, { scroll: false });
      return;
    }
    if (tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, router, tabs]);

  // Function to change tab and update URL
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabId);
    router.push(`/account?${params.toString()}`, { scroll: false });
  };

  const profileContent = (
    <div className="space-y-8">
      <UserProfile user={user} onUpdate={onUpdate} />
      <UserAddresses />
      <UserSettings user={user} onUpdate={onUpdate} />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <UserStatsProvider user={user}>
            {({
              totalOrders,
              totalSpent,
              favoriteCocktails,
              recentOrders,
              loading,
              error,
              refresh,
            }) => (
              <UserDashboard
                user={user}
                stats={{
                  totalOrders,
                  totalSpent,
                  favoriteCocktails,
                  recentOrders,
                }}
                loading={loading}
                error={error}
                onRefresh={refresh}
              />
            )}
          </UserStatsProvider>
        );
      case "profile":
        return profileContent;
      case "addresses":
      case "settings":
        return profileContent;
      case "orders":
        return <UserOrders />;
      case "favorites":
        return <UserFavorites />;
      default:
        return (
          <UserStatsProvider user={user}>
            {({
              totalOrders,
              totalSpent,
              favoriteCocktails,
              recentOrders,
              loading,
              error,
              refresh,
            }) => (
              <UserDashboard
                user={user}
                stats={{
                  totalOrders,
                  totalSpent,
                  favoriteCocktails,
                  recentOrders,
                }}
                loading={loading}
                error={error}
                onRefresh={refresh}
              />
            )}
          </UserStatsProvider>
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-transparent">
      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white/5 backdrop-blur-md border-r border-slate-700/40 min-h-screen sticky top-0 pt-16">
          <div className="p-4 lg:p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {user.full_name?.charAt(0).toUpperCase() ||
                    user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-slate-100">
                  {user.full_name || t("profile.unspecified")}
                </h2>
                <p className="text-sm text-slate-300">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-1 lg:space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center px-2 lg:px-3 py-2 lg:py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-white/10 text-sky-300 border-r-2 border-sky-500"
                        : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3" />
                    <span className="truncate">{tab.name}</span>
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
                {t("account.logout")}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto">
            <div className="pt-8">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
