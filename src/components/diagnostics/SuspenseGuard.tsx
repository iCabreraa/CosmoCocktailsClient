"use client";

import { ReactNode, Suspense, useCallback, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  timeoutMs?: number;
};

export default function SuspenseGuard({
  children,
  fallback = null,
  timeoutMs = 8000,
}: Props) {
  const [isFallbackVisible, setIsFallbackVisible] = useState(false);
  const handleFallbackVisibility = useCallback((visible: boolean) => {
    setIsFallbackVisible(visible);
  }, []);

  useEffect(() => {
    if (!isFallbackVisible || process.env.NODE_ENV !== "development") {
      return;
    }

    const timer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error(
        `[SuspenseGuard] Timeout ${timeoutMs}ms: possible stuck render. URL=${window.location.pathname}`
      );
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [isFallbackVisible, timeoutMs]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const handlePop = () => {
      // eslint-disable-next-line no-console
      console.log(`[Nav] route change/popstate: ${window.location.pathname}`);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  return (
    <Suspense
      fallback={
        <FallbackTracker onVisibilityChange={handleFallbackVisibility}>
          {fallback}
        </FallbackTracker>
      }
    >
      {children}
    </Suspense>
  );
}

function FallbackTracker({
  children,
  onVisibilityChange,
}: {
  children: ReactNode;
  onVisibilityChange: (visible: boolean) => void;
}) {
  useEffect(() => {
    onVisibilityChange(true);
    return () => onVisibilityChange(false);
  }, [onVisibilityChange]);

  return <>{children}</>;
}
