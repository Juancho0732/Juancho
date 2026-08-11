import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, FormInput, StarRating, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

import { OCCASION_OPTIONS } from './constants';
import { REVIEW_FORM_DEFAULTS, reviewFormSchema, type ReviewFormValues } from './validation';

type Props = {
  visible: boolean;
  initialValues?: ReviewFormValues;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (values: ReviewFormValues) => void;
  onClose: () => void;
};

export function ReviewFormSheet({
  visible,
  initialValues,
  isSubmitting,
  submitError,
  onSubmit,
  onClose,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: initialValues ?? REVIEW_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (visible) reset(initialValues ?? REVIEW_FORM_DEFAULTS);
  }, [visible, initialValues, reset]);

  if (!visible) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text variant="title">{initialValues ? 'Editar reseña' : 'Escribir reseña'}</Text>

            <View style={styles.section}>
              <Text variant="subtitle">Calificación</Text>
              <Controller
                control={control}
                name="rating"
                render={({ field: { value, onChange } }) => (
                  <StarRating value={value} onChange={onChange} size={32} />
                )}
              />
              {errors.rating ? (
                <Text variant="caption" color="danger">
                  {errors.rating.message}
                </Text>
              ) : null}
            </View>

            <FormInput
              control={control}
              name="comment"
              label="Comentario (opcional)"
              placeholder="¿Cómo te fue?"
              multiline
              numberOfLines={3}
              errorMessage={errors.comment?.message}
            />

            <FormInput
              control={control}
              name="amountPaid"
              label="¿Cuánto pagaste aprox.? (opcional)"
              placeholder="Ej: 45000"
              keyboardType="numeric"
              errorMessage={errors.amountPaid?.message}
            />

            <Controller
              control={control}
              name="occasion"
              render={({ field: { value, onChange } }) => (
                <View style={styles.section}>
                  <Text variant="subtitle">¿Para qué tipo de plan fue? (opcional)</Text>
                  <View style={styles.chipRow}>
                    {OCCASION_OPTIONS.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        selected={value === option.value}
                        onPress={() => onChange(value === option.value ? '' : option.value)}
                      />
                    ))}
                  </View>
                </View>
              )}
            />

            {submitError ? (
              <Text variant="caption" color="danger">
                {submitError}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerButton}>
              <Button
                label="Cancelar"
                variant="secondary"
                onPress={onClose}
                disabled={isSubmitting}
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                label={isSubmitting ? 'Guardando…' : 'Guardar'}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              />
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
    maxHeight: '85%',
    paddingTop: theme.spacing.lg,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
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
