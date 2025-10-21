"use client";

import React from "react";

interface CosmicBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function CosmicBackground({
  children,
  className = "",
}: CosmicBackgroundProps) {
  return (
    <div
      className={`min-h-screen bg-[radial-gradient(ellipse_at_top,_#0b1220_0%,_#040816_40%,_#00030a_100%)] ${className}`}
    >
      {/* Background Elements - Fixed positioning to cover entire viewport */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cosmic-gold rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-sky-300 rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-cosmic-gold rounded-full animate-pulse opacity-30" />
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-35" />
        <div className="absolute top-80 right-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-25" />
        <div className="absolute bottom-60 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-45" />
        <div className="absolute top-1/2 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-pulse opacity-30" />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse opacity-20" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-emerald-400 rounded-full animate-pulse opacity-35" />

        {/* Additional stars distributed throughout the viewport */}
        <div className="absolute top-32 left-1/4 w-1 h-1 bg-orange-400 rounded-full animate-pulse opacity-25" />
        <div className="absolute top-96 right-1/4 w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse opacity-30" />
        <div className="absolute bottom-32 left-1/2 w-1 h-1 bg-rose-400 rounded-full animate-pulse opacity-35" />
        <div className="absolute top-1/4 left-3/4 w-1 h-1 bg-lime-400 rounded-full animate-pulse opacity-20" />
        <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse opacity-25" />
        <div className="absolute top-3/4 left-1/6 w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-30" />
        <div className="absolute bottom-3/4 right-1/6 w-1 h-1 bg-fuchsia-400 rounded-full animate-pulse opacity-25" />
        <div className="absolute top-2/3 left-2/3 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse opacity-20" />
        <div className="absolute bottom-2/3 right-2/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-35" />
        <div className="absolute top-1/6 left-1/3 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
