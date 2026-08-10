import { describe, expect, it } from 'vitest';
import { calculateRoas, interpretRoas } from './roas';

describe('ROAS', () => {
  it('calcula el caso del ejemplo de la especificación', () => {
    const result = calculateRoas({ adSpend: 100000, attributedRevenue: 350000 });
    expect(result.value).toBe(3.5);
  });

  it('la interpretación aclara que ROAS no equivale a rentabilidad', () => {
    const result = calculateRoas({ adSpend: 100000, attributedRevenue: 350000 });
    expect(interpretRoas(result)).toMatch(/no significa/i);
  });

  it('caso extremo: sin ingresos atribuidos', () => {
    const result = calculateRoas({ adSpend: 1000, attributedRevenue: 0 });
    expect(result.value).toBe(0);
  });

  it('rechaza gasto publicitario de cero', () => {
    const result = calculateRoas({ adSpend: 0, attributedRevenue: 100 });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza campos vacíos', () => {
    const result = calculateRoas({});
    expect(result.value).toBeUndefined();
  });
});
