import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/design-system/theme';

import { Text } from './Text';

const STARS = [1, 2, 3, 4, 5] as const;

type Props = {
  value: number;
  /** Si se omite, el componente queda de solo lectura (para mostrar un rating). */
  onChange?: (value: number) => void;
  size?: number;
};

export function StarRating({ value, onChange, size = 24 }: Props) {
  return (
    <View style={styles.row}>
      {STARS.map((star) => (
        <Pressable
          key={star}
          disabled={!onChange}
          onPress={() => onChange?.(star)}
          hitSlop={4}
          accessibilityRole={onChange ? 'button' : undefined}
          accessibilityLabel={`${star} estrella${star > 1 ? 's' : ''}`}
        >
          <Text style={{ fontSize: size, color: star <= value ? theme.colors.rating : theme.colors.border }}>
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
});
