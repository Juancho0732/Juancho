import { describe, expect, it } from 'vitest';
import { calculateCpa, interpretCpa } from './cpa';

describe('CPA (incluye coste por lead vía conversionType)', () => {
  it('calcula el caso normal para compras', () => {
    const result = calculateCpa({ campaignCost: 5000, conversions: 25, conversionType: 'purchase' });
    expect(result.value).toBe(200);
  });

  it('calcula el caso normal para leads y lo refleja en la interpretación', () => {
    const result = calculateCpa({ campaignCost: 1000, conversions: 50, conversionType: 'lead' });
    expect(result.value).toBe(20);
    expect(interpretCpa(result)).toMatch(/lead/i);
  });

  it('rechaza cero conversiones', () => {
    const result = calculateCpa({ campaignCost: 1000, conversions: 0, conversionType: 'lead' });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateCpa({}).value).toBeUndefined();
  });
});
