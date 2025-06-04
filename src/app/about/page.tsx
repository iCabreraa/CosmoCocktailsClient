import AboutIntro from "../../components/about/AboutIntro";
import Benefits from "../../components/about/Benefits";
import HistoryValues from "../../components/about/HistoryValues";
import EventsSection from "../../components/about/EventsSection";
import TeamSection from "../../components/about/TeamSection";
import ContactBlock from "../../components/about/ContactBlock";

export const metadata = {
  title: "About | CosmoCocktails",
  description: "Learn more about CosmoCocktails and our mission",
};

export default function AboutPage() {
  return (
    <main className="flex flex-col space-y-20">
      <AboutIntro />
      <Benefits />
      <HistoryValues />
      <EventsSection />
      <TeamSection />
      <ContactBlock />
    </main>
  );
}
