import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ReviewListItem } from '@/components/domain';
import { Button, ConfirmDialog, QueryState, Screen, StarRating, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { useAuthStore } from '@/features/auth';
import { usePlace } from '@/features/places';
import { logAndGetSafeMessage } from '@/utils/errors';
import {
  ReviewFormSheet,
  reviewToFormValues,
  toUpsertReviewInput,
  useDeleteReview,
  useReviewsForPlace,
  useUpsertReview,
  type ReviewFormValues,
} from '@/features/reviews';
import type { ReviewWithAuthor } from '@/types/database';

export default function PlaceReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((state) => state.session?.user.id);

  const { data: place } = usePlace(id);
  const { data: reviews, isLoading, isError, refetch } = useReviewsForPlace(id);
  const upsertReview = useUpsertReview(id);
  const deleteReview = useDeleteReview(id);

  const [editingReview, setEditingReview] = useState<ReviewWithAuthor | null | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const myReview = reviews?.find((review) => review.user_id === userId) ?? null;
  const isFormVisible = editingReview !== undefined;

  const handleSubmit = async (values: ReviewFormValues) => {
    if (!userId) return;
    setSubmitError(null);
    try {
      await upsertReview.mutateAsync(toUpsertReviewInput(id, userId, values));
      setEditingReview(undefined);
    } catch (error) {
      setSubmitError(logAndGetSafeMessage('upsertReview', error, 'No se pudo guardar la reseña. Intenta de nuevo.'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteReview.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="title">Reseñas</Text>
          {place ? (
            <View style={styles.summaryRow}>
              <StarRating value={Math.round(place.rating_avg)} size={18} />
              <Text variant="body" color="textSecondary">
                {place.review_count > 0
                  ? `${place.rating_avg.toFixed(1)} · ${place.review_count} reseñas`
                  : 'Sin reseñas todavía'}
              </Text>
            </View>
          ) : null}

          {userId && !myReview ? (
            <Button label="Escribir reseña" onPress={() => setEditingReview(null)} />
          ) : null}
        </View>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          isEmpty={(reviews?.length ?? 0) === 0}
          emptyMessage="Todavía no hay reseñas. ¡Sé la primera persona en dejar una!"
        >
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {(reviews ?? []).map((review) => (
              <ReviewListItem
                key={review.id}
                review={review}
                isOwn={review.user_id === userId}
                onEdit={() => setEditingReview(review)}
                onDelete={() => setDeleteTarget(review.id)}
              />
            ))}
          </ScrollView>
        </QueryState>
      </View>

      <ReviewFormSheet
        visible={isFormVisible}
        initialValues={editingReview ? reviewToFormValues(editingReview) : undefined}
        isSubmitting={upsertReview.isPending}
        submitError={submitError}
        onSubmit={handleSubmit}
        onClose={() => setEditingReview(undefined)}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Eliminar reseña"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
});
