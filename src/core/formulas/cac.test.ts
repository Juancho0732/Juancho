import { describe, expect, it } from 'vitest';
import { calculateCac, interpretCac, validateCacInputs } from './cac';

describe('CAC', () => {
  it('calcula el caso normal', () => {
    const result = calculateCac({ marketingSpend: 150000, salesSpend: 90000, newCustomers: 1 });
    expect(result.value).toBe(240000);
    expect(result.unit).toBe('currency');
  });

  it('genera una interpretación en lenguaje sencillo', () => {
    const result = calculateCac({ marketingSpend: 150000, salesSpend: 90000, newCustomers: 1 });
    expect(interpretCac(result)).toContain('240.000');
  });

  it('maneja el caso extremo de un solo cliente adquirido', () => {
    const result = calculateCac({ marketingSpend: 1000, salesSpend: 0, newCustomers: 1 });
    expect(result.value).toBe(1000);
  });

  it('rechaza cero clientes nuevos (división entre cero)', () => {
    const result = calculateCac({ marketingSpend: 1000, salesSpend: 0, newCustomers: 0 });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza campos vacíos', () => {
    const validation = validateCacInputs({ marketingSpend: undefined, salesSpend: 100, newCustomers: 1 });
    expect(validation.valid).toBe(false);
  });

  it('rechaza valores negativos', () => {
    const validation = validateCacInputs({ marketingSpend: -100, salesSpend: 100, newCustomers: 1 });
    expect(validation.valid).toBe(false);
  });

  it('devuelve error cuando faltan inputs en vez de calcular con NaN', () => {
    const result = calculateCac({});
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });
});
