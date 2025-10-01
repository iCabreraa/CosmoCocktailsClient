"use client";

import { useAuthUnified as useAuth } from "./useAuthUnified";
import { useMemo } from "react";

export type UserRole = "admin" | "client" | "staff";

export function useRole() {
  const { user, loading } = useAuth();

  const role = useMemo((): UserRole => {
    if (!user) return "client";
    return (user.role as UserRole) || "client";
  }, [user]);

  const isAdmin = useMemo(() => role === "admin", [role]);
  const isClient = useMemo(() => role === "client", [role]);
  const isStaff = useMemo(() => role === "staff", [role]);

  const hasPermission = useMemo(() => {
    return (requiredRole: UserRole | UserRole[]) => {
      if (loading) return false;

      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      return roles.includes(role);
    };
  }, [role, loading]);

  return {
    role,
    isAdmin,
    isClient,
    isStaff,
    hasPermission,
    loading,
  };
}

