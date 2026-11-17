import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: "#00A86B",
        gold: "#D5B374",
        lime: "#A8D545",
        "deep-green": "#1C4A3B",
        champagne: "#FFF08A",
        black: "#000000",
        ink: "#171C19",
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
