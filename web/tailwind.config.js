/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#00d9ff', // Cyan primary
          600: '#00b8d9',
          700: '#0097b3',
          800: '#00768c',
          900: '#005566',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#9d00ff', // Purple secondary
          600: '#8400d9',
          700: '#6b00b3',
          800: '#52008c',
          900: '#390066',
        },
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#ff006e', // Magenta accent
          600: '#d9005c',
          700: '#b3004a',
          800: '#8c0038',
          900: '#660026',
        },
        spotlight: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#ff1744', // Red spotlight
          600: '#d91239',
          700: '#b30e2e',
          800: '#8c0a23',
          900: '#660718',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#ffd700', // Gold tier
          600: '#d9b600',
          700: '#b39500',
          800: '#8c7400',
          900: '#665300',
        },
        // Tier Colors
        bronze: '#cd7f32',
        silver: '#c0c0c0',
        platinum: '#e5e4e2',
        // Emotional State Gradients (for use in gradient classes)
        'building-start': '#9d00ff',
        'building-end': '#00d9ff',
        'peak-start': '#ff006e',
        'peak-end': '#ffbe0b',
        'intimate-start': '#ff1744',
        'intimate-end': '#ff6f00',
        'cooldown-start': '#02f2e2',
        'cooldown-end': '#80deea',
      },
      backgroundImage: {
        // Emotional State Gradients
        'gradient-building': 'linear-gradient(135deg, #9d00ff 0%, #00d9ff 100%)',
        'gradient-peak': 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
        'gradient-intimate': 'linear-gradient(135deg, #ff1744 0%, #ff6f00 100%)',
        'gradient-cooldown': 'linear-gradient(135deg, #02f2e2 0%, #80deea 100%)',
        'gradient-euphoria': 'linear-gradient(135deg, #ff0080 0%, #ff8c00 16.67%, #ffd700 33.33%, #00ff00 50%, #00bfff 66.67%, #8a2be2 100%)',
        // Tier Gradients
        'gradient-bronze': 'linear-gradient(135deg, #cd7f32 0%, #e8a05c 100%)',
        'gradient-silver': 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)',
        'gradient-gold': 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
        'gradient-platinum': 'linear-gradient(135deg, #e5e4e2 0%, #ffffff 50%, #e5e4e2 100%)',
        // Glass morphism
        'glass-dark': 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
        'glass-light': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(157, 0, 255, 0.5)',
        'glow-magenta': '0 0 20px rgba(255, 0, 110, 0.5)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.5)',
        'glow-spotlight': '0 0 20px rgba(255, 23, 68, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 40px 120px rgba(15, 23, 42, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'fade-out': 'fadeOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'confetti': 'confetti 3s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(1000px) rotate(720deg)', opacity: '0' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  plugins: [],
}
