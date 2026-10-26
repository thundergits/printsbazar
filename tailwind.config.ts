import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gold — primary brand accent (was orange)
        brand: {
          50:  "#fbf6e7",
          100: "#f6ecc9",
          200: "#ecd68e",
          300: "#dfbd5c",
          400: "#d4af37",
          500: "#c9a227",
          600: "#a8841c",
          700: "#866715",
          800: "#644d10",
          900: "#4a380c",
        },
        // Ink/charcoal — secondary dark accent (was maroon)
        maroon: {
          50:  "#f5f5f4",
          100: "#e7e5e4",
          200: "#d6d3d1",
          300: "#a8a29e",
          400: "#78716c",
          500: "#44403c",
          600: "#292524",
          700: "#1c1917",
          800: "#14110f",
          900: "#0a0908",
        },
        gold: {
          300: "#ecd68e",
          400: "#d4af37",
          500: "#c9a227",
          600: "#a8841c",
        },
        cream: {
          50:  "#faf8f3",
          100: "#f5f1e8",
          200: "#ede6d3",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #d4af37 0%, #1c1917 100%)",
        "gradient-warm":  "linear-gradient(180deg, #faf8f3 0%, #f5f1e8 100%)",
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(20,17,15,0.08)",
        "card-hover": "0 8px 32px 0 rgba(212,175,55,0.20)",
      },
    },
  },
  plugins: [],
};

export default config;
