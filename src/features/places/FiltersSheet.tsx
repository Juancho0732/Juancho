import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import type { ListPlacesFilters } from '@/services/supabase/queries';

import { BOGOTA_LOCALITIES, BUDGET_PRESETS, MIN_RATING_PRESETS } from './constants';
import { useCategories } from './useCategories';

export type PlaceFilters = Pick<ListPlacesFilters, 'locality' | 'categoryId' | 'maxPrice' | 'minRating'>;

type Props = {
  visible: boolean;
  value: PlaceFilters;
  onApply: (filters: PlaceFilters) => void;
  onClose: () => void;
};

export function FiltersSheet({ visible, value, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<PlaceFilters>(value);
  const [wasVisible, setWasVisible] = useState(visible);
  const { data: categories } = useCategories();

  // Reinicia el borrador con los filtros vigentes cada vez que se abre la
  // hoja, sin useEffect (patrón recomendado por React para ajustar estado a
  // partir de props durante el render, ver https://react.dev/learn/you-might-not-need-an-effect).
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(value);
  }

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleClear = () => {
    setDraft({});
  };

  if (!visible) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text variant="title">Filtros</Text>

            <View style={styles.section}>
              <Text variant="subtitle">Zona</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="Cualquiera"
                  selected={!draft.locality}
                  onPress={() => setDraft((prev) => ({ ...prev, locality: undefined }))}
                />
                {BOGOTA_LOCALITIES.map((locality) => (
                  <Chip
                    key={locality}
                    label={locality}
                    selected={draft.locality === locality}
                    onPress={() => setDraft((prev) => ({ ...prev, locality }))}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="subtitle">Categoría</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="Todas"
                  selected={!draft.categoryId}
                  onPress={() => setDraft((prev) => ({ ...prev, categoryId: undefined }))}
                />
                {categories?.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    selected={draft.categoryId === category.id}
                    onPress={() => setDraft((prev) => ({ ...prev, categoryId: category.id }))}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="subtitle">Presupuesto</Text>
              <View style={styles.chipRow}>
                {BUDGET_PRESETS.map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    selected={draft.maxPrice === preset.value}
                    onPress={() => setDraft((prev) => ({ ...prev, maxPrice: preset.value }))}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="subtitle">Rating mínimo</Text>
              <View style={styles.chipRow}>
                {MIN_RATING_PRESETS.map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    selected={draft.minRating === preset.value}
                    onPress={() => setDraft((prev) => ({ ...prev, minRating: preset.value }))}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerButton}>
              <Button label="Limpiar" variant="secondary" onPress={handleClear} />
            </View>
            <View style={styles.footerButton}>
              <Button label="Aplicar" onPress={handleApply} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '80%',
    paddingTop: theme.spacing.lg,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerButton: {
    flex: 1,
  },
});
