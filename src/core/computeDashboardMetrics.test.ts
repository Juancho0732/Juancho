import { describe, expect, it } from 'vitest';
import { computeDashboardMetrics } from './computeDashboardMetrics';

describe('computeDashboardMetrics', () => {
  it('encadena CAC y CLV hacia LTV:CAC y Payback', () => {
    const result = computeDashboardMetrics(
      {
        marketingSpend: 150000,
        salesSpend: 90000,
        newCustomers: 1,
        avgOrderValue: 100000,
        purchaseFrequencyPerYear: 2,
        customerLifespanYears: 3,
        monthlyMarginPerCustomer: 40000,
      },
      'revenue_based',
    );

    expect(result.cac.value).toBe(240000);
    expect(result.clv.value).toBe(600000);
    expect(result.ltvCac.value).toBe(2.5);
    expect(result.payback.value).toBe(6);
  });

  it('usa el método de LTV del proyecto cuando el snapshot no especifica uno', () => {
    const result = computeDashboardMetrics(
      { avgOrderValue: 50, purchaseFrequencyPerYear: 2, customerLifespanYears: 1 },
      'revenue_based',
    );
    expect(result.clv.breakdown?.method).toBe('revenue_based');
  });

  it('con inputs vacíos, todas las métricas quedan sin valor pero sin lanzar excepción', () => {
    expect(() => computeDashboardMetrics({}, 'revenue_based')).not.toThrow();
    const result = computeDashboardMetrics({}, 'revenue_based');
    expect(result.cac.value).toBeUndefined();
    expect(result.ltvCac.value).toBeUndefined();
  });
});
