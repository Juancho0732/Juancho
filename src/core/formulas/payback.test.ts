import { describe, expect, it } from 'vitest';
import { calculatePayback, interpretPayback } from './payback';

describe('Payback Period', () => {
  it('calcula el caso del ejemplo de la especificación', () => {
    const result = calculatePayback({ cac: 240000, monthlyMarginPerCustomer: 40000 });
    expect(result.value).toBe(6);
    expect(result.unit).toBe('months');
  });

  it('incluye el paso a paso en el breakdown', () => {
    const result = calculatePayback({ cac: 240000, monthlyMarginPerCustomer: 40000 });
    expect(result.breakdown).toEqual({ cac: 240000, monthlyMarginPerCustomer: 40000 });
  });

  it('genera la interpretación esperada', () => {
    const result = calculatePayback({ cac: 240000, monthlyMarginPerCustomer: 40000 });
    expect(interpretPayback(result)).toContain('6.0 meses');
  });

  it('caso extremo: margen mensual muy alto produce payback casi inmediato', () => {
    const result = calculatePayback({ cac: 1000, monthlyMarginPerCustomer: 900000 });
    expect(result.value).toBeCloseTo(0.0011, 3);
  });

  it('rechaza margen mensual de cero o negativo (nunca se recupera el CAC)', () => {
    const zero = calculatePayback({ cac: 1000, monthlyMarginPerCustomer: 0 });
    const negative = calculatePayback({ cac: 1000, monthlyMarginPerCustomer: -100 });
    expect(zero.value).toBeUndefined();
    expect(negative.value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    const result = calculatePayback({});
    expect(result.value).toBeUndefined();
  });
});
