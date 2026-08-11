import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StyleSheet, View } from 'react-native';

import { Card, StarRating, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import type { ReviewWithAuthor } from '@/types/database';
import { formatCOP } from '@/utils/format';
import { OCCASION_OPTIONS } from '@/features/reviews/constants';

type Props = {
  review: ReviewWithAuthor;
  isOwn: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ReviewListItem({ review, isOwn, onEdit, onDelete }: Props) {
  const occasionLabel = OCCASION_OPTIONS.find((option) => option.value === review.occasion)?.label;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text variant="subtitle">{isOwn ? 'Tu reseña' : (review.profiles?.display_name ?? 'Usuario')}</Text>
        <Text variant="caption" color="textSecondary">
          {format(new Date(review.created_at), 'd MMM yyyy', { locale: es })}
        </Text>
      </View>

      <StarRating value={review.rating} size={16} />

      {review.comment ? (
        <Text variant="body" color="textSecondary">
          {review.comment}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        {review.amount_paid !== null ? (
          <Text variant="caption" color="textSecondary">
            {`Pagó ${formatCOP(review.amount_paid)}`}
          </Text>
        ) : null}
        {occasionLabel ? (
          <Text variant="caption" color="textSecondary">
            {occasionLabel}
          </Text>
        ) : null}
      </View>

      {isOwn ? (
        <View style={styles.actionsRow}>
          <Text variant="caption" color="primary" accessibilityRole="button" onPress={onEdit}>
            Editar
          </Text>
          <Text variant="caption" color="danger" accessibilityRole="button" onPress={onDelete}>
            Eliminar
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
});
