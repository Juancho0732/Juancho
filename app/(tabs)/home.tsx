import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, Chip, Input, Screen, Text } from '@/components/ui';
import { PlaceCard } from '@/components/domain';
import { theme } from '@/design-system/theme';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { useCategories, usePlaces } from '@/features/places';

function EmptySection({ title, note }: { title: string; note: string }) {
  return (
    <View style={styles.section}>
      <Text variant="subtitle">{title}</Text>
      <Card>
        <Text variant="body" color="textSecondary">
          {note}
        </Text>
      </Card>
    </View>
  );
}

export default function HomeScreen() {
  const { data: categories } = useCategories();
  const { data: popularPlaces, isLoading: isLoadingPopular } = usePlaces({ limit: 10 });
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const favoriteIdSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds]);
  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="title">¿Qué quieres hacer?</Text>
        <Input
          placeholder='Ej: "Algo diferente en Chapinero por $80.000"'
          onFocus={() => router.push('/search')}
        />

        <View style={styles.section}>
          <Text variant="subtitle">Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {(categories ?? []).map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  onPress={() =>
                    router.push({ pathname: '/search', params: { categoryId: category.id } })
                  }
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text variant="subtitle">Lugares populares</Text>
          {isLoadingPopular ? (
            <Card>
              <Text variant="body" color="textSecondary">
                Cargando…
              </Text>
            </Card>
          ) : (
            <View style={styles.placeList}>
              {(popularPlaces ?? []).map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  categoryName={place.category_id ? categoryNameById.get(place.category_id) : undefined}
                  isFavorite={favoriteIdSet.has(place.id)}
                  onToggleFavorite={() =>
                    toggleFavorite.mutate({ placeId: place.id, isFavorite: favoriteIdSet.has(place.id) })
                  }
                  onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
                />
              ))}
            </View>
          )}
        </View>

        <EmptySection title="Cerca de ti" note="Requiere permiso de ubicación — Fase 5." />
        <EmptySection
          title="Recomendado para ti"
          note="Recomendaciones personalizadas por IA — Fase 7/8."
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  placeList: {
    gap: theme.spacing.sm,
  },
});
