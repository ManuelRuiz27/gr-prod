/**
 * Design Tokens — Plataforma GR
 * Central source of design constants for typography, colors, spacing, and elevation.
 */

export const colors = {
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
  surface: {
    bg: '#F8F9FA',
    bright: '#F8F9FF',
    lowest: '#FFFFFF',
    low: '#F1F4F9',
    card: '#FFFFFF',
    default: '#E8EDF5',
    high: '#DBE3F3',
    highest: '#CAD5E8',
    dim: '#D2DAEB',
    dark: '#141C28',
    darker: '#0B1019',
  },
  content: {
    primary: '#141C28',
    secondary: '#44474E',
    muted: '#75777F',
    subtle: '#A2A5AE',
    inverse: '#F8F9FF',
    inverseMuted: '#CAD5E8',
  },
  status: {
    success: '#1E8E3E',
    successBg: '#E6F4EA',
    warning: '#B76E00',
    warningBg: '#FEF7E0',
    error: '#9A2A2A',
    errorBg: '#FCE8E6',
    info: '#1A73E8',
    infoBg: '#E8F0FE',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"Playfair Display", serif',
    mono: '"JetBrains Mono", monospace',
  },
} as const;

export type ColorTheme = typeof colors;
