import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { theme } from '@/design-system/theme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'display' | 'serif';

type Props = RNTextProps & {
  variant?: Variant;
  color?: keyof typeof theme.colors;
};

export function Text({ variant = 'body', color = 'textPrimary', style, ...rest }: Props) {
  return <RNText style={[styles[variant], { color: theme.colors[color] }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: {
    fontFamily: theme.typography.family.bold,
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
  },
  subtitle: {
    fontFamily: theme.typography.family.medium,
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.medium,
  },
  body: {
    fontFamily: theme.typography.family.regular,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.regular,
  },
  caption: {
    fontFamily: theme.typography.family.regular,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.regular,
  },
  // Wordmark de marca ("Parch Out"). Usar solo en momentos de marca, no en UI general.
  display: {
    fontFamily: theme.typography.family.display,
    fontSize: theme.typography.size.xxl,
  },
  // Acentos elegantes (tagline, nombres de lugar destacados). Evitar en párrafos largos.
  serif: {
    fontFamily: theme.typography.family.serifAccent,
    fontSize: theme.typography.size.md,
  },
});
