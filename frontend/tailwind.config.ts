import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090D14",
        surface: {
          DEFAULT: "#0F1626",
          glass: "rgba(18, 24, 38, 0.75)",
          hover: "rgba(28, 38, 58, 0.8)",
          card: "#121A2D",
          border: "rgba(255, 255, 255, 0.08)",
        },
        primary: {
          DEFAULT: "#10B981",
          hover: "#059669",
          dark: "#047857",
          glow: "rgba(16, 185, 129, 0.25)",
        },
        accent: {
          amber: "#F59E0B",
          teal: "#14B8A6",
          blue: "#3B82F6",
          purple: "#8B5CF6",
        },
        muted: {
          DEFAULT: "#94A3B8",
          foreground: "#64748B",
          dark: "#334155",
        },
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      backdropBlur: {
        "xs": "2px",
        "2xl": "32px",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-glow": "0 0 40px -10px rgba(16, 185, 129, 0.2)",
        "card": "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
