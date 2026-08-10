import { describe, expect, it } from 'vitest';
import { computeTrend } from './trend';

describe('computeTrend', () => {
  it('detecta una subida', () => {
    expect(computeTrend(120, 100)?.direction).toBe('up');
  });

  it('detecta una bajada', () => {
    expect(computeTrend(80, 100)?.direction).toBe('down');
  });

  it('detecta valores estables como flat', () => {
    expect(computeTrend(100.01, 100)?.direction).toBe('flat');
  });

  it('devuelve undefined sin dato anterior', () => {
    expect(computeTrend(100, undefined)).toBeUndefined();
  });

  it('devuelve undefined si el valor anterior es cero (evita división entre cero)', () => {
    expect(computeTrend(100, 0)).toBeUndefined();
  });

  it('calcula correctamente el porcentaje de cambio con un valor anterior negativo', () => {
    const trend = computeTrend(-50, -100);
    expect(trend?.changePercent).toBeCloseTo(50, 5);
    expect(trend?.direction).toBe('up');
  });
});
