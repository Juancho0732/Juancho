import { describe, expect, it } from 'vitest';
import { calculateCtr } from './ctr';

describe('CTR', () => {
  it('calcula el caso normal', () => {
    expect(calculateCtr({ clicks: 50, impressions: 1000 }).value).toBe(5);
  });

  it('caso extremo: todos ven y todos hacen clic (CTR de 100%)', () => {
    expect(calculateCtr({ clicks: 100, impressions: 100 }).value).toBe(100);
  });

  it('rechaza clics mayores que impresiones', () => {
    expect(calculateCtr({ clicks: 200, impressions: 100 }).value).toBeUndefined();
  });

  it('rechaza cero impresiones', () => {
    expect(calculateCtr({ clicks: 0, impressions: 0 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateCtr({}).value).toBeUndefined();
  });
});
