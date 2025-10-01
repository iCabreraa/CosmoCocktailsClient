"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuthUnified as useAuth } from "./useAuthUnified";
import { useRouter } from "next/navigation";

interface UseAutoLogoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onWarning?: () => void;
  onLogout?: () => void;
}

export function useAutoLogout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onWarning,
  onLogout,
}: UseAutoLogoutOptions = {}) {
  const { logout } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(
      () => {
        onWarning?.();
      },
      (timeoutMinutes - warningMinutes) * 60 * 1000
    );

    // Set logout timeout
    timeoutRef.current = setTimeout(
      async () => {
        await logout();
        onLogout?.();
        router.push("/account?reason=timeout");
      },
      timeoutMinutes * 60 * 1000
    );
  }, [timeoutMinutes, warningMinutes, logout, onWarning, onLogout, router]);

  const handleActivity = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  useEffect(() => {
    // Add event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timeout setup
    resetTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [handleActivity, resetTimeout]);

  return {
    resetTimeout,
    getTimeUntilLogout: () => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      const timeUntilLogout = timeoutMinutes * 60 * 1000 - timeSinceActivity;
      return Math.max(0, timeUntilLogout);
    },
  };
}

