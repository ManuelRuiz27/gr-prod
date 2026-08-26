/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System — Primary Navy Palette
        navy: {
          950: '#020d20',
          900: '#031636',
          800: '#0B1B3D',
          700: '#14254B',
          600: '#1A2B4C',
          500: '#2C416D',
          400: '#4E5E82',
          300: '#8293BA',
          200: '#B6C6F0',
          100: '#D8E2FF',
          50: '#E6EEFF',
        },

        // Design System — Gold / Amber Accent Palette
        gold: {
          900: '#3D2F00',
          800: '#574500',
          700: '#735C00',
          600: '#9E7E00',
          500: '#B8941F',
          400: '#D4AF37',
          300: '#E9C349',
          200: '#F4E5B8',
          100: '#FED65B',
          50: '#FFF8E6',
        },

        // Design System — Surface Containers & Backgrounds
        surface: {
          bg: '#F8F9FA',
          bright: '#F8F9FF',
          lowest: '#FFFFFF',
          low: '#F1F4F9',
          card: '#FFFFFF',
          DEFAULT: '#E8EDF5',
          high: '#DBE3F3',
          highest: '#CAD5E8',
          dim: '#D2DAEB',
          dark: '#141C28',
          darker: '#0B1019',
        },

        // Design System — Text & Content Contrast
        content: {
          primary: '#141C28',
          secondary: '#44474E',
          muted: '#75777F',
          subtle: '#A2A5AE',
          inverse: '#F8F9FF',
          'inverse-muted': '#CAD5E8',
        },

        // Semantic Status Colors
        status: {
          success: '#1E8E3E',
          'success-bg': '#E6F4EA',
          warning: '#B76E00',
          'warning-bg': '#FEF7E0',
          error: '#9A2A2A',
          'error-bg': '#FCE8E6',
          info: '#1A73E8',
          'info-bg': '#E8F0FE',
        },

        // Legacy / Dark Theme compatibility
        'premium-black': '#0A0A0A',
        'premium-charcoal': '#1A1A1A',
        'premium-silver': '#C0C0C0',
        'premium-platinum': '#E5E5E5',
        'premium-gold': '#D4AF37',
        'premium-gold-light': '#F4E5B8',
        'premium-gold-dark': '#B8941F',
        'success': '#2ECC71',
        'warning': '#F39C12',
        'error': '#E74C3C',
        'info': '#3498DB',
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'sans': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card-sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'card-md': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
        'floating': '0 12px 32px -4px rgba(3, 22, 54, 0.18)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.35)',
        'premium-sm': '0 2px 8px rgba(212, 175, 55, 0.1)',
        'premium-md': '0 4px 16px rgba(212, 175, 55, 0.15)',
        'premium-lg': '0 8px 32px rgba(212, 175, 55, 0.2)',
        'premium-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fadeInUp': 'fadeInUp 0.3s ease-out',
        'fadeIn': 'fadeIn 0.2s ease-out',
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.6)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212, 175, 55, 0)' },
        },
      },
    },
  },
  plugins: [],
}

