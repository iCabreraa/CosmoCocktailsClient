"use client";

import Image from "next/image";
import { HiOutlineUser } from "react-icons/hi2";
import RoleBadge from "./RoleBadge";

interface UserAvatarProps {
  user: any;
  showName?: boolean;
  showRole?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function UserAvatar({
  user,
  showName = true,
  showRole = true,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          avatar: "w-6 h-6",
          text: "text-sm",
          name: "text-xs",
        };
      case "md":
        return {
          avatar: "w-8 h-8",
          text: "text-base",
          name: "text-sm",
        };
      case "lg":
        return {
          avatar: "w-12 h-12",
          text: "text-lg",
          name: "text-base",
        };
      default:
        return {
          avatar: "w-8 h-8",
          text: "text-base",
          name: "text-sm",
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const displayName =
    user?.full_name || user?.email?.split("@")[0] || "Usuario";
  const userRole = user?.role;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Avatar */}
      <div
        className={`${sizeClasses.avatar} rounded-full overflow-hidden bg-gradient-to-br from-cosmic-gold/20 to-sky-300/20 border border-cosmic-gold/30 flex items-center justify-center hover:scale-105 transition-transform duration-200`}
      >
        {user?.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={displayName}
            width={size === "sm" ? 24 : size === "md" ? 32 : 48}
            height={size === "sm" ? 24 : size === "md" ? 32 : 48}
            className="w-full h-full object-cover"
          />
        ) : (
          <HiOutlineUser className={`${sizeClasses.text} text-cosmic-gold`} />
        )}
      </div>

      {/* Name and Role */}
      {showName && (
        <div className="flex flex-col">
          <span className={`${sizeClasses.name} text-slate-100 font-medium`}>
            {displayName}
          </span>
          {showRole && userRole && <RoleBadge role={userRole} />}
        </div>
      )}
    </div>
  );
}
