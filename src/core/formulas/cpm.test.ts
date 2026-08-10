import { describe, expect, it } from 'vitest';
import { calculateCpm } from './cpm';

describe('CPM', () => {
  it('calcula el caso normal', () => {
    expect(calculateCpm({ adSpend: 50, impressions: 10000 }).value).toBe(5);
  });

  it('caso extremo: muy pocas impresiones', () => {
    expect(calculateCpm({ adSpend: 10, impressions: 1 }).value).toBe(10000);
  });

  it('rechaza cero impresiones', () => {
    expect(calculateCpm({ adSpend: 50, impressions: 0 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateCpm({}).value).toBeUndefined();
  });
});
