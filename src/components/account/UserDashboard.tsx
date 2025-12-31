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
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

export default function UserDashboard({
  user,
  stats,
  loading,
  error,
  onRefresh,
}: UserDashboardProps) {
  const { t, language } = useLanguage();
  const locale =
    language === "en" ? "en-US" : language === "nl" ? "nl-NL" : "es-ES";
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-slate-100 mb-2">
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
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-sky-500/25 shadow-[0_0_24px_rgba(2,132,199,.12)]">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-sky-400/10 text-sky-200">
              <HiOutlineShoppingBag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {t("dashboard.total_orders")}
              </p>
              <p className="text-2xl font-semibold text-slate-100">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-emerald-500/25 shadow-[0_0_24px_rgba(16,185,129,.12)]">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-200">
              <HiOutlineCurrencyEuro className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {t("dashboard.total_spent")}
              </p>
              <p className="text-2xl font-semibold text-slate-100">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-rose-500/25 shadow-[0_0_24px_rgba(244,63,94,.12)]">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-rose-400/10 text-rose-200">
              <HiOutlineHeart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {t("dashboard.favorites")}
              </p>
              <p className="text-2xl font-semibold text-slate-100">
                {stats.favoriteCocktails}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-amber-500/25 shadow-[0_0_24px_rgba(245,158,11,.12)]">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-200">
              <HiOutlineStar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {t("dashboard.member_since")}
              </p>
              <p className="text-sm font-semibold text-slate-100">
                {new Date(user.created_at).toLocaleDateString(locale, {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <a
          href="/shop"
          className="group rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-slate-100 backdrop-blur transition hover:border-cosmic-gold/40 hover:text-cosmic-gold"
        >
          <div className="flex items-center gap-3">
            <HiOutlineShoppingBag className="h-5 w-5 text-slate-300 group-hover:text-cosmic-gold" />
            <span>{t("dashboard.view_catalog")}</span>
          </div>
        </a>
        <a
          href="/account?tab=favorites"
          className="group rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-slate-100 backdrop-blur transition hover:border-cosmic-gold/40 hover:text-cosmic-gold"
        >
          <div className="flex items-center gap-3">
            <HiOutlineHeart className="h-5 w-5 text-slate-300 group-hover:text-cosmic-gold" />
            <span>{t("dashboard.view_favorites")}</span>
          </div>
        </a>
        <a
          href="/account?tab=orders"
          className="group rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-slate-100 backdrop-blur transition hover:border-cosmic-gold/40 hover:text-cosmic-gold"
        >
          <div className="flex items-center gap-3">
            <HiOutlineClock className="h-5 w-5 text-slate-300 group-hover:text-cosmic-gold" />
            <span>{t("dashboard.view_orders")}</span>
          </div>
        </a>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-slate-700/40 shadow-lg">
        <div className="p-8 border-b border-slate-700/40">
          <h3 className="text-xl font-semibold text-slate-100 flex items-center">
            <HiOutlineClock className="h-6 w-6 mr-3 text-sky-300" />
            {t("dashboard.recent_orders")}
          </h3>
        </div>
        <div className="p-8">
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map(index => (
                <div
                  key={index}
                  className="h-20 rounded-xl border border-slate-700/40 bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-slate-300 mb-4">{error}</p>
              <button
                type="button"
                onClick={onRefresh}
                className="rounded-full border border-cosmic-gold/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cosmic-gold transition hover:bg-cosmic-gold/10"
              >
                {t("common.retry")}
              </button>
            </div>
          ) : stats.recentOrders.length > 0 ? (
            <div className="space-y-6">
              {stats.recentOrders.slice(0, 3).map((order, index) => {
                const itemCount = order.items?.length || 0;
                const itemLabel =
                  itemCount === 1
                    ? t("dashboard.cocktail")
                    : t("dashboard.cocktails");

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-slate-700/40 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-sky-400/15 flex items-center justify-center">
                        <span className="text-sky-200 font-semibold">
                          #{order.id.slice(-4)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">
                          {itemCount} {itemLabel}
                        </p>
                        <p className="text-sm text-slate-300">
                          {new Date(order.created_at).toLocaleDateString(
                            locale
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-100">
                        {formatCurrency(Number(order.total_amount))}
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "completed"
                            ? "bg-emerald-400/15 text-emerald-200"
                            : "bg-amber-400/15 text-amber-200"
                        }`}
                      >
                        {t(`orders.status.${order.status}`)}
                      </span>
                    </div>
                  </div>
                );
              })}
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
