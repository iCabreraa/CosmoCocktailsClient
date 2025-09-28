export type FlavorProfile = {
  bitter: number;
  sweet: number;
  tropical: number;
  sour: number;
};

export const cocktailFlavorMap: Record<string, FlavorProfile> = {
  // Example static data; in real scenario this might come from the database
  "1": { bitter: 60, sweet: 30, tropical: 10, sour: 20 },
  "2": { bitter: 20, sweet: 70, tropical: 40, sour: 30 },
  "3": { bitter: 10, sweet: 40, tropical: 80, sour: 20 },
};

export type LocalizedDescription = {
  es?: string;
  en?: string;
  nl?: string;
};

export const cocktailDescriptions: Record<string, LocalizedDescription> = {
  "1": {
    en: "A tropical blend of vodka, peach schnapps, cranberry and orange.",
    es: "Una mezcla tropical de vodka, licor de melocotón, arándano y naranja.",
    nl: "Een tropische mix van wodka, perzikschnaps, veenbes en sinaasappel.",
  },
  "2": {
    en: "Vanilla vodka, passion fruit and a touch of prosecco.",
    es: "Vodka de vainilla, maracuyá y un toque de prosecco.",
    nl: "Vanillewodka, passievrucht en een vleugje prosecco.",
  },
  "3": {
    en: "Rum, kokosroom en ananassap — puro Caribe.",
    es: "Ron, crema de coco y zumo de piña — puro Caribe.",
    nl: "Rum, kokosroom en ananassap — puur Caribisch.",
  },
  "4": {
    en: "Refreshing gin with tonic water and citrus.",
    es: "Refrescante ginebra con tónica y cítricos.",
    nl: "Verfrissende gin met tonic en citrus.",
  },
};
