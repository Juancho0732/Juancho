import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');

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
          <Button label="Filtros" variant="secondary" disabled />
        </View>

        <Card>
          <Text variant="body" color="textSecondary">
            La búsqueda por IA (Fase 7) y por filtros/keywords (Fase 4) llenarán esta lista con
            resultados reales de la base de datos.
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
  searchRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  searchInput: {
    flex: 1,
  },
});
