import {
  REVIEW_FORM_DEFAULTS,
  reviewFormSchema,
  reviewToFormValues,
  toUpsertReviewInput,
} from '../validation';

describe('reviewFormSchema', () => {
  it('acepta el formulario por defecto salvo el rating', () => {
    expect(reviewFormSchema.safeParse(REVIEW_FORM_DEFAULTS).success).toBe(false);
    expect(reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 4 }).success).toBe(true);
  });

  it('rechaza rating fuera de 1-5', () => {
    expect(reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 0 }).success).toBe(false);
    expect(reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 6 }).success).toBe(false);
  });

  it('rechaza comentarios de más de 500 caracteres', () => {
    const result = reviewFormSchema.safeParse({
      ...REVIEW_FORM_DEFAULTS,
      rating: 5,
      comment: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('acepta amountPaid vacío (opcional)', () => {
    const result = reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 3, amountPaid: '' });
    expect(result.success).toBe(true);
  });

  it('rechaza amountPaid no numérico o negativo', () => {
    expect(
      reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 3, amountPaid: 'abc' }).success,
    ).toBe(false);
    expect(
      reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 3, amountPaid: '-100' }).success,
    ).toBe(false);
  });

  it('acepta amountPaid numérico positivo', () => {
    const result = reviewFormSchema.safeParse({
      ...REVIEW_FORM_DEFAULTS,
      rating: 3,
      amountPaid: '45000',
    });
    expect(result.success).toBe(true);
  });

  it('Prioridad 8: rechaza amountPaid absurdamente alto (mismo tope que el CHECK de la base de datos)', () => {
    expect(
      reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 3, amountPaid: '10000001' }).success,
    ).toBe(false);
    expect(
      reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 3, amountPaid: '10000000' }).success,
    ).toBe(true);
  });

  it('Prioridad 8: rechaza una ocasión fuera de la lista curada', () => {
    const result = reviewFormSchema.safeParse({
      ...REVIEW_FORM_DEFAULTS,
      rating: 3,
      occasion: 'cumpleaños',
    });
    expect(result.success).toBe(false);
  });

  it('Prioridad 8: acepta cualquier ocasión de la lista curada', () => {
    for (const value of ['amigos', 'pareja', 'familia', 'solo', 'trabajo']) {
      expect(reviewFormSchema.safeParse({ ...REVIEW_FORM_DEFAULTS, rating: 3, occasion: value }).success).toBe(
        true,
      );
    }
  });
});

describe('toUpsertReviewInput', () => {
  it('convierte campos vacíos a undefined', () => {
    const input = toUpsertReviewInput('place-1', 'user-1', {
      rating: 5,
      comment: '   ',
      amountPaid: '',
      occasion: '',
    });
    expect(input).toEqual({
      placeId: 'place-1',
      userId: 'user-1',
      rating: 5,
      comment: undefined,
      amountPaid: undefined,
      occasion: undefined,
    });
  });

  it('convierte amountPaid de string a number', () => {
    const input = toUpsertReviewInput('place-1', 'user-1', {
      rating: 4,
      comment: 'Muy bien',
      amountPaid: '45000',
      occasion: 'pareja',
    });
    expect(input.amountPaid).toBe(45000);
    expect(input.comment).toBe('Muy bien');
    expect(input.occasion).toBe('pareja');
  });
});

describe('reviewToFormValues', () => {
  it('convierte una reseña existente al formato del formulario', () => {
    const values = reviewToFormValues({
      id: 'r1',
      place_id: 'p1',
      user_id: 'u1',
      rating: 4,
      comment: 'Bien',
      amount_paid: 30000,
      occasion: 'amigos',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
    expect(values).toEqual({ rating: 4, comment: 'Bien', amountPaid: '30000', occasion: 'amigos' });
  });

  it('usa strings vacíos para campos null', () => {
    const values = reviewToFormValues({
      id: 'r1',
      place_id: 'p1',
      user_id: 'u1',
      rating: 5,
      comment: null,
      amount_paid: null,
      occasion: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
    expect(values).toEqual({ rating: 5, comment: '', amountPaid: '', occasion: '' });
  });
});
