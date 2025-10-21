import "@/styles/globals.css";
import { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import CosmicBackground from "@/components/ui/CosmicBackground";
import Image from "next/image";
import dynamic from "next/dynamic";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { warnIfStripeEnvInvalid } from "@/lib/diagnostics/stripeEnvCheck";
import SuspenseGuard from "@/components/diagnostics/SuspenseGuard";

// Font imports
import { Inter, Playfair_Display } from "next/font/google";
import { Unica_One, Josefin_Sans } from "next/font/google";

// Fonts
const unica = Unica_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-unica",
});
const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "CosmoCocktails",
  description: "Cócteles premium en Holanda",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Dev-only diagnostics
  if (typeof window !== "undefined") {
    warnIfStripeEnvInvalid();
  }
  const ServiceWorkerRegister = dynamic(
    () => import("@/components/performance/ServiceWorkerRegister"),
    { ssr: false }
  );
  return (
    <html lang="es">
      <body className={`${unica.variable} ${josefin.variable} font-sans`}>
        <ErrorBoundary>
          <LanguageProvider>
            <ThemeProvider>
              <QueryProvider>
                <CosmicBackground className="text-cosmic-text">
                  <Navbar />
                  <main className="pt-36">
                    <SuspenseGuard fallback={null} timeoutMs={8000}>
                      {children}
                    </SuspenseGuard>
                  </main>
                  <Footer />
                  <ServiceWorkerRegister />
                  <SpeedInsights />
                  <Analytics />
                </CosmicBackground>
              </QueryProvider>
            </ThemeProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
