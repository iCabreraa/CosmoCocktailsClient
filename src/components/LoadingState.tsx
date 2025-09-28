"use client";

import { useEffect, useState } from "react";
import { HiOutlineExclamationTriangle, HiArrowPath } from "react-icons/hi2";

interface LoadingStateProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export default function LoadingState({
  message = "Cargando...",
  timeout = 10000,
  onTimeout,
}: LoadingStateProps) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowError(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (showError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8">
          <HiOutlineExclamationTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            La carga está tardando más de lo esperado
          </h2>
          <p className="text-gray-300 mb-6">
            Esto puede deberse a problemas de conexión o configuración.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiArrowPath className="h-4 w-4 mr-2" />
              Recargar
            </button>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto mb-4"></div>
        <p className="text-cosmic-silver text-lg">{message}</p>
      </div>
    </div>
  );
}
