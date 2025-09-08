"use client";

import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "client" | "staff")[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback,
  redirectTo = "/",
}: RoleGuardProps) {
  const { role, loading, hasPermission } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasPermission(allowedRoles)) {
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [loading, hasPermission, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!hasPermission(allowedRoles)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-gray-500">
              Rol requerido: {allowedRoles.join(" o ")}
            </p>
            <p className="text-sm text-gray-500">Tu rol actual: {role}</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
