import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0b", char: "#161618", graphite: "#232326", fog: "#9a9a9f",
        bone: "#efece6", silver: "#c4c7cc", burgundy: "#5a1a24",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: { wide2: "0.22em" },
    },
  },
  plugins: [],
};
export default config;
