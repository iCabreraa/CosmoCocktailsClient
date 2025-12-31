"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineTruck,
  HiOutlineCog,
  HiOutlineCreditCard,
} from "react-icons/hi2";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_date?: string;
  items: Array<{
    id: string;
  }>;
}

export default function UserOrders() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const locale = useMemo(() => {
    if (language === "en") return "en-GB";
    if (language === "nl") return "nl-NL";
    return "es-ES";
  }, [language]);

  const formatDate = (value: string) => {
    if (!value) return t("profile.unspecified");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(value ?? 0);

  useEffect(() => {
    fetchUserOrders();
  }, [t]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/orders?summary=1&includeItems=0");
      if (response.status === 401) {
        throw new Error(t("auth.session_expired_message"));
      }
      if (!response.ok) throw new Error(t("common.error"));

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <HiOutlineCreditCard className="h-5 w-5 text-green-600" />;
      case "ordered":
        return <HiOutlineShoppingBag className="h-5 w-5 text-blue-600" />;
      case "preparing":
        return <HiOutlineCog className="h-5 w-5 text-yellow-600" />;
      case "on_the_way":
        return <HiOutlineTruck className="h-5 w-5 text-purple-600" />;
      case "completed":
        return <HiOutlineCheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <HiOutlineClock className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <HiOutlineXCircle className="h-5 w-5 text-red-600" />;
      default:
        return <HiOutlineClock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return t("orders.status.paid");
      case "ordered":
        return t("orders.status.ordered");
      case "preparing":
        return t("orders.status.preparing");
      case "on_the_way":
        return t("orders.status.on_the_way");
      case "completed":
        return t("orders.status.completed");
      case "pending":
        return t("orders.status.pending");
      case "cancelled":
        return t("orders.status.cancelled");
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30";
      case "ordered":
        return "bg-sky-500/15 text-sky-200 border border-sky-400/30";
      case "preparing":
        return "bg-amber-500/15 text-amber-200 border border-amber-400/30";
      case "on_the_way":
        return "bg-violet-500/15 text-violet-200 border border-violet-400/30";
      case "completed":
        return "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30";
      case "pending":
        return "bg-amber-500/15 text-amber-200 border border-amber-400/30";
      case "cancelled":
        return "bg-rose-500/15 text-rose-200 border border-rose-400/30";
      default:
        return "bg-white/10 text-slate-200 border border-white/10";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 border border-rose-500/30 rounded-lg p-6 text-center">
        <HiOutlineXCircle className="h-12 w-12 text-rose-300 mx-auto mb-4" />
        <p className="text-rose-200 font-medium">{t("orders.error_loading")}</p>
        <p className="text-rose-200/80 text-sm mt-2">{error}</p>
        <button
          onClick={fetchUserOrders}
          className="mt-4 px-4 py-2 bg-rose-500/20 text-rose-200 border border-rose-400/40 rounded-lg hover:bg-rose-500/30 transition-colors"
        >
          {t("orders.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-sky-500/30 shadow-[0_0_24px_rgba(59,130,246,.12)] p-6">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center">
          <HiOutlineShoppingBag className="h-6 w-6 mr-3 text-cosmic-gold" />
          {t("orders.title")}
        </h2>
        <p className="text-slate-300 mt-2">
          {t("orders.subtitle")}
        </p>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white/5 backdrop-blur-md rounded-lg border border-slate-700/40 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                    <span className="text-cosmic-gold font-semibold text-sm">
                      #{order.id.slice(-4)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">
                      {t("orders.order_number")} #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-slate-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-100">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{getStatusText(order.status)}</span>
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t border-slate-700/40 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <HiOutlineShoppingBag className="h-4 w-4 text-cosmic-gold/70" />
                    <span>
                      {order.items?.length ?? 0} {t("orders.items_total")}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/order/${order.id}`)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 border border-sky-400/30 rounded-lg hover:bg-sky-500/20 transition-colors"
                  >
                    <HiOutlineEye className="h-4 w-4 mr-2" />
                    {t("orders.view_details")}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {t("orders.order_total")} {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-slate-700/40 p-12 text-center">
          <HiOutlineShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-100 mb-2">
            {t("orders.empty_title")}
          </h3>
          <p className="text-slate-300 mb-6">
            {t("orders.empty_subtitle")}
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {t("shop.explore_now")}
          </button>
        </div>
      )}
    </div>
  );
}
