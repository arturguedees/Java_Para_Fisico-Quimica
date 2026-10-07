/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', '"Newsreader"', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0a0b0d',
          900: '#0e1013',
          850: '#14161b',
          800: '#1d2027',
          700: '#2b303b',
          600: '#3e4452',
        },
        sand: {
          50: '#fdfcf9',
          100: '#f5f2eb',
          200: '#e5e2dc',
          300: '#c5bfb4',
          400: '#918b7e',
          500: '#5e594d',
        },
        copper: {
          300: '#f09673',
          400: '#e0734a',
          500: '#c85a32',
          600: '#a74521',
          700: '#853416',
          900: '#3d1a0e',
          950: '#240d06',
        },
        sage: {
          300: '#9ebd9c',
          400: '#759972',
          500: '#52754f',
          900: '#162b14',
        }
      }
    },
  },
  plugins: [],
}
