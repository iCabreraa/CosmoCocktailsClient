"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/landing/HeroSection";

const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks"), {
  ssr: true,
  loading: () => (
    <div className="h-64 md:h-80 w-full animate-pulse bg-cosmic-silver/10 rounded-xl" />
  ),
});

const ExperienceBlock = dynamic(
  () => import("@/components/landing/ExperienceBlock"),
  {
    ssr: true,
    loading: () => (
      <div className="h-72 md:h-96 w-full animate-pulse bg-cosmic-silver/10 rounded-xl" />
    ),
  }
);

const FinalCTA = dynamic(() => import("@/components/landing/FinalCTA"), {
  ssr: true,
  loading: () => (
    <div className="h-56 md:h-72 w-full animate-pulse bg-cosmic-silver/10 rounded-xl" />
  ),
});

export default function Home() {
  return (
    <main className="relative flex flex-col space-y-40 px-4 md:px-8">
      <HeroSection />
      <HowItWorks />
      <ExperienceBlock />
      <FinalCTA />
    </main>
  );
}
