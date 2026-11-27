/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          950: '#14001c',
          900: '#1e0029',
          850: '#2b023b',
          800: '#38004d',
          700: '#52066d',
          600: '#730b99',
          500: '#a21caf',
          400: '#c026d3',
          300: '#d946ef',
          200: '#e879f9',
          100: '#f5d0fe',
          50: '#fdf4ff',
          gold: '#f59e0b',
          goldlight: '#fbbf24',
        }
      }
    },
  },
  plugins: [],
}
