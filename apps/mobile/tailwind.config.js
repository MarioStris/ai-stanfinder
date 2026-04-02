/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        secondary: {
          DEFAULT: "#10B981",
          500: "#10B981",
          600: "#059669",
        },
        accent: {
          DEFAULT: "#F59E0B",
          500: "#F59E0B",
        },
        error: {
          DEFAULT: "#EF4444",
          500: "#EF4444",
        },
        text: {
          DEFAULT: "#111827",
          secondary: "#6B7280",
        },
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
