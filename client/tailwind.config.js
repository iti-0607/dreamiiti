/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F0D',
          sidebar: '#101713',
          card: '#151C17',
          elevated: '#1B241E',
          surface: '#1B3024',
          border: '#27352C',
          text: '#F2F7F3',
          muted: '#98A69C',
        },
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        brand: {
          primary: '#39E58C',
          hover: '#26C978',
          surface: '#1B3024',
          border: '#27352C',
          glow: 'rgba(57, 229, 140, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(28, 30, 33, 0.05), 0 1px 3px 0 rgba(28, 30, 33, 0.03)',
        'card': '0 4px 20px -4px rgba(28, 30, 33, 0.07), 0 1px 2px 0 rgba(28, 30, 33, 0.03)',
        'elevated': '0 12px 30px -6px rgba(28, 30, 33, 0.12), 0 4px 6px -2px rgba(28, 30, 33, 0.04)',
        'inner-soft': 'inset 0 1px 3px 0 rgba(28, 30, 33, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gentle-pulse': 'gentlePulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
