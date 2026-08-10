import { describe, expect, it } from 'vitest';
import { calculateArpu } from './arpu';

describe('ARPU', () => {
  it('calcula el caso normal', () => {
    expect(calculateArpu({ revenue: 10000, activeUsers: 200 }).value).toBe(50);
  });

  it('caso extremo: un solo usuario activo', () => {
    expect(calculateArpu({ revenue: 300, activeUsers: 1 }).value).toBe(300);
  });

  it('rechaza cero usuarios activos', () => {
    expect(calculateArpu({ revenue: 300, activeUsers: 0 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateArpu({}).value).toBeUndefined();
  });
});
