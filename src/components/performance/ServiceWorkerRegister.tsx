"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (err) {
        // Silent fail; no user-facing impact
      }
    };

    // Delay registration to not compete with hydration
    const id = window.setTimeout(register, 3000);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
