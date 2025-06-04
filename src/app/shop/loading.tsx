// src/app/shop/loading.tsx
"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="w-12 h-12 border-4 border-cosmic-gold border-t-transparent rounded-full"
      />
    </div>
  );
}
