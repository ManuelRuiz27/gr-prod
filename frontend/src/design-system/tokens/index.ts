/**
 * Design Tokens — Plataforma GR
 * Baseline Visual 1.2
 * Central source of truth for design constants: colors, typography, spacing, elevation, radius, motion.
 */

export const colors = {
  // Background & Surfaces: Obsidian Palette
  obsidian: {
    950: '#08090A', // Root deep background
    900: '#0D0F11', // Primary dark background
    850: '#12151A', // Standard cards and elevated surfaces
    800: '#14171A', // Higher elevation containers
    750: '#1A1F26', // Hover / neutral selected state
    700: '#20252C', // Interactive borders / subtle elevated
  },

  // Typography & Structural Borders: Silver Metallic Palette
  silver: {
    50: '#F1F3F5', // Primary high-contrast text
    100: '#E3E6E8', // Secondary headings
    200: '#D0D5DB', // Neutral light silver
    300: '#B7BDC3', // Secondary body text / metallic icons
    400: '#9FA7B0', // Supporting text
    500: '#8A929B', // Muted text / placeholders
    600: '#6C747E', // Dark silver
    700: '#505861', // Strong borders / subtle dividers
    800: '#3A414A', // Container borders
    900: '#292F37', // Deep borders / surface outlines
  },

  // Accent & Celebration: Gold Palette (Reserved for CTA, focus, milestones)
  gold: {
    100: '#F7EFCF', // Lightest gold highlight
    200: '#E8D49A', // Soft gold highlight
    300: '#DEC889', // Hover / light accent
    400: '#D4AF37', // Classic metallic gold
    500: '#C6A85B', // Official primary accent
    600: '#AD9047', // Pressed / strong accent
    700: '#94772F', // Tonal dark gold / subtle badges
    800: '#6D5728', // Deep gold border
    900: '#47381A', // Deep tonal surface
  },

  // Semantic & Functional Status Colors
  status: {
    success: '#4F9B73',
    successBg: 'rgba(79, 155, 115, 0.14)',
    successBorder: 'rgba(79, 155, 115, 0.28)',
    warning: '#C28A36',
    warningBg: 'rgba(194, 138, 54, 0.14)',
    warningBorder: 'rgba(194, 138, 54, 0.28)',
    error: '#B85656',
    errorBg: 'rgba(184, 86, 86, 0.14)',
    errorBorder: 'rgba(184, 86, 86, 0.28)',
    info: '#6E8FB8',
    infoBg: 'rgba(110, 143, 184, 0.14)',
    infoBorder: 'rgba(110, 143, 184, 0.28)',
  },

  // Semantic Surface Mappings
  surface: {
    bg: '#08090A',
    base: '#0D0F11',
    raised: '#12151A',
    overlay: '#14171A',
    card: '#12151A',
    cardElevated: '#14171A',
    hover: '#20252C',
    dim: '#060708',
  },

  // Semantic Content / Text Mappings
  content: {
    primary: '#F1F3F5',
    secondary: '#B7BDC3',
    muted: '#8A929B',
    subtle: '#505861',
    inverse: '#08090A',
    inverseMuted: '#292F37',
    gold: '#C6A85B',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
    mono: '"JetBrains Mono", monospace',
  },
  fontSize: {
    display: { desktop: '40px', mobile: '32px' },
    h1: { desktop: '32px', mobile: '28px' },
    h2: { desktop: '24px', mobile: '22px' },
    h3: { desktop: '20px', mobile: '18px' },
    bodyL: '18px',
    body: '16px',
    bodyS: '14px',
    caption: '12px',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
} as const;

export const radius = {
  input: '12px',
  button: '12px',
  card: '20px',
  modal: '24px',
  drawer: '24px',
  pill: '9999px',
} as const;

export const motion = {
  duration: {
    fast: '150ms',
    normal: '220ms',
    overlay: '300ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

export type ColorTheme = typeof colors;
