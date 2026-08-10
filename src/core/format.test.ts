import { describe, expect, it } from 'vitest';
import { formatMetricValue, humanizeBreakdownKey } from './format';

describe('formatMetricValue', () => {
  it('formatea moneda', () => {
    expect(formatMetricValue({ value: 240000, unit: 'currency' }, 'USD')).toContain('240.000');
  });

  it('formatea porcentaje', () => {
    expect(formatMetricValue({ value: 12.345, unit: 'percent' })).toBe('12.3%');
  });

  it('formatea ratio', () => {
    expect(formatMetricValue({ value: 3.2, unit: 'ratio' })).toBe('3.2x');
  });

  it('formatea meses', () => {
    expect(formatMetricValue({ value: 6, unit: 'months' })).toBe('6.0 meses');
  });

  it('devuelve un guion cuando no hay valor', () => {
    expect(formatMetricValue({ value: undefined, unit: 'currency' })).toBe('—');
  });
});

describe('humanizeBreakdownKey', () => {
  it('usa la etiqueta en español mapeada cuando existe', () => {
    expect(humanizeBreakdownKey('totalAcquisitionCost')).toBe('Costo total de adquisición');
  });

  it('genera un fallback legible para claves no mapeadas', () => {
    expect(humanizeBreakdownKey('someRandomField')).toBe('Some random field');
  });
});
