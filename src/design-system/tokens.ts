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
  /** Lienzo de la app: el azul de los paneles del board. */
  canvas: '#83B5E6',
  /** Superficie de contenido (tarjetas, hojas, inputs) sobre el lienzo. */
  background: '#FFF9F0',
  /** Superficie de acento: el amarillo del board (chips, botón secundario). */
  surface: '#F7CB34',
  /** Marco grueso en vino, el recurso gráfico que define el board. */
  frame: '#73040D',
  /** Borde neutro y sutil: divisores y estrellas vacías, no el marco de marca. */
  border: '#D8C9BE',

  textPrimary: '#2B0508',
  textSecondary: '#4A2B2B',
  textInverse: '#FFFFFF',

  primary: '#73040D',
  primaryPressed: '#520309',
  /** Amarillo sobre vino: el par que el board usa en el wordmark. */
  onPrimary: '#F7CB34',
  /** Estado inactivo sobre superficies vino (tab bar). */
  onPrimaryMuted: '#D3A6A0',

  success: '#1E9E5A',
  warning: '#D9B006',
  danger: '#8F2622',

  rating: '#F7CB34',
  favorite: '#73040D',
} as const;

export const borderWidth = {
  hairline: 1,
  thick: 2,
  chunky: 3,
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
  // Sombra dura y desplazada, no difuminada: el board apila formas planas con
  // un offset sólido detrás (el wordmark y la "P" del badge), no usa blur.
  card: {
    shadowColor: '#73040D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 0,
    elevation: 3,
  },
} as const;
