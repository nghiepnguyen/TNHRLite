/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        "on-primary": "#ffffff",
        "primary-container": "#E0E7FF",
        "on-primary-container": "#312E81",
        "secondary": "#475569",
        "on-secondary": "#ffffff",
        "secondary-container": "#F1F5F9",
        "on-secondary-container": "#1E293B",
        "tertiary": "#7C3AED",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#EDE9FE",
        "on-tertiary-container": "#4C1D95",
        "surface": "#FAF9F6",
        "on-surface": "#1A1C1A",
        "surface-variant": "#E2E8F0",
        "on-surface-variant": "#475569",
        "outline": "#94A3B8",
        "surface-container-low": "#F8FAFC",
        "surface-container": "#F1F5F9",
        "surface-container-high": "#E2E8F0",
        "surface-container-highest": "#CBD5E1",
        brand: {
          primary: '#4F46E5',
          'primary-container': '#E0E7FF',
          surface: '#FAF9F6',
          'surface-low': '#F8FAFC',
          'surface-lowest': '#ffffff',
          secondary: '#475569',
          'on-surface': '#1A1C1A',
        }
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        display: ['Be Vietnam Pro', 'sans-serif'],
        headline: ["Be Vietnam Pro", "sans-serif"],
        body: ["Be Vietnam Pro", "sans-serif"],
        label: ["Be Vietnam Pro", "sans-serif"]
      }
    },
  },
  plugins: [],
}
