import es from "./es";
import en from "./en";
import nl from "./nl";

export const translations = { es, en, nl } as const;
export type Language = keyof typeof translations;
