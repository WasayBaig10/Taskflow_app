import { Julius_Sans_One } from "next/font/google";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        geist: ["var(--font-geist)", "system-ui", "sans-serif"],
        brand: ["var(--font-comfortaa)", "cursive"],
        comfortaa: ["var(--font-comfortaaa)", "light"],
        lobster_two: ["var(--font-lobster_two)", "cursive"],
        julius_sans_one: ["var(--font-julius_sans_one)", "sans-serif"],
      },
      colors: {
        obsidian: {
          950: "#0a0a0b",
          900: "#0c0c0e",
          850: "#0e0e11",
          800: "#111115",
          750: "#141418",
        },
        priority: {
          low: "#39ff14", // Neon Green
          medium: "#ff8c00", // Electric Orange
          high: "#dc143c", // Crimson
        },
        glass: {
          border: "rgba(255, 255, 255, 0.06)",
          bg: "rgba(255, 255, 255, 0.03)",
          hover: "rgba(255, 255, 255, 0.06)",
        },
      },
      backgroundImage: {
        "obsidian-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        "glow-sm": "0 0 10px rgba(255, 255, 255, 0.1)",
        "glow-md": "0 0 20px rgba(255, 255, 255, 0.15)",
        "glow-lg": "0 0 30px rgba(255, 255, 255, 0.2)",
        "neon-green": "0 0 10px rgba(57, 255, 20, 0.5)",
        "neon-orange": "0 0 10px rgba(255, 140, 0, 0.5)",
        "neon-red": "0 0 10px rgba(220, 20, 60, 0.5)",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
