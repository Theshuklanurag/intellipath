/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        syne: ["'Syne'", "sans-serif"],
        outfit: ["'Outfit'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        neural: {
          50:  '#F0F2FF',
          100: '#C8CCFF',
          200: '#8B9AC4',
          300: '#4A5275',
          400: '#1C1F2E',
          500: '#161820',
          600: '#141620',
          700: '#0F1117',
          800: '#0D0F1A',
          900: '#0A0B0F',
        },
        cyan: { DEFAULT: '#00D4FF', dim: 'rgba(0,212,255,0.15)' },
        ngreen: { DEFAULT: '#00FF88', dim: 'rgba(0,255,136,0.12)' },
        namber: { DEFAULT: '#FFB800', dim: 'rgba(255,184,0,0.12)' },
        npink: { DEFAULT: '#FF006E', dim: 'rgba(255,0,110,0.12)' },
        npurple: { DEFAULT: '#9B59FF', dim: 'rgba(155,89,255,0.12)' },
        nred: { DEFAULT: '#FF4D6A', dim: 'rgba(255,77,106,0.12)' },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'bgShift 15s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'neon': 'neonPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-18px)' } },
      },
    },
  },
  plugins: [],
}