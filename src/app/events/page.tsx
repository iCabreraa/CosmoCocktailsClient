import EventsIntro from "@/components/events/EventsIntro";
import EventsSection from "@/components/events/EventsSection";

export const metadata = {
  title: "Events | CosmoCocktails",
  description: "Discover upcoming and past CosmoCocktails events",
};

export default function EventsPage() {
  return (
    <main className="flex flex-col space-y-20">
      <EventsIntro />
      <EventsSection />
    </main>
  );
}
