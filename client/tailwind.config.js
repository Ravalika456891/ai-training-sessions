/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#0c2d6e',
          600: '#081e4a',
          700: '#051330',
          800: '#040e24',
          900: '#020817',
        },
        navy: {
          950: '#050814',
          900: '#0B132B',
          850: '#0F1A3A',
          800: '#1C2541',
          700: '#273456',
        },
        brand: {
          purple: '#7928CA',
          violet: '#8B5CF6',
          indigo: '#081e4a',
          blue: '#081e4a',
          cyan: '#06B6D4',
          accent: '#00F2FE',
        }
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.08) 40%, transparent 70%)',
        'card-glow': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(8, 30, 74, 0.04)',
        'xs': '0 1px 3px 0 rgba(8, 30, 74, 0.06), 0 1px 2px -1px rgba(8, 30, 74, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
        'accordion-up': 'accordion-up 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' },
        },
      }
    },
  },
  plugins: [],
}

