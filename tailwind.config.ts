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
        brand: {
          50: "#F4F8EC",
          100: "#E6F0D6",
          200: "#CEE2AE",
          300: "#B3D382",
          400: "#94C255",
          500: "#71A832", // Primary green: #71A832
          600: "#5B8A26", // Hover green: #5B8A26
          700: "#45691C",
          800: "#324C15",
          900: "#1E2E0D",
        },
        ivory: {
          DEFAULT: "#FFFFF0", // Ivory background: #FFFFF0
          50: "#FFFFFA",
          100: "#FFFFF0",
          200: "#FAF9E5",
          300: "#F4F3D6",
          400: "#EAE8BF",
          500: "#DDD9A3",
        },
        charcoal: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937", // Primary text: dark charcoal
          900: "#111827",
          950: "#0B0F17",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
