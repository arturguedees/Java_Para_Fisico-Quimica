/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: '#f8fafc',
        surface: {
          DEFAULT: '#ffffff',
          elevated: '#f1f5f9',
          highlight: '#e2e8f0',
        },
        border: {
          DEFAULT: '#e2e8f0',
          light: '#cbd5e1',
          strong: '#94a3b8',
        },
        brand: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          subtle: '#eff6ff',
          text: '#1e40af',
        },
        accent: {
          emerald: '#10b981',
          cyan: '#0284c7',
          amber: '#f59e0b',
          rose: '#ef4444',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
