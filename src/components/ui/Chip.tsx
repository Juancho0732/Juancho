import { Pressable, StyleSheet } from 'react-native';

import { theme } from '@/design-system/theme';

import { Text } from './Text';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text variant="caption" color={selected ? 'onPrimary' : 'textPrimary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
