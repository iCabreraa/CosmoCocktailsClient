"use client";

import { User } from "@/types/user-system";
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
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white border border-[#f59e0b]/30 shadow-[0_0_40px_rgba(59,130,246,.15)]">
        <h2 className="text-2xl font-bold mb-2">
          ¡Bienvenido de vuelta, {user.full_name?.split(" ")[0] || "Explorador"}
          ! 🚀
        </h2>
        <p className="text-purple-100">
          Tu misión espacial de cocktails continúa...
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-sky-500/30 shadow-[0_0_24px_rgba(2,132,199,.15)]">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiOutlineShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pedidos Totales
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
              <p className="text-sm font-medium text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-slate-100">
                €{stats.totalSpent}
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
              <p className="text-sm font-medium text-gray-600">Favoritos</p>
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
              <p className="text-sm font-medium text-gray-600">Miembro desde</p>
              <p className="text-sm font-bold text-slate-100">
                {new Date(user.created_at).toLocaleDateString("es-ES", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-[#f59e0b]/30 shadow-[0_0_40px_rgba(59,130,246,.08)]">
        <div className="p-6 border-b border-slate-700/40">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center">
            <HiOutlineClock className="h-5 w-5 mr-2 text-blue-600" />
            Pedidos Recientes
          </h3>
        </div>
        <div className="p-6">
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.slice(0, 3).map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-slate-700/40"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        #{order.id.slice(-4)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">
                        {order.items?.length || 0} cocktail
                        {order.items?.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-slate-300">
                        {new Date(order.created_at).toLocaleDateString("es-ES")}
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
                      {order.status === "completed"
                        ? "Completado"
                        : "En proceso"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiOutlineShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-slate-300">Aún no tienes pedidos</p>
              <p className="text-sm text-slate-400">
                ¡Explora nuestro catálogo y haz tu primer pedido!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-sky-500/30 shadow-[0_0_24px_rgba(59,130,246,.12)] p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/shop")}
            className="flex items-center p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <HiOutlineShoppingBag className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sky-300 font-medium">Ver Catálogo</span>
          </button>
          <button
            onClick={() => (window.location.href = "/account?tab=favorites")}
            className="flex items-center p-4 bg-rose-500/10 border border-rose-400/30 rounded-lg hover:bg-rose-500/20 transition-colors"
          >
            <HiOutlineHeart className="h-5 w-5 text-red-600 mr-3" />
            <span className="text-rose-300 font-medium">Mis Favoritos</span>
          </button>
          <button
            onClick={() => (window.location.href = "/account?tab=orders")}
            className="flex items-center p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            <HiOutlineClock className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-emerald-300 font-medium">Historial</span>
          </button>
        </div>
      </div>
    </div>
  );
}
