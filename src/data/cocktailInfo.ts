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
