"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineTruck,
} from "react-icons/hi2";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchUserOrders();
  }, [userId]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?user_id=${userId}`);
      if (!response.ok)
        throw new Error(t("orders.error_loading" as any) || "Error");

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unknown_error"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <HiOutlineCheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <HiOutlineClock className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <HiOutlineXCircle className="h-5 w-5 text-red-600" />;
      default:
        return <HiOutlineTruck className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return t("orders.status.completed");
      case "pending":
        return t("orders.status.pending");
      case "cancelled":
        return t("orders.status.cancelled");
      case "shipped":
        return t("orders.status.shipped");
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
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
        <p className="text-red-800 font-medium">{t("common.error")}</p>
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
        <p className="text-slate-300 mt-2">{t("orders.subtitle")}</p>
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
                      Pedido #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString(
                        language === "en"
                          ? "en-GB"
                          : language === "nl"
                            ? "nl-NL"
                            : "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
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
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 border border-sky-400/30 rounded-lg hover:bg-sky-500/20 transition-colors"
                  >
                    <HiOutlineEye className="h-4 w-4 mr-2" />
                    {t("orders.view_details")}
                  </button>
                </div>
                <p className="text-sm text-slate-300 mt-2">
                  {order.items.length} cocktail
                  {order.items.length !== 1 ? "s" : ""}{" "}
                  {t("orders.items_total")}
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
          <p className="text-slate-300 mb-6">{t("orders.empty_subtitle")}</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {t("footer.explore")}
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/5 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/40">
            <div className="p-6 border-b border-slate-700/40">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">
                  {t("orders.order_details")} #{selectedOrder.id.slice(-8)}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-300 hover:text-slate-100"
                >
                  <HiOutlineXCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-slate-700/40"
                  >
                    <img
                      src={item.image_url}
                      alt={item.cocktail_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-100">
                        {item.cocktail_name}
                      </h4>
                      <p className="text-sm text-gray-500">{item.size_name}</p>
                      <p className="text-sm text-slate-300">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-100">
                        €{item.unit_price}
                      </p>
                      <p className="text-sm text-slate-300">
                        Total: €{(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700/40">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-100">
                    {t("orders.order_total")}
                  </span>
                  <span className="text-2xl font-bold text-slate-100">
                    €{selectedOrder.total_amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
