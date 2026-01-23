"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";
import { ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const devtoolsEnabled =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS === "true";

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo si se habilita explícitamente */}
      {devtoolsEnabled && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
