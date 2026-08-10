import { describe, expect, it } from 'vitest';
import { calculateRoi } from './roi';

describe('ROI', () => {
  it('calcula una ganancia neta positiva', () => {
    const result = calculateRoi({ investment: 1000, gain: 1500 });
    expect(result.value).toBe(50);
  });

  it('calcula una pérdida neta (ROI negativo)', () => {
    const result = calculateRoi({ investment: 1000, gain: 800 });
    expect(result.value).toBe(-20);
  });

  it('caso extremo: ganancia igual a la inversión (ROI de 0%)', () => {
    const result = calculateRoi({ investment: 1000, gain: 1000 });
    expect(result.value).toBe(0);
  });

  it('rechaza inversión de cero', () => {
    const result = calculateRoi({ investment: 0, gain: 100 });
    expect(result.value).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('rechaza campos vacíos', () => {
    const result = calculateRoi({});
    expect(result.value).toBeUndefined();
  });
});
