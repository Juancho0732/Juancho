import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import type { PlaceListItem } from '@/types/database';
import { formatDistance, formatPriceRange } from '@/utils/format';

type Props = {
  // Acepta cualquier lugar que traiga al menos estas columnas -- un `Place`
  // completo (detalle) también sirve, PlaceCard nunca usó el resto de sus
  // campos (Prioridad 13).
  place: PlaceListItem;
  categoryName?: string;
  /** En metros, si se conoce la ubicación del usuario (Fase 5). */
  distanceMeters?: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
};

export function PlaceCard({
  place,
  categoryName,
  distanceMeters,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" testID={`place-card-${place.id}`}>
      <Card style={styles.card}>
        <View style={styles.thumbnail}>
          <Text variant="title" color="textInverse">
            {place.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text variant="subtitle" numberOfLines={1} style={styles.name}>
              {place.name}
            </Text>
            <Pressable
              onPress={onToggleFavorite}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <Text variant="subtitle" color={isFavorite ? 'favorite' : 'textSecondary'}>
                {isFavorite ? '♥' : '♡'}
              </Text>
            </Pressable>
          </View>

          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {[
              distanceMeters !== undefined ? formatDistance(distanceMeters) : null,
              place.locality,
              categoryName,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>

          <View style={styles.metaRow}>
            <Text variant="caption" color="textSecondary">
              {formatPriceRange(place.price_min, place.price_max)}
            </Text>
            {place.review_count > 0 ? (
              <Text variant="caption" color="textSecondary">
                {`★ ${place.rating_avg.toFixed(1)} (${place.review_count})`}
              </Text>
            ) : (
              <Text variant="caption" color="textSecondary">
                Sin reseñas todavía
              </Text>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  name: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
