/**
 * Design tokens — única fuente de verdad para estilos visuales.
 * No hardcodear colores, espaciados ni tipografías fuera de este archivo.
 * Identidad de marca "Parch Out" (brand board del 2026-09-14). Los hex de
 * este archivo son una lectura visual del board hecha a mano — el board
 * traía los hex mal etiquetados (no correspondían a los círculos), así que
 * si en algún momento se consigue la paleta exacta del diseñador, reemplazar
 * estos valores.
 */

export const colors = {
  background: '#FFF9F0',
  surface: '#EFF7FC',
  border: '#E4D9D2',

  textPrimary: '#2A0E14',
  textSecondary: '#7A6A66',
  textInverse: '#FFFFFF',

  primary: '#6E1423',
  primaryPressed: '#4E0E19',
  onPrimary: '#FFFFFF',

  success: '#1E9E5A',
  warning: '#A8841F',
  danger: '#B03A2E',

  rating: '#F5C518',
  favorite: '#6E1423',
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
    // UI/cuerpo — sustituto libre (Google Fonts) de "Telegraf" del brand board.
    regular: 'FamiljenGrotesk_400Regular',
    medium: 'FamiljenGrotesk_500Medium',
    bold: 'FamiljenGrotesk_700Bold',
    // Wordmark "Parch Out" — sustituto libre de "Funky Bird". Uso limitado a
    // momentos de marca (splash, onboarding), no para texto de UI general.
    display: 'BagelFatOne_400Regular',
    // Acentos elegantes (tagline, nombres de lugar destacados) — sustituto
    // libre de "Bauer Bodoni Condensed". No usar para párrafos largos: un
    // Didone se lee mal en tamaños chicos.
    serifAccent: 'BodoniModa_400Regular',
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
