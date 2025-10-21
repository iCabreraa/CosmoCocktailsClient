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
          bgClass: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",
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
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs uppercase tracking-wider ${config.bgClass} ${config.shadowClass} ${config.glowClass} ${config.textClass} ${className}`}
    >
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 5px rgba(255, 215, 0, 0.3)",
            "0 0 10px rgba(255, 215, 0, 0.5)",
            "0 0 5px rgba(255, 215, 0, 0.3)"
          ]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-1 h-1 rounded-full bg-white/80 mr-1"
      />
      {config.text}
    </motion.div>
  );
}
