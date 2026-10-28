import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: "#009B4D",
        gold: "#D4AF37",
        lime: "#A3E635",
        "deep-green": "#006B3C",
        champagne: "#FFF2A6",
        ink: "#0A0A0A",
        cream: "#F7F7F5",
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        display: ["var(--font-editorial)"],
      },
      boxShadow: { luxury: "0 18px 60px rgba(10,10,10,.10)" },
    },
  },
  plugins: [],
};
export default config;
