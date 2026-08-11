import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { theme } from '@/design-system/theme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption';

type Props = RNTextProps & {
  variant?: Variant;
  color?: keyof typeof theme.colors;
};

export function Text({ variant = 'body', color = 'textPrimary', style, ...rest }: Props) {
  return <RNText style={[styles[variant], { color: theme.colors[color] }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
  },
  subtitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.medium,
  },
  body: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.regular,
  },
  caption: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.regular,
  },
});
