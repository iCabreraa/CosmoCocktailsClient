import Link from "next/link";

export const metadata = {
  title: "CosmoCocktails Quiz",
  description: "Encuentra tu cóctel ideal con nuestro quiz.",
};

export default function QuizPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-6 px-6 py-16 text-center text-white">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">Cocktail Quiz</h1>
        <p className="text-base text-cosmic-silver">
          Estamos preparando el quiz para recomendarte el cóctel perfecto.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-cosmic-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-cosmic-gold/85"
        >
          Ir a la tienda
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 transition hover:text-white hover:border-white/40"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
