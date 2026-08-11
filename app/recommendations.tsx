import { StyleSheet, View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

export default function RecommendationsScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Recomendaciones</Text>
        <Card>
          <Text variant="body" color="textSecondary">
            Resultados personalizados de la búsqueda por IA (intención → filtros → ranking →
            explicación) — Fase 7.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
});
