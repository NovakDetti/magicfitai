import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#F2F1EF",
          elevated: "#FFFFFF",
          dark: "#121214",
          darkElevated: "#17171A",
        },
        text: {
          primary: "#1F1F22",
          secondary: "#7A7A80",
          onDark: "#F2F2F2",
          onDarkSecondary: "#B7B7BE",
        },
        accent: {
          DEFAULT: "#B78C86",
          hover: "#A97872",
          dark: "#D0A19B",
          darkHover: "#C08E88",
        },
        neutral: {
          border: "#E0DDDA",
          divider: "#D2CFCC",
          borderDark: "#2A2A30",
          dividerDark: "#232328",
          tintWarm: "#EFE7E4",
        },
        glass: {
          light: "rgba(255,255,255,0.45)",
          dark: "rgba(23,23,26,0.55)",
          borderLight: "rgba(255,255,255,0.28)",
          borderDark: "rgba(255,255,255,0.10)",
        },
      },
      borderRadius: {
        xl: "16px",
        lg: "14px",
      },
      boxShadow: {
        glass: "0 20px 40px rgba(0,0,0,0.12)",
        glassDark: "0 18px 44px rgba(0,0,0,0.55)",
        cta: "0 10px 25px rgba(183,140,134,0.35)",
      },
      backdropBlur: {
        glass: "22px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(.2,.8,.2,1)",
        pop: "cubic-bezier(.16,1,.3,1)",
      },
      transitionDuration: {
        160: "160ms",
        260: "260ms",
        360: "360ms",
      },
    },
  },
  plugins: [],
} satisfies Config;
