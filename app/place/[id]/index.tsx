import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PlaceMapPreview } from '@/components/domain';
import { Button, Card, Chip, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { useCategories, usePlace, usePlaceImages } from '@/features/places';
import type { PlaceSchedule } from '@/types/database';
import { formatPriceRange } from '@/utils/format';

const SCHEDULE_LABELS: Record<string, string> = {
  lun_vie: 'Lunes a viernes',
  sab_dom: 'Sábado y domingo',
};

function ScheduleList({ schedule }: { schedule: PlaceSchedule }) {
  return (
    <View style={styles.scheduleList}>
      {Object.entries(schedule).map(([key, hours]) => (
        <View key={key} style={styles.scheduleRow}>
          <Text variant="body" color="textSecondary">
            {SCHEDULE_LABELS[key] ?? key}
          </Text>
          <Text variant="body">{hours}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: place, isLoading, isError, refetch } = usePlace(id);
  const { data: images } = usePlaceImages(id);
  const { data: categories } = useCategories();
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  if (isLoading) {
    return (
      <Screen>
        <Text variant="body" color="textSecondary">
          Cargando…
        </Text>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Card>
          <View style={styles.errorContent}>
            <Text variant="body" color="danger">
              No pudimos cargar este lugar. Revisa tu conexión e intenta de nuevo.
            </Text>
            <Button label="Reintentar" variant="secondary" onPress={() => refetch()} />
          </View>
        </Card>
      </Screen>
    );
  }

  if (!place) {
    return (
      <Screen>
        <Card>
          <Text variant="body" color="textSecondary">
            No encontramos este lugar.
          </Text>
        </Card>
      </Screen>
    );
  }

  const isFavorite = (favoriteIds ?? []).includes(place.id);
  const categoryName = place.category_id
    ? categories?.find((category) => category.id === place.category_id)?.name
    : undefined;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {images && images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            {images.map((image) => (
              <Image key={image.id} source={{ uri: image.url }} style={styles.image} contentFit="cover" />
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.headerRow}>
          <Text variant="title" style={styles.name}>
            {place.name}
          </Text>
          <Button
            label={isFavorite ? '♥ Guardado' : '♡ Guardar'}
            variant="secondary"
            onPress={() => toggleFavorite.mutate({ placeId: place.id, isFavorite })}
          />
        </View>

        <Text variant="caption" color="textSecondary">
          {[place.locality, categoryName].filter(Boolean).join(' · ')}
        </Text>

        <View style={styles.metaRow}>
          <Text variant="body">{formatPriceRange(place.price_min, place.price_max)}</Text>
          {place.review_count > 0 ? (
            <Text variant="body">{`★ ${place.rating_avg.toFixed(1)} (${place.review_count} reseñas)`}</Text>
          ) : (
            <Text variant="body" color="textSecondary">
              Sin reseñas todavía
            </Text>
          )}
        </View>

        {place.description ? (
          <Text variant="body" color="textSecondary">
            {place.description}
          </Text>
        ) : null}

        {place.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {place.tags.map((tag) => (
              <Chip key={tag} label={tag.replace(/_/g, ' ')} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="subtitle">Ubicación</Text>
          {place.address ? (
            <Text variant="body" color="textSecondary">
              {place.address}
            </Text>
          ) : null}
          <PlaceMapPreview lat={place.lat} lng={place.lng} title={place.name} />
        </View>

        {place.schedule ? (
          <View style={styles.section}>
            <Text variant="subtitle">Horario</Text>
            <ScheduleList schedule={place.schedule} />
          </View>
        ) : null}

        <View style={styles.section}>
          <Link href={{ pathname: '/place/[id]/reviews', params: { id: place.id } }}>
            <Text variant="body" color="primary">
              Ver reseñas
            </Text>
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  errorContent: {
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  gallery: {
    marginHorizontal: -theme.spacing.md,
  },
  image: {
    width: 260,
    height: 180,
    marginLeft: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  name: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.xs,
  },
  scheduleList: {
    gap: theme.spacing.xs,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
