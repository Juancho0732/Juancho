import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PlaceCard } from '@/components/domain';
import { Button, Card, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { useAiSearch } from '@/features/ai-search';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { useCategories } from '@/features/places';

export default function RecommendationsScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const { data, isLoading } = useAiSearch(query);
  const { data: categories } = useCategories();
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const favoriteIdSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds]);
  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );

  if (!query) {
    return (
      <Screen>
        <Card>
          <Text variant="body" color="textSecondary">
            Escribe qué quieres hacer en el inicio para ver recomendaciones.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="title">Recomendaciones</Text>
        <Text variant="caption" color="textSecondary">
          {`"${query}"`}
        </Text>

        {isLoading ? (
          <Card>
            <Text variant="body" color="textSecondary">
              Buscando los mejores planes para ti…
            </Text>
          </Card>
        ) : !data || data.status === 'error' ? (
          <Card>
            <View style={styles.section}>
              <Text variant="body" color="danger">
                {data?.message ?? 'Algo salió mal buscando tus planes.'}
              </Text>
              <Button label="Buscar manualmente" variant="secondary" onPress={() => router.push('/search')} />
            </View>
          </Card>
        ) : data.status === 'needs_clarification' ? (
          <Card>
            <View style={styles.section}>
              <Text variant="body" color="textSecondary">
                {data.message}
              </Text>
              <Button label="Buscar manualmente" variant="secondary" onPress={() => router.push('/search')} />
            </View>
          </Card>
        ) : (
          <>
            <Card>
              <Text variant="body" color="textSecondary">
                {data.explanation}
              </Text>
            </Card>

            {data.results.length === 0 ? (
              <Card>
                <Text variant="body" color="textSecondary">
                  No encontramos lugares que encajen todavía. Prueba describiendo tu plan de otra
                  forma.
                </Text>
              </Card>
            ) : (
              <View style={styles.list}>
                {data.results.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    categoryName={
                      place.category_id ? categoryNameById.get(place.category_id) : undefined
                    }
                    isFavorite={favoriteIdSet.has(place.id)}
                    onToggleFavorite={() =>
                      toggleFavorite.mutate({
                        placeId: place.id,
                        isFavorite: favoriteIdSet.has(place.id),
                      })
                    }
                    onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
                  />
                ))}
              </View>
            )}
          </>
        )}
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
    alignItems: 'flex-start',
  },
  list: {
    gap: theme.spacing.sm,
  },
});
