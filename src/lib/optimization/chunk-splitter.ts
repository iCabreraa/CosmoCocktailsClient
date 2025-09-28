/**
 * Chunk Splitter - Optimización del bundle
 *
 * Este archivo contiene utilidades para optimizar la división de chunks
 * y reducir el tamaño del chunk common que excede el límite.
 */

// Configuración de chunks optimizados
export const CHUNK_CONFIG = {
  // Límites de tamaño por chunk
  limits: {
    common: 50 * 1024, // 50KB
    vendors: 200 * 1024, // 200KB
    shared: 100 * 1024, // 100KB
  },

  // Configuración de splitChunks
  splitChunks: {
    chunks: "all",
    minSize: 20000,
    maxSize: 100000,
    cacheGroups: {
      // Chunk para librerías de UI
      ui: {
        test: /[\\/]node_modules[\\/](react|react-dom|framer-motion|@headlessui)[\\/]/,
        name: "ui",
        chunks: "all",
        priority: 20,
      },

      // Chunk para librerías de datos
      data: {
        test: /[\\/]node_modules[\\/](@tanstack|zustand|@supabase)[\\/]/,
        name: "data",
        chunks: "all",
        priority: 15,
      },

      // Chunk para librerías de utilidades
      utils: {
        test: /[\\/]node_modules[\\/](lodash|date-fns|clsx|tailwind-merge)[\\/]/,
        name: "utils",
        chunks: "all",
        priority: 10,
      },

      // Chunk para librerías de pago
      payment: {
        test: /[\\/]node_modules[\\/](stripe|@stripe)[\\/]/,
        name: "payment",
        chunks: "all",
        priority: 25,
      },

      // Chunk común optimizado
      common: {
        name: "common",
        minChunks: 2,
        chunks: "all",
        priority: 5,
        maxSize: 50000, // 50KB límite
      },
    },
  },
};

// Función para analizar el tamaño de chunks
export function analyzeChunkSize(chunkName: string, size: number) {
  const limit =
    CHUNK_CONFIG.limits[chunkName as keyof typeof CHUNK_CONFIG.limits];

  if (!limit) return { status: "unknown", percentage: 0 };

  const percentage = (size / limit) * 100;

  if (percentage <= 80) {
    return { status: "good", percentage };
  } else if (percentage <= 100) {
    return { status: "warning", percentage };
  } else {
    return { status: "critical", percentage };
  }
}

// Función para optimizar imports dinámicos
export function createDynamicImport(modulePath: string, chunkName?: string) {
  return () => {
    if (chunkName) {
      return import(/* webpackChunkName: "[request]" */ modulePath);
    }
    return import(modulePath);
  };
}

// Función para preload de chunks críticos
export function preloadCriticalChunks() {
  if (typeof window === "undefined") return;

  const criticalChunks = ["ui", "data", "payment"];

  criticalChunks.forEach(chunkName => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = `/_next/static/chunks/${chunkName}.js`;
    document.head.appendChild(link);
  });
}

// Función para monitorear el rendimiento de chunks
export function monitorChunkPerformance() {
  if (typeof window === "undefined") return;

  const observer = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      if (entry.entryType === "resource" && entry.name.includes("chunk")) {
        const chunkName = entry.name.split("/").pop()?.split(".")[0];
        const loadTime = entry.duration;

        console.log(`Chunk ${chunkName} loaded in ${loadTime}ms`);

        // Alertar si un chunk tarda mucho en cargar
        if (loadTime > 1000) {
          console.warn(`Slow chunk detected: ${chunkName} (${loadTime}ms)`);
        }
      }
    });
  });

  observer.observe({ entryTypes: ["resource"] });
}
