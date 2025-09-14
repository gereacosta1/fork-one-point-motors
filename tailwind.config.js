/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff6b00",   // naranja principal
          hover:   "#e85d00",   // hover
          50:  "#fff3e8",
          100: "#ffe7d1",
          200: "#ffc9a3",
          300: "#ffab75",
          400: "#ff8d47",
          500: "#ff6b00",
          600: "#e85d00",
          700: "#bf4b00",
          800: "#963c00",
          900: "#6e2c00",
        },
      },
    },
  },
  plugins: [],
};
