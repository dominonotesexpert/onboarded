import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Inter", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "var(--font-mono)", "monospace"],
        display: ["Space Grotesk", "Outfit", "sans-serif"],
      },
      colors: {
        obsidian: "#050505",
        charcoal: "#0a0a0a",
        midnight: "#09090b", // Zinc 950
        surface: {
          50: "#18181b", // Zinc 900
          100: "#27272a", // Zinc 800
          200: "#3f3f46", // Zinc 700
          300: "#52525b", // Zinc 600
        },
        neon: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          pink: "#ec4899",
          cyan: "#06b6d4",
          emerald: "#10b981",
        },
        "glass-light": "rgba(255,255,255,0.05)",
        "glass-medium": "rgba(255,255,255,0.1)",
        "glass-heavy": "rgba(255,255,255,0.2)",
        "glass-border": "rgba(255,255,255,0.08)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(59,130,246,0.5)",
        "glow-sm": "0 0 10px rgba(59,130,246,0.3)",
        "glow-lg": "0 0 40px rgba(59,130,246,0.4)",
        card: "0 8px 32px rgba(0,0,0,0.4)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        lgx: "1.25rem",
        glass: "1.5rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle, var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "conic-gradient(from 90deg at 50% 50%, #00000000 50%, #000 50%), radial-gradient(rgba(200,200,200,0.1) 0%, transparent 80%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(59,130,246,0.5)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 10px rgba(59,130,246,0.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
        "slide-up": "slide-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [
    tailwindAnimate,
    plugin(({ addUtilities }) => {
      addUtilities({
        ".glass-panel": {
          backgroundColor: "rgba(10, 10, 10, 0.6)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
        },
        ".text-glow": {
          textShadow: "0 0 20px rgba(255,255,255,0.3)",
        },
      });
    }),
  ],
};

export default config;
