"use client";

import { useState } from "react";
import { User } from "@/types/user-system";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineCog,
  HiOutlineCheck,
  HiXMark,
} from "react-icons/hi2";

interface UserProfileProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
}

export default function UserProfile({ user, onUpdate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    phone: user.phone || "",
    email: user.email,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      await onUpdate({
        full_name: formData.full_name,
        phone: formData.phone,
      });
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar perfil"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || "",
      phone: user.phone || "",
      email: user.email,
    });
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-sky-500/30 shadow-[0_0_24px_rgba(59,130,246,.12)] p-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.full_name?.charAt(0).toUpperCase() ||
                user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-100">
              {user.full_name || "Usuario"}
            </h2>
            <p className="text-slate-300">{user.email}</p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role === "customer" ? "Cliente" : user.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 border border-sky-400/30 rounded-lg hover:bg-sky-500/20 transition-colors"
          >
            <HiOutlineCog className="h-4 w-4 mr-2" />
            {isEditing ? "Cancelar" : "Editar"}
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-[#f59e0b]/30 shadow-[0_0_24px_rgba(245,158,11,.12)] p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">
          Información Personal
        </h3>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              <HiOutlineUser className="h-4 w-4 inline mr-2" />
              Nombre Completo
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={e =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-white/5 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu nombre completo"
              />
            ) : (
              <p className="text-slate-100 py-2">
                {user.full_name || "No especificado"}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              <HiOutlineEnvelope className="h-4 w-4 inline mr-2" />
              Email
            </label>
            <p className="text-slate-100 py-2 bg-white/5 px-3 rounded-lg border border-slate-600">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              El email no se puede cambiar por seguridad
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              <HiOutlinePhone className="h-4 w-4 inline mr-2" />
              Teléfono
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-white/5 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+34 123 456 789"
              />
            ) : (
              <p className="text-slate-100 py-2">
                {user.phone || "No especificado"}
              </p>
            )}
          </div>

          {/* Account Info */}
          <div className="border-t border-slate-700/40 pt-6">
            <h4 className="text-sm font-medium text-slate-200 mb-4">
              Información de la Cuenta
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Miembro desde</p>
                <p className="text-slate-100 font-medium">
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última actualización</p>
                <p className="text-slate-100 font-medium">
                  {new Date(user.updated_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-700/40">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-200 bg-white/5 border border-slate-600 rounded-lg hover:bg-white/10 transition-colors"
            >
              <HiXMark className="h-4 w-4 mr-2" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiOutlineCheck className="h-4 w-4 mr-2" />
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
