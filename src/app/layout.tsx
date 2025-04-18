import "@/styles/globals.css";
import { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
    <html lang="en" className="dark">
      <body
        className={`${unica.variable} ${josefin.variable} font-sans bg-cosmic-bg text-cosmic-text`}
      >
        {/* Fondo general para todo el sitio */}
        <div className="relative min-h-screen">
          <Image
            src="/images/hero-bg.webp"
            alt="Background"
            fill
            priority
            className="object-cover brightness-[0.7] -z-10"
          />
          <Navbar />
          <main className="pt-36">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
