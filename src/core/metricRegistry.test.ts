import { describe, expect, it } from 'vitest';
import { METRIC_REGISTRY, getMetricDefinition } from './metricRegistry';

describe('METRIC_REGISTRY', () => {
  it('tiene ids únicos', () => {
    const ids = METRIC_REGISTRY.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada métrica tiene compute e interpret', () => {
    for (const metric of METRIC_REGISTRY) {
      expect(typeof metric.compute).toBe('function');
      expect(typeof metric.interpret).toBe('function');
    }
  });

  it('cada métrica calcula sin lanzar excepción con inputs vacíos', () => {
    for (const metric of METRIC_REGISTRY) {
      expect(() => metric.compute({}, {})).not.toThrow();
    }
  });

  it('getMetricDefinition encuentra CAC por id', () => {
    expect(getMetricDefinition('cac')?.shortName).toBe('CAC');
  });

  it('getMetricDefinition devuelve undefined para un id inexistente', () => {
    expect(getMetricDefinition('no-existe')).toBeUndefined();
  });
});
