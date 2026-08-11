import { formatCOP, formatDistance, formatPriceRange } from '../format';

describe('formatCOP', () => {
  it('agrupa los miles con punto, al estilo colombiano', () => {
    expect(formatCOP(80000)).toBe('$80.000');
    expect(formatCOP(1234567)).toBe('$1.234.567');
  });

  it('redondea decimales', () => {
    expect(formatCOP(19999.6)).toBe('$20.000');
  });

  it('no agrega separador para montos menores a mil', () => {
    expect(formatCOP(500)).toBe('$500');
  });
});

describe('formatPriceRange', () => {
  it('muestra un rango cuando min y max difieren', () => {
    expect(formatPriceRange(30000, 80000)).toBe('$30.000 - $80.000');
  });

  it('muestra un solo valor cuando min y max son iguales', () => {
    expect(formatPriceRange(50000, 50000)).toBe('$50.000');
  });

  it('usa el valor disponible cuando el otro es null', () => {
    expect(formatPriceRange(50000, null)).toBe('$50.000');
    expect(formatPriceRange(null, 50000)).toBe('$50.000');
  });

  it('indica que no hay precio cuando ambos son null', () => {
    expect(formatPriceRange(null, null)).toBe('Precio no disponible');
  });
});

describe('formatDistance', () => {
  it('muestra metros redondeados por debajo de 1 km', () => {
    expect(formatDistance(850)).toBe('850 m');
    expect(formatDistance(999.6)).toBe('1000 m');
  });

  it('muestra kilómetros con un decimal a partir de 1 km', () => {
    expect(formatDistance(1000)).toBe('1.0 km');
    expect(formatDistance(2340)).toBe('2.3 km');
  });
});
