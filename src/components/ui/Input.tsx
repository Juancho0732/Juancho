import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { theme } from '@/design-system/theme';

import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
};

export function Input({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="caption" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        // Prioridad 14 (accesibilidad): el label de arriba es solo un <Text>
        // visual, no está asociado al input para un lector de pantalla --
        // sin esto, VoiceOver/TalkBack anuncian el campo sin decir para qué
        // es. `rest` va después para que un accessibilityLabel explícito del
        // caller siga pudiendo pisar este default.
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
  },
  label: {
    marginLeft: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontSize: theme.typography.size.md,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
});
