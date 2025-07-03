"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import Link from "next/link";

const featuredCocktails = [
  {
    title: "Tropical Delights",
    description: "Taste summer in every sip. Explore our tropical cocktails.",
    image: "/images/featured/tropical.webp",
    href: "/shop",
  },
  {
    title: "Cosmic Classics",
    description: "Legendary recipes, now bottled for your events.",
    image: "/images/featured/classics.webp",
    href: "/shop",
  },
  {
    title: "Non-Alcoholic Magic",
    description: "Cocktails that impress — without the alcohol.",
    image: "/images/featured/nonalcoholic.webp",
    href: "/shop",
  },
];

export default function FeaturedBanner() {
  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-[url('/images/hero-bg.webp')] bg-cover bg-center border border-cosmic-gold/20">
      {" "}
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="h-[400px] md:h-[550px]"
      >
        {featuredCocktails.map((cocktail, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              <Image
                src={cocktail.image}
                alt={cocktail.title}
                fill
                className="object-cover brightness-75"
                priority={index === 0}
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                <h2 className="text-4xl md:text-5xl font-[--font-unica] text-white mb-4 drop-shadow-lg">
                  {cocktail.title}
                </h2>
                <p className="text-lg md:text-xl text-cosmic-silver mb-6 max-w-2xl drop-shadow">
                  {cocktail.description}
                </p>
                <Link
                  href={cocktail.href}
                  className="px-6 py-3 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition-all duration-300 font-[--font-josefin]"
                >
                  Explore now
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
