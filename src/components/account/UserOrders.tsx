"use client";

import { useState, useEffect } from "react";
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
    cocktail_name: string;
    size_name: string;
    quantity: number;
    unit_price: number;
    image_url: string;
  }>;
}

interface UserOrdersProps {
  userId: string;
}

export default function UserOrders({ userId }: UserOrdersProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserOrders();
  }, [userId]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?user_id=${userId}`);
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
        return "bg-green-100 text-green-800";
      case "ordered":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "on_the_way":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <HiOutlineXCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-800 font-medium">{t("orders.error_loading")}</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button
          onClick={fetchUserOrders}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
          <HiOutlineShoppingBag className="h-6 w-6 mr-3 text-blue-600" />
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
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      #{order.id.slice(-4)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {t("orders.order_number")} #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-100">
                    €{order.total_amount}
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
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                      >
                        <img
                          src={item.image_url}
                          alt={item.cocktail_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/order/${order.id}`)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 border border-sky-400/30 rounded-lg hover:bg-sky-500/20 transition-colors"
                  >
                    <HiOutlineEye className="h-4 w-4 mr-2" />
                    {t("orders.view_details")}
                  </button>
                </div>
                <p className="text-sm text-slate-300 mt-2">
                  {order.items.length} {t("orders.items_total")}
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
