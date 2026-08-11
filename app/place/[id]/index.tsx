import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Lugar #{id}</Text>
        <Card>
          <Text variant="body" color="textSecondary">
            Fotos, descripción, precio, horarios, rating y mapa se cargan desde `places` +
            `place_images` (Fase 4/5).
          </Text>
        </Card>
        <Link href={{ pathname: '/place/[id]/reviews', params: { id } }}>
          <Text variant="body" color="primary">
            Ver reseñas
          </Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
});
