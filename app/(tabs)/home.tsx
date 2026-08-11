import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

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
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="title">¿Qué quieres hacer?</Text>
        <Input
          placeholder='Ej: "Algo diferente en Chapinero por $80.000"'
          onFocus={() => router.push('/search')}
        />

        <EmptySection
          title="Categorías"
          note="Se cargan desde la tabla `categories` — Fase 2."
        />
        <EmptySection
          title="Lugares populares"
          note="Se cargan desde la tabla `places` (mock) — Fase 4."
        />
        <EmptySection
          title="Cerca de ti"
          note="Requiere permiso de ubicación — Fase 5."
        />
        <EmptySection
          title="Recomendado para ti"
          note="Ranking inicial por reglas — Fase 4/8."
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
});
