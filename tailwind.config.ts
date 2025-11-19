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
        ink: {
          50: "#f6f7fb",
          100: "#eceef6",
          200: "#cfd5eb",
          300: "#aab4dc",
          400: "#7a87c8",
          500: "#5a67b1",
          600: "#454f8f",
          700: "#363d70",
          800: "#282d52",
          900: "#1b2038"
        },
        midnight: "#050c1f",
        "glass-light": "rgba(255,255,255,0.08)",
        "glass-dark": "rgba(16,24,40,0.75)",
        success: "#22c55e"
      },
      boxShadow: {
        glow: "0 0 35px rgba(59,130,246,0.35)",
        card: "0 10px 35px rgba(15,23,42,0.45)"
      },
      borderRadius: {
        lgx: "1.25rem",
        glass: "1.5rem"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle, rgba(59,130,246,0.5), transparent 70%)",
        "gradient-mesh":
          "linear-gradient(135deg,#667eea 0%,#764ba2 45%,#ec4899 100%), radial-gradient(circle at 20% 20%,rgba(255,255,255,0.1),transparent 60%)"
      },
      keyframes: {
        "progress-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        },
        "pulse-soft": {
          "0%,100%": { opacity: "0.35" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        "progress-shimmer": "progress-shimmer 3s ease infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite"
      }
    }
  },
  plugins: [
    tailwindAnimate,
    plugin(({ addUtilities }) => {
      addUtilities({
        ".glass-panel": {
          backgroundColor: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 15px 40px rgba(15,23,42,0.25)"
        }
      });
    })
  ]
};

export default config;
