import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { PlaceCard } from '@/components/domain';
import { Button, Input, QueryState, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { FiltersSheet, useCategories, usePlacesInfinite, type PlaceFilters } from '@/features/places';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { PlaceListItem } from '@/types/database';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<PlaceFilters>({
    categoryId: params.categoryId,
  });
  const [isFiltersVisible, setFiltersVisible] = useState(false);

  const debouncedQuery = useDebouncedValue(query);
  const { data: categories } = useCategories();
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePlacesInfinite({
    search: debouncedQuery,
    locality: filters.locality,
    categoryId: filters.categoryId,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
  });
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const places = useMemo(() => data?.pages.flat() ?? [], [data]);
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

        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          isEmpty={places.length === 0}
          emptyMessage="No encontramos lugares con esos criterios. Prueba ajustando la búsqueda o los filtros."
          loadingMessage="Buscando…"
        >
          <FlatList
            data={places}
            keyExtractor={(place: PlaceListItem) => place.id}
            contentContainerStyle={styles.results}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <Text variant="caption" color="textSecondary" style={styles.footerText}>
                  Cargando más lugares…
                </Text>
              ) : null
            }
            renderItem={({ item: place }) => (
              <PlaceCard
                place={place}
                categoryName={place.category_id ? categoryNameById.get(place.category_id) : undefined}
                isFavorite={favoriteIdSet.has(place.id)}
                onToggleFavorite={() =>
                  toggleFavorite.mutate({ placeId: place.id, isFavorite: favoriteIdSet.has(place.id) })
                }
                onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
              />
            )}
          />
        </QueryState>
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
  footerText: {
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});
