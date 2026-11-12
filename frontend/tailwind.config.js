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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172b4d', // Dark Navy
        },
        navy: {
          DEFAULT: '#172B4D',
          dark: '#0e1b30',
          light: '#223d6b',
        },
        surface: '#FFFFFF',
        canvas: '#F8FAFC',
        textMain: '#0F172A',
        textMuted: '#64748B',
        borderMuted: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
