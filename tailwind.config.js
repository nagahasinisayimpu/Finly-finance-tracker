/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        prussian: {
          50: '#e8eef5',
          100: '#c5d5e6',
          200: '#9ab8d3',
          300: '#6a96bd',
          400: '#3f73a3',
          500: '#2a5685',
          600: '#1d3f63',
          700: '#152e4a',
          800: '#0f2036',
          900: '#0a1828',
          950: '#060f1d',
        },
        accent: {
          income: '#34d399',
          expense: '#fb7185',
          gold: '#fbbf24',
          sky: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px -2px rgba(0,0,0,0.3), 0 1px 3px -1px rgba(0,0,0,0.2)',
        glow: '0 0 20px -4px rgba(56, 189, 248, 0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
