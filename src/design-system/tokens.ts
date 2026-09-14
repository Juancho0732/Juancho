/**
 * Design tokens — única fuente de verdad para estilos visuales.
 * No hardcodear colores, espaciados ni tipografías fuera de este archivo.
 * Identidad de marca "Parch Out". Paleta oficial confirmada por el equipo
 * (los hex impresos en el brand board estaban mal etiquetados: decodificaban
 * a verdes y beiges que no correspondían a los círculos mostrados):
 *
 *   rojo oscuro #73040D · rojo ladrillo #8F2622 · dorado #D9B006
 *   amarillo #F7CB34 · azul #83B5E6
 *
 * background/border son neutros de apoyo, no salen del board.
 */

export const colors = {
  background: '#FFF9F0',
  surface: '#EDF4FC',
  border: '#E4D9D2',

  textPrimary: '#2B0508',
  textSecondary: '#7A6A66',
  textInverse: '#FFFFFF',

  primary: '#73040D',
  primaryPressed: '#520309',
  onPrimary: '#FFFFFF',

  success: '#1E9E5A',
  warning: '#D9B006',
  danger: '#8F2622',

  rating: '#F7CB34',
  favorite: '#73040D',
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
