import { borderWidth, colors, radius, shadow, spacing, typography } from './tokens';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
  borderWidth,
} as const;

export type Theme = typeof theme;
