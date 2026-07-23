/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#3b66ff',
          600: '#2545eb',
          700: '#1b32d6',
          800: '#1729ad',
          900: '#17268a',
          950: '#0e1452',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
