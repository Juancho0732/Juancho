import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PlaceCard } from '@/components/domain';
import { QueryState, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { useFavoritePlaces, useToggleFavorite } from '@/features/favorites';
import { useCategories } from '@/features/places';

export default function FavoritesScreen() {
  const { data: places, isLoading, isError, refetch } = useFavoritePlaces();
  const { data: categories } = useCategories();
  const toggleFavorite = useToggleFavorite();

  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Favoritos</Text>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          isEmpty={(places?.length ?? 0) === 0}
          emptyMessage="Todavía no has guardado lugares. Toca el ♡ en cualquier lugar para guardarlo aquí."
        >
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {(places ?? []).map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                categoryName={place.category_id ? categoryNameById.get(place.category_id) : undefined}
                isFavorite
                onToggleFavorite={() => toggleFavorite.mutate({ placeId: place.id, isFavorite: true })}
                onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
              />
            ))}
          </ScrollView>
        </QueryState>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
});
