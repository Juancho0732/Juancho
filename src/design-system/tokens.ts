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

/**
 * Tema oscuro construido sobre el vino de la marca. Invertir el fondo obliga a
 * invertir la jerarquía entera: el texto pasa a crema y las acciones pasan al
 * amarillo del board, porque un botón vino sobre fondo vino no se ve. Los
 * semánticos (danger/success) van en versión clara por la misma razón: el
 * ladrillo #8F2622 sobre vino es prácticamente invisible.
 */
export const colors = {
  /** Lienzo de la app: el vino oficial bajado, para que las tarjetas resalten. */
  canvas: '#5E0309',
  /** Superficie de contenido (tarjetas, hojas, diálogos): el vino oficial. */
  background: '#73040D',
  /** Superficie elevada: chips sin seleccionar y botón secundario. */
  surface: '#8A1017',
  /** Marco grueso en dorado: sobre vino, un marco vino no separa nada. */
  frame: '#D9B006',
  /** Borde sutil: divisores y estrellas vacías, no el marco de marca. */
  border: '#B8837A',
  /** El azul del board, como acento puntual (miniaturas de lugar). */
  accent: '#83B5E6',

  textPrimary: '#FFF3E2',
  textSecondary: '#E8C4B0',
  /** Texto oscuro, para cuando el fondo es claro (amarillo, crema del Toast). */
  textInverse: '#2B0508',

  primary: '#F7CB34',
  primaryPressed: '#D9B006',
  /** Vino sobre amarillo: el par del wordmark, ahora al revés. */
  onPrimary: '#73040D',
  /** Estado inactivo sobre superficies vino (tab bar). */
  onPrimaryMuted: '#B9857C',

  success: '#7ED9A0',
  warning: '#F0C419',
  danger: '#F2A093',

  rating: '#F7CB34',
  favorite: '#F7CB34',
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
    // Casi negro, no vino: sobre un lienzo vino una sombra vino no se ve.
    shadowColor: '#2B0508',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
    elevation: 3,
  },
} as const;
