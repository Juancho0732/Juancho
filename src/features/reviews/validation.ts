import { z } from 'zod';

import type { UpsertReviewInput } from '@/services/supabase/queries';
import type { Review } from '@/types/database';

/**
 * Valida la forma "cruda" del formulario (todo texto salvo `rating`, que ya
 * llega numérico desde el selector de estrellas). `amountPaid` se valida
 * como string porque viene de un TextInput; se convierte a número recién al
 * armar el input para `upsertReview`.
 */
export const reviewFormSchema = z.object({
  rating: z.number().int().min(1, 'Elige una calificación').max(5),
  comment: z.string().trim().max(500, 'Máximo 500 caracteres'),
  amountPaid: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) > 0),
      'Ingresa un monto válido',
    ),
  occasion: z.string(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const REVIEW_FORM_DEFAULTS: ReviewFormValues = {
  rating: 0,
  comment: '',
  amountPaid: '',
  occasion: '',
};

export function reviewToFormValues(review: Review): ReviewFormValues {
  return {
    rating: review.rating,
    comment: review.comment ?? '',
    amountPaid: review.amount_paid !== null ? String(review.amount_paid) : '',
    occasion: review.occasion ?? '',
  };
}

export function toUpsertReviewInput(
  placeId: string,
  userId: string,
  values: ReviewFormValues,
): UpsertReviewInput {
  return {
    placeId,
    userId,
    rating: values.rating,
    comment: values.comment.trim() || undefined,
    amountPaid: values.amountPaid.trim() ? Number(values.amountPaid) : undefined,
    occasion: values.occasion || undefined,
  };
}
