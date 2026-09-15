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
    // Prioridad 14 (accesibilidad): "link" en vez de "button" -- semánticamente
    // es más correcto (tocar la tarjeta navega al detalle) y evita que
    // react-native-web renderice un <button> que contiene otro <button>
    // (el corazón de favoritos, más abajo), HTML inválido que confundía a
    // lectores de pantalla en web (encontrado durante la verificación de la
    // Prioridad 7).
    <Pressable onPress={onPress} accessibilityRole="link" testID={`place-card-${place.id}`}>
      <Card style={styles.card}>
        <View style={styles.thumbnail}>
          <Text variant="display" color="textInverse" style={styles.thumbnailInitial}>
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
    // El azul del board: sobre tarjetas vino es el acento que más resalta, y
    // evita que la miniatura compita con el amarillo de las acciones.
    backgroundColor: theme.colors.accent,
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.frame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailInitial: {
    // La display es una fuente de titular: a 56px de caja hay que bajarla
    // para que la inicial no se salga del thumbnail.
    fontSize: theme.typography.size.xl,
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
