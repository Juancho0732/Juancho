import { describe, expect, it } from 'vitest';
import { calculateRetention } from './retention';

describe('Retención', () => {
  it('es el complemento del churn en el caso normal', () => {
    expect(calculateRetention({ customersStart: 200, customersLost: 20 }).value).toBe(90);
  });

  it('caso extremo: retención perfecta', () => {
    expect(calculateRetention({ customersStart: 100, customersLost: 0 }).value).toBe(100);
  });

  it('caso extremo: retención de cero', () => {
    expect(calculateRetention({ customersStart: 100, customersLost: 100 }).value).toBe(0);
  });

  it('rechaza clientes perdidos mayores que clientes al inicio', () => {
    expect(calculateRetention({ customersStart: 10, customersLost: 15 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateRetention({}).value).toBeUndefined();
  });
});
