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
        ivory: {
          50: '#FDFBF7',
          100: '#FBF9F5',
          200: '#F5F2EA',
          300: '#EFECE2',
          400: '#E7E2D5',
        },
        sage: {
          50: '#F2F7F4',
          100: '#E2EFE7',
          200: '#C7E0D2',
          300: '#A3CCB6',
          400: '#6FA88B',
          500: '#3B7A57',
          600: '#2E6F52',
          700: '#245942',
          800: '#1D4534',
          900: '#173629',
        },
        lavender: {
          50: '#F7F6FA',
          100: '#EFEBF5',
          200: '#DFD8EC',
          300: '#C5B9DF',
          400: '#A897CE',
          500: '#8E82B6',
          600: '#7B6FA1',
          700: '#645887',
          800: '#52476F',
        },
        amber: {
          50: '#FEFBF3',
          100: '#FDF5E3',
          200: '#FAE8C2',
          300: '#F5D496',
          400: '#EDB960',
          500: '#E5A93C',
          600: '#D97706',
          700: '#B45309',
        },
        charcoal: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E4E7EB',
          300: '#CBD0D6',
          400: '#8A92A0',
          500: '#5B6371',
          600: '#3C434F',
          700: '#2B303A',
          800: '#1F232B',
          900: '#14171D',
        }
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
