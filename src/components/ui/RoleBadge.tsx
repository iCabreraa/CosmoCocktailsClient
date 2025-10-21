"use client";

import { motion } from "framer-motion";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export default function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
      case "super_admin":
        return {
          text: "ADMIN",
          bgClass:
            "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",
          shadowClass: "shadow-yellow-500/50",
          glowClass: "shadow-lg hover:shadow-xl hover:shadow-yellow-500/75",
          textClass: "text-yellow-900 font-bold",
        };
      case "staff":
      case "manager":
        return {
          text: "STAFF",
          bgClass: "bg-gradient-to-r from-red-400 via-red-500 to-red-600",
          shadowClass: "shadow-red-500/50",
          glowClass: "shadow-lg hover:shadow-xl hover:shadow-red-500/75",
          textClass: "text-red-900 font-bold",
        };
      default:
        return null;
    }
  };

  const config = getRoleConfig(role);
  if (!config) return null;

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs uppercase tracking-wider ${config.bgClass} ${config.shadowClass} ${config.glowClass} ${config.textClass} ${className}`}
    >
      <div className="w-1 h-1 rounded-full bg-white/80 mr-1 animate-pulse" />
      {config.text}
    </div>
  );
}
