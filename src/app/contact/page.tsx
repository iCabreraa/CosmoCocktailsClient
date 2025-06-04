import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactIntro from "@/components/contact/ContactIntro";

export const metadata = {
  title: "Contact | CosmoCocktails",
  description: "Get in touch with CosmoCocktails for collaborations and events",
};

export default function ContactPage() {
  return (
    <main className="flex flex-col space-y-20">
      <ContactIntro />
      <ContactInfo />
      <ContactForm />
    </main>
  );
}
