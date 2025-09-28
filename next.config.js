/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
  analyzerMode: "static",
  analyzerPort: 8888,
  reportFilename: "bundle-report.html",
});

const nextConfig = {
  reactStrictMode: true,

  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@supabase/supabase-js", "zustand"],
  },

  // Configuración de imágenes optimizada
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qpztyzhosqbmzptazlnx.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compresión y optimización
  compress: true,
  poweredByHeader: false,

  // Headers de seguridad y rendimiento
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones de producción
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 100000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          // Chunk para librerías de UI
          ui: {
            test: /[\\/]node_modules[\\/](react|react-dom|framer-motion|@headlessui)[\\/]/,
            name: "ui",
            chunks: "all",
            priority: 20,
            maxSize: 50000,
          },
          // Chunk para librerías de datos
          data: {
            test: /[\\/]node_modules[\\/](@tanstack|zustand|@supabase)[\\/]/,
            name: "data",
            chunks: "all",
            priority: 15,
            maxSize: 60000,
          },
          // Chunk para librerías de utilidades
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|clsx|tailwind-merge)[\\/]/,
            name: "utils",
            chunks: "all",
            priority: 10,
            maxSize: 30000,
          },
          // Chunk para librerías de pago
          payment: {
            test: /[\\/]node_modules[\\/](stripe|@stripe)[\\/]/,
            name: "payment",
            chunks: "all",
            priority: 25,
            maxSize: 40000,
          },
          // Chunk común optimizado
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
            maxSize: 50000, // 50KB límite
            reuseExistingChunk: true,
          },
          // Chunk para vendors restantes
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: -10,
            chunks: "all",
            maxSize: 80000,
          },
        },
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
