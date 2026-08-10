import { describe, expect, it } from 'vitest';
import { calculateConversionRate } from './conversionRate';

describe('Conversion Rate', () => {
  it('calcula el caso normal', () => {
    expect(calculateConversionRate({ conversions: 10, visitors: 500 }).value).toBe(2);
  });

  it('caso extremo: conversión perfecta (100%)', () => {
    expect(calculateConversionRate({ conversions: 50, visitors: 50 }).value).toBe(100);
  });

  it('rechaza conversiones mayores que visitantes', () => {
    expect(calculateConversionRate({ conversions: 60, visitors: 50 }).value).toBeUndefined();
  });

  it('rechaza cero visitantes', () => {
    expect(calculateConversionRate({ conversions: 0, visitors: 0 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateConversionRate({}).value).toBeUndefined();
  });
});
