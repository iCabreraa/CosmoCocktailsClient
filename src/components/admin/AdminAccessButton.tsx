"use client";

import { useState } from "react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  HiOutlineCog6Tooth,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";

export default function AdminAccessButton() {
  const { canAccess, isLoading } = useAdminAccess();
  const [busy, setBusy] = useState(false);

  if (isLoading || !canAccess) return null;

  const handleClick = () => {
    setBusy(true);
    // En producción, usar el subdominio del admin
    const url = process.env.NODE_ENV === "production" 
      ? "https://admin.cosmococktails.nl"  // ← Cambiar por tu dominio real
      : "http://localhost:5174";
    window.open(url, "_blank", "noopener,noreferrer");
    setBusy(false);
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-xl p-4 border border-red-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiOutlineCog6Tooth className="h-6 w-6 text-white" />
          <div>
            <h3 className="text-white font-semibold">Admin Panel</h3>
            <p className="text-xs text-red-100">Solo personal autorizado</p>
          </div>
        </div>
        <button
          onClick={handleClick}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50"
        >
          {busy ? (
            <span>Redirigiendo…</span>
          ) : (
            <>
              <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
              <span>Acceder</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
