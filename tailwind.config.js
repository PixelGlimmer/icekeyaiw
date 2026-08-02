/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ice: {
          deep: '#0A0F1E',
          night: '#0B1121',
          panel: '#0D1426',
          blue: '#00E5FF',
          teal: '#2DD4BF',
          frost: '#7DD3FC',
          muted: '#7E8BAA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(0,229,255,0.45), 0 0 60px -20px rgba(45,212,191,0.35)',
        'glow-sm': '0 0 12px -2px rgba(0,229,255,0.4)',
      },
    },
  },
  plugins: [],
};
