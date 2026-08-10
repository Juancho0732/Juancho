import { describe, expect, it } from 'vitest';
import { calculateGrossMargin, calculateNetMargin } from './margins';

describe('Margen bruto', () => {
  it('calcula el caso normal', () => {
    const result = calculateGrossMargin({ revenue: 1000, cogs: 400 });
    expect(result.value).toBe(60);
    expect(result.breakdown?.grossMarginAmount).toBe(600);
  });

  it('caso extremo: costo igual a ingresos (margen 0%)', () => {
    expect(calculateGrossMargin({ revenue: 1000, cogs: 1000 }).value).toBe(0);
  });

  it('permite margen negativo cuando el costo supera los ingresos, con advertencia', () => {
    const result = calculateGrossMargin({ revenue: 1000, cogs: 1500 });
    expect(result.value).toBe(-50);
  });

  it('rechaza ingresos de cero', () => {
    const result = calculateGrossMargin({ revenue: 0, cogs: 100 });
    expect(result.value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateGrossMargin({}).value).toBeUndefined();
  });
});

describe('Margen neto', () => {
  it('calcula el caso normal', () => {
    const result = calculateNetMargin({ revenue: 1000, cogs: 400, operatingExpenses: 300 });
    expect(result.value).toBe(30);
    expect(result.breakdown?.netProfitAmount).toBe(300);
  });

  it('caso extremo: gastos superan ingresos (margen neto negativo)', () => {
    const result = calculateNetMargin({ revenue: 1000, cogs: 700, operatingExpenses: 500 });
    expect(result.value).toBe(-20);
  });

  it('rechaza campos vacíos', () => {
    expect(calculateNetMargin({}).value).toBeUndefined();
  });

  it('rechaza valores negativos como input', () => {
    expect(calculateNetMargin({ revenue: 1000, cogs: -1, operatingExpenses: 100 }).value).toBeUndefined();
  });
});
