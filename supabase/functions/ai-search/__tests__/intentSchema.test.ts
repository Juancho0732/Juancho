import { EMPTY_INTENT, isIntentEmpty, sanitizeIntent } from '../intentSchema.ts';

describe('sanitizeIntent', () => {
  it('acepta una intención completa y válida', () => {
    const intent = sanitizeIntent({
      people: 4,
      budget_total: 120000,
      location: 'Usaquén',
      occasion: 'pareja',
      category_hint: 'bar',
      activity_preference: 'diferente',
    });
    expect(intent).toEqual({
      people: 4,
      budgetTotal: 120000,
      location: 'Usaquén',
      occasion: 'pareja',
      categoryHint: 'bar',
      activityPreference: 'diferente',
    });
  });

  it('normaliza la localidad sin importar mayúsculas/acentos', () => {
    expect(sanitizeIntent({ ...raw(), location: 'usaquen' }).location).toBe('Usaquén');
    expect(sanitizeIntent({ ...raw(), location: 'CHAPINERO' }).location).toBe('Chapinero');
  });

  it('descarta una localidad que no está en la lista curada (Regla 10: no confiar ciegamente en la IA)', () => {
    expect(sanitizeIntent({ ...raw(), location: 'Medellín' }).location).toBeNull();
  });

  it('descarta una ocasión que no reconocemos', () => {
    expect(sanitizeIntent({ ...raw(), occasion: 'cumpleaños' }).occasion).toBeNull();
  });

  it('acepta una ocasión válida en cualquier capitalización', () => {
    expect(sanitizeIntent({ ...raw(), occasion: 'Pareja' }).occasion).toBe('pareja');
  });

  it('devuelve la intención vacía si la forma no es válida (rating fuera de rango, tipos incorrectos, etc.)', () => {
    expect(sanitizeIntent({ ...raw(), people: 999 })).toEqual(EMPTY_INTENT);
    expect(sanitizeIntent('no es un objeto')).toEqual(EMPTY_INTENT);
    expect(sanitizeIntent(null)).toEqual(EMPTY_INTENT);
  });

  function raw() {
    return {
      people: null,
      budget_total: null,
      location: null,
      occasion: null,
      category_hint: null,
      activity_preference: null,
    };
  }
});

describe('isIntentEmpty', () => {
  it('es true cuando todos los campos son null', () => {
    expect(isIntentEmpty(EMPTY_INTENT)).toBe(true);
  });

  it('es false si al menos un campo tiene valor', () => {
    expect(isIntentEmpty({ ...EMPTY_INTENT, people: 6 })).toBe(false);
    expect(isIntentEmpty({ ...EMPTY_INTENT, location: 'Suba' })).toBe(false);
  });
});
