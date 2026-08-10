import { describe, expect, it } from 'vitest';
import { calculateChurn } from './churn';

describe('Churn', () => {
  it('calcula el caso normal', () => {
    expect(calculateChurn({ customersStart: 200, customersLost: 20 }).value).toBe(10);
  });

  it('caso extremo: se pierden todos los clientes (100% churn)', () => {
    expect(calculateChurn({ customersStart: 50, customersLost: 50 }).value).toBe(100);
  });

  it('caso extremo: no se pierde ningún cliente (0% churn)', () => {
    expect(calculateChurn({ customersStart: 50, customersLost: 0 }).value).toBe(0);
  });

  it('rechaza clientes perdidos mayores que clientes al inicio', () => {
    const result = calculateChurn({ customersStart: 10, customersLost: 20 });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza clientes al inicio igual a cero', () => {
    expect(calculateChurn({ customersStart: 0, customersLost: 0 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateChurn({}).value).toBeUndefined();
  });
});
