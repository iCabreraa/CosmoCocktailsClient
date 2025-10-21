"use client";

import { User } from "@/types/user-system";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineCurrencyEuro,
  HiOutlineClock,
  HiOutlineStar,
} from "react-icons/hi2";

interface UserDashboardProps {
  user: User;
  stats: {
    totalOrders: number;
    totalSpent: number;
    favoriteCocktails: number;
    recentOrders: any[];
  };
}

export default function UserDashboard({ user, stats }: UserDashboardProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          {t("dashboard.welcome").replace(
            "{{name}}",
            user.full_name?.split(" ")[0] ||
              user.email?.split("@")[0] ||
              t("dashboard.explorer")
          )}
        </h1>
        <p className="text-slate-300 text-lg">
          {t("dashboard.mission_continue")}
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-sky-500/30 shadow-[0_0_24px_rgba(2,132,199,.15)]">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiOutlineShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.total_orders")}
              </p>
              <p className="text-2xl font-bold text-slate-100">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-emerald-500/30 shadow-[0_0_24px_rgba(16,185,129,.15)]">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <HiOutlineCurrencyEuro className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.total_spent")}
              </p>
              <p className="text-2xl font-bold text-slate-100">
                €{stats.totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-rose-500/30 shadow-[0_0_24px_rgba(244,63,94,.15)]">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <HiOutlineHeart className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.favorites")}
              </p>
              <p className="text-2xl font-bold text-slate-100">
                {stats.favoriteCocktails}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-amber-500/30 shadow-[0_0_24px_rgba(245,158,11,.15)]">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <HiOutlineStar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.member_since")}
              </p>
              <p className="text-sm font-bold text-slate-100">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-slate-700/40 shadow-lg">
        <div className="p-8 border-b border-slate-700/40">
          <h3 className="text-xl font-semibold text-slate-100 flex items-center">
            <HiOutlineClock className="h-6 w-6 mr-3 text-blue-500" />
            {t("dashboard.recent_orders")}
          </h3>
        </div>
        <div className="p-8">
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-6">
              {stats.recentOrders.slice(0, 3).map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-slate-700/40 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        #{order.id.slice(-4)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">
                        {order.items?.length || 0}{" "}
                        {t("dashboard.cocktail", {
                          count: order.items?.length || 0,
                        })}
                      </p>
                      <p className="text-sm text-slate-300">
                        {new Date(order.created_at).toLocaleDateString("en-US")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-100">
                      €{order.total_amount}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {t(`orders.status.${order.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HiOutlineShoppingBag className="h-16 w-16 text-slate-400 mx-auto mb-6" />
              <p className="text-slate-300 text-lg mb-2">
                {t("dashboard.no_orders")}
              </p>
              <p className="text-slate-400">{t("dashboard.explore_catalog")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
