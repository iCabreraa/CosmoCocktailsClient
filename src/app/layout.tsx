import "@/styles/globals.css";
import { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Image from "next/image";

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
  return (
    <html lang="es">
      <body className={`${unica.variable} ${josefin.variable} font-sans`}>
        <ErrorBoundary>
          <LanguageProvider>
            <ThemeProvider>
              <QueryProvider>
                <div className="relative min-h-screen bg-cosmic-bg text-cosmic-text">
                  {/* Fondo cósmico para tema oscuro */}
                  <div className="dark:block hidden">
                    <Image
                      src="/images/hero-bg.webp"
                      alt="Cosmic Background Dark"
                      fill
                      priority
                      className="object-cover brightness-[0.7] -z-10"
                    />
                  </div>
                  {/* Fondo cósmico claro para tema claro */}
                  <div className="light:block hidden">
                    <Image
                      src="/images/hero-bg.webp"
                      alt="Cosmic Background Light"
                      fill
                      priority
                      className="object-cover brightness-[1.2] saturate-75 -z-10"
                    />
                    <div className="absolute inset-0 bg-white/20 -z-10"></div>
                  </div>
                  <Navbar />
                  <main className="pt-36">{children}</main>
                  <Footer />
                </div>
              </QueryProvider>
            </ThemeProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
