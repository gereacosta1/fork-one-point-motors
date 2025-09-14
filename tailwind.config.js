/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#39ff14', // verde neón
          hover:   '#20d90a', // hover
          50:  '#ecffe6',
          100: '#d6ffc9',
          200: '#aaff8e',
          300: '#7cff55',
          400: '#53ff2c',
          500: '#39ff14',
          600: '#20d90a',
          700: '#17b108',
          800: '#118606',
          900: '#0a5c04',
        },
      },
    },
  },
  plugins: [],
};
