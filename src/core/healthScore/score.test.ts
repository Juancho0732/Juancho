import { describe, expect, it } from 'vitest';
import { computeHealthScore } from './score';

describe('computeHealthScore', () => {
  it('calcula un score completo cuando hay datos para las 5 dimensiones', () => {
    const result = computeHealthScore(
      {
        marketingSpend: 50000,
        salesSpend: 0,
        newCustomers: 5,
        avgOrderValue: 100000,
        purchaseFrequencyPerYear: 4,
        customerLifespanYears: 3,
        revenue: 1000000,
        cogs: 300000,
        operatingExpenses: 200000,
        customersStart: 200,
        customersLost: 4,
        adSpend: 50000,
        attributedRevenue: 200000,
      },
      'revenue_based',
    );
    expect(result.overall).toBeGreaterThan(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(result.dimensions).toHaveLength(5);
    expect(result.dimensions.every((d) => d.score !== undefined)).toBe(true);
  });

  it('excluye dimensiones sin datos y renormaliza en vez de inventar un valor', () => {
    const result = computeHealthScore({ customersStart: 100, customersLost: 5 }, 'revenue_based');
    const withScore = result.dimensions.filter((d) => d.score !== undefined);
    expect(withScore).toHaveLength(1);
    expect(withScore[0].id).toBe('retention');
    expect(result.overall).toBe(withScore[0].score);
  });

  it('devuelve overall undefined si no hay ninguna dimensión calculable', () => {
    const result = computeHealthScore({}, 'revenue_based');
    expect(result.overall).toBeUndefined();
    expect(result.dimensions.every((d) => d.score === undefined)).toBe(true);
  });

  it('limita cada dimensión a un máximo de 100 puntos aunque el ratio supere la referencia', () => {
    const result = computeHealthScore({ customersStart: 100, customersLost: 0 }, 'revenue_based');
    const retention = result.dimensions.find((d) => d.id === 'retention')!;
    expect(retention.score).toBe(100);
  });

  it('nunca da una puntuación negativa', () => {
    const result = computeHealthScore({ revenue: 100, cogs: 100, operatingExpenses: 500 }, 'revenue_based');
    const profitability = result.dimensions.find((d) => d.id === 'profitability')!;
    expect(profitability.score).toBe(0);
  });
});
