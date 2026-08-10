import { describe, expect, it } from 'vitest';
import { calculateClv } from './clv';

describe('CLV / LTV', () => {
  it('calcula el método basado en ingresos (caso normal)', () => {
    const result = calculateClv({
      method: 'revenue_based',
      avgOrderValue: 100,
      purchaseFrequencyPerYear: 4,
      customerLifespanYears: 3,
    });
    expect(result.value).toBe(1200);
    expect(result.breakdown?.method).toBe('revenue_based');
  });

  it('calcula el método basado en margen y churn (caso normal)', () => {
    const result = calculateClv({
      method: 'margin_churn_based',
      arpu: 50,
      grossMarginPercent: 60,
      churnRatePercent: 5,
    });
    // (50 * 0.6) / 0.05 = 600
    expect(result.value).toBe(600);
  });

  it('caso extremo: churn muy bajo produce LTV muy alto pero finito', () => {
    const result = calculateClv({
      method: 'margin_churn_based',
      arpu: 100,
      grossMarginPercent: 50,
      churnRatePercent: 0.1,
    });
    expect(result.value).toBeCloseTo(50000, 0);
  });

  it('rechaza churn de cero (división entre cero)', () => {
    const result = calculateClv({
      method: 'margin_churn_based',
      arpu: 100,
      grossMarginPercent: 50,
      churnRatePercent: 0,
    });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza campos vacíos', () => {
    const result = calculateClv({ method: 'revenue_based' });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza margen bruto fuera de rango', () => {
    const result = calculateClv({
      method: 'margin_churn_based',
      arpu: 100,
      grossMarginPercent: 150,
      churnRatePercent: 5,
    });
    expect(result.value).toBeUndefined();
  });
});
