"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const enableServiceWorker =
      process.env.NEXT_PUBLIC_ENABLE_SW === "true" &&
      process.env.NODE_ENV === "production";

    const cleanupRegistrations = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      } catch (err) {
        // Silent fail; we don't want to block rendering
      }
    };

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (err) {
        // Silent fail; no user-facing impact
      }
    };

    if (!enableServiceWorker) {
      void cleanupRegistrations();
      return;
    }

    // Delay registration to not compete with hydration
    const id = window.setTimeout(register, 3000);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
