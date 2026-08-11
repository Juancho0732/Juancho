/**
 * Design tokens — única fuente de verdad para estilos visuales.
 * No hardcodear colores, espaciados ni tipografías fuera de este archivo.
 * Sistema neutro (sin identidad de marca todavía, ver docs/00-fase0-analisis.md §10).
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#F7F7F8',
  border: '#E5E5EA',

  textPrimary: '#111114',
  textSecondary: '#6B6B72',
  textInverse: '#FFFFFF',

  primary: '#2E2EE0',
  primaryPressed: '#2424B8',
  onPrimary: '#FFFFFF',

  success: '#1E9E5A',
  warning: '#C77A00',
  danger: '#D3392E',

  rating: '#F5A623',
  favorite: '#E0294F',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  family: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
