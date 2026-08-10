import { describe, expect, it } from 'vitest';
import { calculateRevenuePerCustomer } from './revenuePerCustomer';

describe('Revenue per Customer', () => {
  it('calcula el caso normal', () => {
    expect(calculateRevenuePerCustomer({ revenue: 100000, totalCustomers: 200 }).value).toBe(500);
  });

  it('caso extremo: un solo cliente', () => {
    expect(calculateRevenuePerCustomer({ revenue: 5000, totalCustomers: 1 }).value).toBe(5000);
  });

  it('rechaza cero clientes', () => {
    expect(calculateRevenuePerCustomer({ revenue: 5000, totalCustomers: 0 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateRevenuePerCustomer({}).value).toBeUndefined();
  });
});
