"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthUnified } from "@/hooks/useAuthUnified";
import { useAuthRefresh } from "@/hooks/useAuthRefresh";
import { useRouter } from "next/navigation";
import {
  ErrorNotification,
  useNotifications,
} from "@/components/ErrorNotification";
import AccountTabs from "@/components/account/AccountTabs";

export default function AccountPage() {
  const {
    user,
    loading,
    signIn: login,
    signUp: signup,
    signOut: logout,
    error: authError,
  } = useAuthUnified();

  const isAuthenticated = !!user;
  const { refreshError, clearRefreshError } = useAuthRefresh();
  const { notifications, addNotification, removeNotification } =
    useNotifications();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const router = useRouter();

  // Mostrar notificaciones de errores de autenticación
  useEffect(() => {
    if (authError) {
      addNotification({
        type: "error",
        title: "Error de autenticación",
        message: authError,
        duration: 5000,
      });
    }
  }, [authError, addNotification]);

  // Mostrar notificaciones de errores de refresh
  useEffect(() => {
    if (refreshError) {
      addNotification({
        type: "warning",
        title: "Sesión expirada",
        message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        duration: 7000,
      });
      clearRefreshError();
    }
  }, [refreshError, addNotification, clearRefreshError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingAction(true);

    try {
      if (isLogin) {
        const { error } = await login(formData.email, formData.password);
        if (error) {
          setError(error.message);
          addNotification({
            type: "error",
            title: "Error de inicio de sesión",
            message: error.message,
            duration: 5000,
          });
        } else {
          addNotification({
            type: "success",
            title: "Sesión iniciada",
            message: "Has iniciado sesión correctamente.",
            duration: 3000,
          });
          // Permanecer en /account; el listener de auth actualizará el dashboard sin forzar navegación
          // Limpiar el formulario después del login exitoso
          setFormData({ email: "", password: "", full_name: "", phone: "" });
        }
      } else {
        const { error } = await signup(
          formData.email,
          formData.password,
          formData.full_name,
          formData.phone
        );
        if (error) {
          setError(error.message);
          addNotification({
            type: "error",
            title: "Error de registro",
            message: error.message,
            duration: 5000,
          });
        } else {
          addNotification({
            type: "success",
            title: "Cuenta creada",
            message: "Revisa tu email para confirmar tu cuenta.",
            duration: 5000,
          });
          setIsLogin(true);
          setFormData({ email: "", password: "", full_name: "", phone: "" });
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      setError(errorMessage);
      addNotification({
        type: "error",
        title: "Error inesperado",
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <>
        <AccountTabs
          user={user}
          onUpdate={async updates => {
            // Aquí implementarías la lógica de actualización
            console.log("Updating user:", updates);
          }}
          onLogout={handleLogout}
        />
        {/* Notificaciones */}
        {notifications.map(notification => (
          <ErrorNotification
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id!)}
          />
        ))}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    required={!isLogin}
                    value={formData.full_name}
                    onChange={e =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loadingAction}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingAction
                ? "Procesando..."
                : isLogin
                  ? "Iniciar Sesión"
                  : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              {isLogin
                ? "¿No tienes cuenta? Crear una"
                : "¿Ya tienes cuenta? Iniciar sesión"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-500 text-sm"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      {notifications.map(notification => (
        <ErrorNotification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id!)}
        />
      ))}
    </div>
  );
}
