import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: "#0B0F1C",
          sky: "#233047",
          fog: "#B3C2CC",
          light: "#F5F5F5",
          text: "#F4F3EF",
          gold: "#D1B87F",
          pink: "#B96B75",
          blue: "#2D8DAD",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["Inter", "sans-serif"],
        logo: ["'Major Mono Display'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
