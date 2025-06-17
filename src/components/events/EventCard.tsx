"use client";

import Image from "next/image";

export type Event = {
  title: string;
  date: string;
  image: string;
  description: string;
};

type Props = {
  event: Event;
};

export default function EventCard({ event }: Props) {
  return (
    <div className="rounded-lg overflow-hidden border border-cosmic-gold/10 bg-white/5 backdrop-blur-sm hover:border-cosmic-gold/30 transition-transform hover:scale-105">
      <div className="relative w-full h-48 md:h-56">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-[--font-unica] text-cosmic-gold">
          {event.title}
        </h3>
        <p className="text-sm text-cosmic-silver italic">{event.date}</p>
        <p className="text-sm text-cosmic-text">{event.description}</p>
      </div>
    </div>
  );
}
