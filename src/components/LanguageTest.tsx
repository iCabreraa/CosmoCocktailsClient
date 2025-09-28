"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageTest() {
  const { language, setLanguage, t, isInitialized } = useLanguage();

  // Hide widget in production UI; toggle via localStorage flag if needed
  if (typeof window !== "undefined") {
    const hidden = localStorage.getItem("cosmic-language-widget-hidden");
    if (hidden === "true") return null;
  }

  if (!isInitialized) {
    return (
      <div className="fixed top-4 right-4 bg-black/90 backdrop-blur-md rounded-lg p-4 border border-cosmic-gold/30 z-50">
        <div className="text-cosmic-gold text-sm font-bold mb-2">
          Loading Language...
        </div>
        <div className="animate-spin h-4 w-4 border-2 border-cosmic-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const testTranslations = [
    { key: "nav.shop", expected: { es: "Tienda", en: "Shop", nl: "Winkel" } },
    {
      key: "shop.all_cocktails",
      expected: {
        es: "Todos los Cócteles",
        en: "All Cocktails",
        nl: "Alle Cocktails",
      },
    },
    {
      key: "settings.title",
      expected: { es: "Configuración", en: "Settings", nl: "Instellingen" },
    },
    {
      key: "common.loading",
      expected: { es: "Cargando...", en: "Loading...", nl: "Laden..." },
    },
  ];

  return (
    <div className="fixed top-4 right-4 bg-black/90 backdrop-blur-md rounded-lg p-4 border border-cosmic-gold/30 z-[40] max-w-xs">
      <h3 className="text-cosmic-gold text-sm font-bold mb-2">
        Language Test ({language.toUpperCase()})
      </h3>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage("es")}
            className={`px-2 py-1 text-xs rounded ${
              language === "es"
                ? "bg-cosmic-gold text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-2 py-1 text-xs rounded ${
              language === "en"
                ? "bg-cosmic-gold text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("nl")}
            className={`px-2 py-1 text-xs rounded ${
              language === "nl"
                ? "bg-cosmic-gold text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            NL
          </button>
        </div>
        <div className="text-cosmic-silver text-xs space-y-1">
          {testTranslations.map((test, index) => {
            const translated = t(test.key);
            const expected = test.expected[language];
            const isCorrect = translated === expected;

            return (
              <div
                key={index}
                className={`flex items-center justify-between ${isCorrect ? "text-green-400" : "text-red-400"}`}
              >
                <span className="truncate">{test.key}:</span>
                <span className="ml-2 text-xs">
                  {isCorrect ? "✓" : "✗"} {translated}
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {t("shop.from_price", { price: "12.99" })}
        </div>
      </div>
    </div>
  );
}
