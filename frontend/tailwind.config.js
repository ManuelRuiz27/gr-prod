/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System — Obsidian Background Palette
        obsidian: {
          950: '#08090A',
          900: '#0D0F11',
          850: '#12151A',
          800: '#14171A',
          750: '#1A1F26',
          700: '#20252C',
        },

        // Design System — Silver Metallic Palette
        silver: {
          50: '#F1F3F5',
          100: '#E3E6E8',
          200: '#D0D5DB',
          300: '#B7BDC3',
          400: '#9FA7B0',
          500: '#8A929B',
          600: '#6C747E',
          700: '#505861',
          800: '#3A414A',
          900: '#292F37',
        },

        // Design System — Gold Accent Palette
        gold: {
          100: '#F7EFCF',
          200: '#E8D49A',
          300: '#DEC889',
          400: '#D4AF37',
          500: '#C6A85B',
          600: '#AD9047',
          700: '#94772F',
          800: '#6D5728',
          900: '#47381A',
        },

        // Design System — Semantic Surfaces
        surface: {
          bg: '#08090A',
          base: '#0D0F11',
          raised: '#12151A',
          overlay: '#14171A',
          card: '#12151A',
          cardElevated: '#14171A',
          hover: '#20252C',
          dim: '#060708',
          // Compatibility fallbacks for existing screens
          lowest: '#0D0F11',
          low: '#12151A',
          DEFAULT: '#14171A',
          high: '#20252C',
          highest: '#3A414A',
          bright: '#F1F3F5',
        },

        // Design System — Content & Typography Contrast
        content: {
          primary: '#F1F3F5',
          secondary: '#B7BDC3',
          muted: '#8A929B',
          subtle: '#505861',
          inverse: '#08090A',
          'inverse-muted': '#292F37',
          gold: '#C6A85B',
        },

        // Semantic Functional Status Colors
        status: {
          success: '#4F9B73',
          'success-bg': 'rgba(79, 155, 115, 0.14)',
          warning: '#C28A36',
          'warning-bg': 'rgba(194, 138, 54, 0.14)',
          error: '#B85656',
          'error-bg': 'rgba(184, 86, 86, 0.14)',
          info: '#6E8FB8',
          'info-bg': 'rgba(110, 143, 184, 0.14)',
        },

        // Backward compatibility mappings
        'premium-black': '#08090A',
        'premium-charcoal': '#12151A',
        'premium-silver': '#B7BDC3',
        'premium-platinum': '#F1F3F5',
        'premium-gold': '#C6A85B',
        'premium-gold-light': '#DEC889',
        'premium-gold-dark': '#94772F',
      },
      fontFamily: {
        'display': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'sans': ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'card-sm': '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)',
        'card-md': '0 8px 24px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4)',
        'card-lg': '0 16px 32px rgba(0, 0, 0, 0.7), 0 4px 10px rgba(0, 0, 0, 0.4)',
        'floating': '0 16px 40px rgba(0, 0, 0, 0.7), 0 4px 12px rgba(0, 0, 0, 0.5)',
        'gold-glow': '0 0 20px rgba(198, 168, 91, 0.25)',
        'gold-focus': '0 0 0 3px rgba(198, 168, 91, 0.3)',
      },
      borderRadius: {
        'input': '12px',
        'button': '12px',
        'card': '20px',
        'modal': '24px',
        'drawer': '24px',
        'pill': '9999px',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fadeInUp': 'fadeInUp 0.22s cubic-bezier(0, 0, 0.2, 1)',
        'fadeIn': 'fadeIn 0.15s cubic-bezier(0, 0, 0.2, 1)',
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slideInRight': 'slideInRight 0.24s cubic-bezier(0, 0, 0.2, 1)',
        'slideInBottom': 'slideInBottom 0.24s cubic-bezier(0, 0, 0.2, 1)',
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
        slideInRight: {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' },
        },
        slideInBottom: {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(198, 168, 91, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(198, 168, 91, 0)' },
        },
      },
    },
  },
  plugins: [],
}
