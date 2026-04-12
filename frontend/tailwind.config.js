/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f8f9fa",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface-variant": "#e1e3e4",
        primary: "#3525cd",
        "primary-container": "#4f46e5",
        secondary: "#58579b",
        "secondary-container": "#b6b4ff",
        tertiary: "#7e3000",
        "tertiary-container": "#a44100",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        outline: "#777587",
        "outline-variant": "#c7c4d8",
        "on-surface": "#191c1d",
        "on-surface-variant": "#464555",
        "on-primary": "#ffffff",
        "on-primary-container": "#dad7ff",
        "on-secondary-container": "#454386",
        "on-tertiary-container": "#ffd2be",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 20px 40px rgba(25, 28, 29, 0.04), 0 1px 3px rgba(25, 28, 29, 0.02)",
      },
      borderRadius: {
        fluid: "1rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)",
      },
    },
  },
  plugins: [],
};

