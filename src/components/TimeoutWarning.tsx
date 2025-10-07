"use client";

import { useState, useEffect } from "react";
import { useAuthUnified as useAuth } from "@/hooks/useAuthUnified";

interface TimeoutWarningProps {
  onExtend: () => void;
  onLogout: () => void;
  timeRemaining: number;
}

export default function TimeoutWarning({
  onExtend,
  onLogout,
  timeRemaining,
}: TimeoutWarningProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeRemaining);

  useEffect(() => {
    if (timeRemaining > 0) {
      setIsVisible(true);
      setTimeLeft(timeRemaining);
    } else {
      setIsVisible(false);
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          setIsVisible(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sesión por expirar
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Tu sesión expirará en{" "}
            <span className="font-mono font-bold text-red-600">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
            . ¿Quieres extender tu sesión?
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onExtend}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Extender Sesión
            </button>
            <button
              onClick={onLogout}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
