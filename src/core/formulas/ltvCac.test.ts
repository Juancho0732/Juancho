import { describe, expect, it } from 'vitest';
import { calculateLtvCac } from './ltvCac';

describe('LTV:CAC', () => {
  it('calcula el ratio en el caso normal', () => {
    const result = calculateLtvCac({ ltv: 600000, cac: 200000 });
    expect(result.value).toBe(3);
    expect(result.unit).toBe('ratio');
  });

  it('caso extremo: LTV menor que CAC produce ratio menor que 1', () => {
    const result = calculateLtvCac({ ltv: 50000, cac: 200000 });
    expect(result.value).toBe(0.25);
  });

  it('rechaza CAC de cero', () => {
    const result = calculateLtvCac({ ltv: 100, cac: 0 });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza campos vacíos (p. ej. cuando aún no se calculó CAC o LTV)', () => {
    const result = calculateLtvCac({ ltv: undefined, cac: undefined });
    expect(result.value).toBeUndefined();
  });

  it('rechaza valores negativos', () => {
    const result = calculateLtvCac({ ltv: -100, cac: 200 });
    expect(result.value).toBeUndefined();
  });
});
