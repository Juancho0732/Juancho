import { describe, expect, it } from 'vitest';
import { calculateCpc } from './cpc';

describe('CPC', () => {
  it('calcula el caso normal', () => {
    expect(calculateCpc({ adSpend: 500, clicks: 250 }).value).toBe(2);
  });

  it('rechaza cero clics', () => {
    expect(calculateCpc({ adSpend: 500, clicks: 0 }).value).toBeUndefined();
  });

  it('rechaza campos vacíos', () => {
    expect(calculateCpc({}).value).toBeUndefined();
  });
});
