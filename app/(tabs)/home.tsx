import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PlaceCard } from '@/components/domain';
import { Button, Card, Chip, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { useUserLocation } from '@/features/location';
import { useCategories, useNearbyPlaces, usePersonalizedPlaces, usePlaces } from '@/features/places';

function PersonalizedSection() {
  const { data: favoriteIds } = useFavoriteIds();
  const hasSignal = (favoriteIds?.length ?? 0) > 0;
  const { data: personalizedPlaces, isLoading } = usePersonalizedPlaces(hasSignal);
  const { data: categories } = useCategories();
  const toggleFavorite = useToggleFavorite();

  const favoriteIdSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds]);
  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );

  // Sin favoritos todavía no hay señal real que personalizar: la RPC caería
  // a ordenar por rating, igual que "Lugares populares" — mostrarla ahí
  // sería fingir personalización donde no la hay.
  if (!hasSignal || isLoading || !personalizedPlaces || personalizedPlaces.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text variant="subtitle">Recomendado para ti</Text>
      <View style={styles.placeList}>
        {personalizedPlaces.map((place) => (
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
    </View>
  );
}

function NearbySection() {
  const location = useUserLocation();
  const coords = location.status === 'granted' ? location.coords : null;
  const { data: nearbyPlaces, isLoading } = useNearbyPlaces(coords);
  const { data: categories } = useCategories();
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const favoriteIdSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds]);
  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );

  return (
    <View style={styles.section}>
      <Text variant="subtitle">Cerca de ti</Text>

      {location.status === 'idle' || location.status === 'denied' ? (
        <Card>
          <View style={styles.nearbyPrompt}>
            <Text variant="body" color="textSecondary">
              {location.status === 'denied'
                ? 'No se pudo acceder a tu ubicación. Revisa los permisos de la app e intenta de nuevo.'
                : 'Activa tu ubicación para ver planes cerca de ti.'}
            </Text>
            <Button label="Activar ubicación" onPress={location.requestLocation} />
          </View>
        </Card>
      ) : location.status === 'loading' || isLoading ? (
        <Card>
          <Text variant="body" color="textSecondary">
            Buscando tu ubicación…
          </Text>
        </Card>
      ) : location.status === 'error' ? (
        <Card>
          <Text variant="body" color="danger">
            {location.message}
          </Text>
        </Card>
      ) : nearbyPlaces && nearbyPlaces.length > 0 ? (
        <View style={styles.placeList}>
          {nearbyPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              categoryName={place.category_id ? categoryNameById.get(place.category_id) : undefined}
              distanceMeters={place.distance_m}
              isFavorite={favoriteIdSet.has(place.id)}
              onToggleFavorite={() =>
                toggleFavorite.mutate({ placeId: place.id, isFavorite: favoriteIdSet.has(place.id) })
              }
              onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
            />
          ))}
        </View>
      ) : (
        <Card>
          <Text variant="body" color="textSecondary">
            No encontramos lugares activos a menos de 15 km.
          </Text>
        </Card>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const { data: categories } = useCategories();
  const { data: popularPlaces, isLoading: isLoadingPopular } = usePlaces({ limit: 10 });
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const favoriteIdSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds]);
  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );

  const handleAiSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push({ pathname: '/recommendations', params: { query: trimmed } });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="title">¿Qué quieres hacer?</Text>
        <View style={styles.aiSearch}>
          <Input
            placeholder='Ej: "Algo diferente en Chapinero por $80.000"'
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleAiSearch}
            returnKeyType="search"
          />
          <Button label="Buscar con IA" onPress={handleAiSearch} disabled={!query.trim()} />
        </View>

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

        <PersonalizedSection />

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

        <NearbySection />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  aiSearch: {
    gap: theme.spacing.sm,
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
  nearbyPrompt: {
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
});
