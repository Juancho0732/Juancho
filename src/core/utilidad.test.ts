import { describe, expect, it } from 'vitest';
import { calculateUtilidad } from './utilidad';

describe('Utilidad', () => {
  it('calcula el caso normal', () => {
    expect(calculateUtilidad({ monthlyMarginPerCustomer: 40000, newCustomers: 10 }).value).toBe(400000);
  });

  it('caso extremo: cero clientes adquiridos', () => {
    expect(calculateUtilidad({ monthlyMarginPerCustomer: 40000, newCustomers: 0 }).value).toBe(0);
  });

  it('rechaza valores negativos', () => {
    expect(calculateUtilidad({ monthlyMarginPerCustomer: -10, newCustomers: 5 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateUtilidad({ monthlyMarginPerCustomer: undefined, newCustomers: undefined }).value).toBeUndefined();
  });
});
