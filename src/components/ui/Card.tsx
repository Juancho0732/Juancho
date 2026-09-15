import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme } from '@/design-system/theme';

type Props = PropsWithChildren<ViewProps>;

export function Card({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.frame,
    ...theme.shadow.card,
  },
});
