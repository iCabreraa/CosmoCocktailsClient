"use client";

import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ExperienceBlock from "@/components/landing/ExperienceBlock";
import FinalCTA from "@/components/landing/FinalCTA";
import TestAddToCartButton from "@/components/cart/TestAddToCartButton";

export default function Home() {
  return (
    <main className="relative flex flex-col space-y-40 px-4 md:px-8">
      <HeroSection />
      <HowItWorks />
      <ExperienceBlock />
      <FinalCTA />

      {/* BOTÓN DE PRUEBA - TEMPORAL */}
      <div className="flex justify-center py-8">
        <TestAddToCartButton />
      </div>
    </main>
  );
}
