import { describe, expect, it } from 'vitest';
import { computeComparisonMetrics } from './computeComparisonMetrics';

describe('computeComparisonMetrics', () => {
  it('incluye las métricas del dashboard más márgenes, churn y retención', () => {
    const result = computeComparisonMetrics(
      { revenue: 1000, cogs: 400, operatingExpenses: 200, customersStart: 100, customersLost: 10 },
      'revenue_based',
    );
    expect(result.grossMargin.value).toBe(60);
    expect(result.netMargin.value).toBe(40);
    expect(result.churn.value).toBe(10);
    expect(result.retention.value).toBe(90);
  });

  it('no lanza excepción con inputs vacíos', () => {
    expect(() => computeComparisonMetrics({}, 'revenue_based')).not.toThrow();
  });
});
