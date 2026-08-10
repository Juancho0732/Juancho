import { describe, expect, it } from 'vitest';
import { applyAdjustments, DEFAULT_OPTIMISTIC_ADJUSTMENTS, DEFAULT_PESSIMISTIC_ADJUSTMENTS } from './scenario';

describe('applyAdjustments', () => {
  it('aplica un incremento porcentual', () => {
    const result = applyAdjustments({ marketingSpend: 1000 }, { marketingSpend: 20 });
    expect(result.marketingSpend).toBe(1200);
  });

  it('aplica una reducción porcentual', () => {
    const result = applyAdjustments({ marketingSpend: 1000 }, { marketingSpend: -20 });
    expect(result.marketingSpend).toBe(800);
  });

  it('no toca campos no numéricos como ltvMethod', () => {
    const result = applyAdjustments({ ltvMethod: 'revenue_based' }, { ltvMethod: 50 } as any);
    expect(result.ltvMethod).toBe('revenue_based');
  });

  it('deja intactos los campos sin ajuste', () => {
    const result = applyAdjustments({ marketingSpend: 1000, newCustomers: 10 }, { marketingSpend: 10 });
    expect(result.newCustomers).toBe(10);
  });

  it('ignora ajustes sobre campos ausentes en el base', () => {
    const result = applyAdjustments({}, { marketingSpend: 10 });
    expect(result.marketingSpend).toBeUndefined();
  });

  it('los presets optimista/pesimista son simétricamente opuestos en signo', () => {
    for (const key of Object.keys(DEFAULT_OPTIMISTIC_ADJUSTMENTS) as (keyof typeof DEFAULT_OPTIMISTIC_ADJUSTMENTS)[]) {
      const optimistic = DEFAULT_OPTIMISTIC_ADJUSTMENTS[key]!;
      const pessimistic = DEFAULT_PESSIMISTIC_ADJUSTMENTS[key]!;
      expect(Math.sign(optimistic)).toBe(-Math.sign(pessimistic));
    }
  });
});
