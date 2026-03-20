/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0b3c5d',
          light: '#145374',
          dark: '#082f45',
        },
        secondary: {
          DEFAULT: '#b5894d',
          light: '#c99a5b',
          dark: '#8b6b3f',
        },
        background: {
          light: '#f6f3ee',
          dark: '#0b1f36',
          card: '#ffffff',
        },
        success: '#1b9e77',
        warning: '#c95f17',
        danger: '#b42318',
        error: '#ef4444',
        info: '#2f6f6d',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', '"Noto Kufi Arabic"', 'sans-serif'],
        display: ['"Libre Baskerville"', '"Noto Kufi Arabic"', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(to right, #0b3c5d, #b5894d)',
      },
      boxShadow: {
        'glass': '0 12px 30px rgba(11, 31, 54, 0.08)',
        'glass-hover': '0 16px 40px rgba(11, 31, 54, 0.12)',
        'neon-primary': '0 0 14px rgba(11, 60, 93, 0.25)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
