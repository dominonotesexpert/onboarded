import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["Fira Code", "var(--font-mono)", "monospace"]
      },
      colors: {
        // Deep, rich background tones
        midnight: "#02040a", // Darker, more premium black/blue
        surface: {
          50: "#12141c",
          100: "#1a1d26",
          200: "#222632",
          300: "#2d3242",
          400: "#3e4559",
          500: "#565f7a",
          600: "#737d96",
          700: "#949cb0",
          800: "#b8becd",
          900: "#dce0eb"
        },
        // Vibrant accents
        primary: {
          DEFAULT: "#3b82f6",
          glow: "#60a5fa"
        },
        accent: {
          purple: "#8b5cf6",
          pink: "#ec4899",
          cyan: "#06b6d4"
        },
        glass: {
          light: "rgba(255,255,255,0.03)",
          medium: "rgba(255,255,255,0.07)",
          heavy: "rgba(255,255,255,0.12)",
          border: "rgba(255,255,255,0.08)"
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 20px rgba(59,130,246,0.5)",
        "glow-sm": "0 0 10px rgba(59,130,246,0.3)",
        "glow-lg": "0 0 40px rgba(59,130,246,0.4)",
        card: "0 8px 32px rgba(0,0,0,0.4)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.6)"
      },
      borderRadius: {
        lgx: "1.25rem",
        glass: "1.5rem"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle, var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at 50% -20%, rgba(59,130,246,0.15), transparent 70%)"
      },
      keyframes: {
        "progress-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        },
        "pulse-soft": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        "progress-shimmer": "progress-shimmer 3s ease infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: [
    tailwindAnimate,
    plugin(({ addUtilities }) => {
      addUtilities({
        ".glass-panel": {
          backgroundColor: "rgba(20, 20, 25, 0.6)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
        },
        ".text-glow": {
          textShadow: "0 0 10px rgba(255,255,255,0.3)"
        }
      });
    })
  ]
};

export default config;
