/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        cardBg: 'rgba(15, 23, 42, 0.45)',
        accentPurple: '#8B5CF6',
        accentCyan: '#06B6D4',
        accentGreen: '#10B981',
        accentRed: '#EF4444'
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-inner': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-glow': '0 0 15px 3px rgba(139, 92, 246, 0.15)'
      }
    },
  },
  plugins: [],
}
