"use client";

import { ReactNode, Suspense, useEffect } from "react";

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
  useEffect(() => {
    const timer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error(
        `[SuspenseGuard] Timeout ${timeoutMs}ms: possible stuck render. URL=${window.location.pathname}`
      );
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  useEffect(() => {
    const handlePop = () => {
      // eslint-disable-next-line no-console
      console.log(`[Nav] route change/popstate: ${window.location.pathname}`);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  return <Suspense fallback={fallback}>{children}</Suspense>;
}

