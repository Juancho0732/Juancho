import { z } from 'zod';

import type { UpsertReviewInput } from '@/services/supabase/queries';
import type { Review } from '@/types/database';

import { OCCASION_OPTIONS } from './constants';

/** Límite superior defensivo (Prioridad 8) -- coincide con el CHECK de la migración. */
const MAX_AMOUNT_PAID = 10_000_000;
const VALID_OCCASIONS = new Set<string>(OCCASION_OPTIONS.map((option) => option.value));

/**
 * Valida la forma "cruda" del formulario (todo texto salvo `rating`, que ya
 * llega numérico desde el selector de estrellas). `amountPaid` se valida
 * como string porque viene de un TextInput; se convierte a número recién al
 * armar el input para `upsertReview`.
 *
 * Los mismos límites (500 caracteres, monto positivo con tope, ocasión de la
 * lista curada) están duplicados como CHECK constraints en la base de datos
 * (Prioridad 8, auditoría de beta-readiness) -- esto es solo la primera capa,
 * para dar feedback inmediato en el formulario; la real es la de Supabase,
 * porque Supabase REST es accesible directamente sin pasar por este schema.
 */
export const reviewFormSchema = z.object({
  rating: z.number().int().min(1, 'Elige una calificación').max(5),
  comment: z.string().trim().max(500, 'Máximo 500 caracteres'),
  amountPaid: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        (!Number.isNaN(Number(value)) && Number(value) > 0 && Number(value) <= MAX_AMOUNT_PAID),
      `Ingresa un monto válido (hasta $${MAX_AMOUNT_PAID.toLocaleString('es-CO')})`,
    ),
  occasion: z.string().refine((value) => value === '' || VALID_OCCASIONS.has(value), 'Ocasión inválida'),
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
