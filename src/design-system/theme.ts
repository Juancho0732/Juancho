import { colors, radius, shadow, spacing, typography } from './tokens';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
} as const;

export type Theme = typeof theme;
