import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { theme } from '@/design-system/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
};

export function Button({ label, variant = 'primary', disabled, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text
        variant="body"
        color={variant === 'primary' ? 'onPrimary' : 'primary'}
        style={styles.label}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.frame,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.frame,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: theme.typography.family.medium,
  },
});
