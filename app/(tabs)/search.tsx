import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PlaceCard } from '@/components/domain';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { FiltersSheet, useCategories, usePlaces, type PlaceFilters } from '@/features/places';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<PlaceFilters>({
    categoryId: params.categoryId,
  });
  const [isFiltersVisible, setFiltersVisible] = useState(false);

  const debouncedQuery = useDebouncedValue(query);
  const { data: categories } = useCategories();
  const { data: places, isLoading } = usePlaces({
    search: debouncedQuery,
    locality: filters.locality,
    categoryId: filters.categoryId,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    limit: 30,
  });
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const favoriteIdSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds]);
  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );
  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Buscar</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Input
              placeholder="Lenguaje natural o palabra clave"
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <Button
            label={activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
            variant="secondary"
            onPress={() => setFiltersVisible(true)}
          />
        </View>

        {isLoading ? (
          <Card>
            <Text variant="body" color="textSecondary">
              Buscando…
            </Text>
          </Card>
        ) : places && places.length > 0 ? (
          <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>
            {places.map((place) => (
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
          </ScrollView>
        ) : (
          <Card>
            <Text variant="body" color="textSecondary">
              No encontramos lugares con esos criterios. Prueba ajustando la búsqueda o los
              filtros.
            </Text>
          </Card>
        )}
      </View>

      <FiltersSheet
        visible={isFiltersVisible}
        value={filters}
        onApply={setFilters}
        onClose={() => setFiltersVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: theme.spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  searchInput: {
    flex: 1,
  },
  results: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
});
