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
        canvas: '#090d16',
        surface: {
          DEFAULT: '#111827',
          elevated: '#1a2234',
          highlight: '#242f46',
        },
        border: {
          DEFAULT: '#2a3449',
          light: '#3d4b66',
        },
        brand: {
          DEFAULT: '#ea580c',
          hover: '#c2410c',
          subtle: '#ea580c1a',
        },
        accent: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      }
    },
  },
  plugins: [],
}
