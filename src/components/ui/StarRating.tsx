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
  // Prioridad 14 (accesibilidad): de solo lectura (sin onChange, ej. mostrar
  // el rating de un lugar) es una sola pieza de información, no 5 controles
  // -- se agrupa en un solo elemento accesible con un resumen ("4 de 5
  // estrellas") en vez de 5 paradas de lector de pantalla anunciando cada
  // estrella por separado. Editable (con onChange, el selector del
  // formulario de reseña) sigue siendo 5 botones individuales, ahí sí hace
  // falta elegir una estrella puntual.
  if (!onChange) {
    return (
      <View style={styles.row} accessible accessibilityLabel={`${value} de 5 estrellas`}>
        {STARS.map((star) => (
          <Text
            key={star}
            importantForAccessibility="no-hide-descendants"
            style={{ fontSize: size, color: star <= value ? theme.colors.rating : theme.colors.border }}
          >
            ★
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {STARS.map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          hitSlop={4}
          accessibilityRole="button"
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
