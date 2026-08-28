import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FCFAF7",
          100: "#FAF8F5",
          200: "#F5EFE6",
          300: "#EFE6D8",
          400: "#E5D7C2",
        },
        maroon: {
          50: "#F9ECEF",
          100: "#F2D2D8",
          600: "#751B30",
          700: "#5C1324",
          800: "#4A0E1C",
          900: "#380914",
          950: "#24040C",
        },
        gold: {
          50: "#FAF6EC",
          100: "#F3EBD3",
          200: "#E8DFC8",
          300: "#DCD0B5",
          400: "#D4AF37",
          500: "#C5A059",
          600: "#B38E46",
          700: "#997530",
          800: "#7A5C22",
        },
        charcoal: {
          50: "#F7F6F5",
          100: "#ECEAE8",
          500: "#8C827A",
          600: "#6B635B",
          700: "#453E3A",
          800: "#261B17",
          900: "#1F1D1D",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(38, 27, 23, 0.08)",
        "card-hover": "0 12px 32px rgba(38, 27, 23, 0.14)",
        header: "0 4px 20px rgba(38, 27, 23, 0.06)",
        modal: "0 20px 48px rgba(38, 27, 23, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
