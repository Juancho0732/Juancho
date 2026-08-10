import { describe, expect, it } from 'vitest';
import { calculateAov } from './aov';

describe('AOV', () => {
  it('calcula el caso normal', () => {
    expect(calculateAov({ revenue: 10000, ordersCount: 50 }).value).toBe(200);
  });

  it('caso extremo: un solo pedido', () => {
    expect(calculateAov({ revenue: 500, ordersCount: 1 }).value).toBe(500);
  });

  it('rechaza cero pedidos', () => {
    const result = calculateAov({ revenue: 500, ordersCount: 0 });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateAov({}).value).toBeUndefined();
  });

  it('rechaza ingresos negativos', () => {
    expect(calculateAov({ revenue: -100, ordersCount: 5 }).value).toBeUndefined();
  });
});
