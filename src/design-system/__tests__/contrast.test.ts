import { contrastRatio } from '../contrast';
import { colors } from '../tokens';

describe('contrastRatio', () => {
  it('el mismo color no tiene contraste (1:1)', () => {
    expect(contrastRatio('#000000', '#000000')).toBeCloseTo(1, 5);
  });

  it('negro sobre blanco es el máximo (21:1)', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });
});

describe('Prioridad 14 (accesibilidad): contraste de los pares de color que la app realmente usa', () => {
  it('textPrimary sobre background: AA de sobra', () => {
    expect(contrastRatio(colors.textPrimary, colors.background)).toBeGreaterThan(4.5);
  });

  it('textSecondary sobre background: AA (texto normal, incluida la variante caption)', () => {
    expect(contrastRatio(colors.textSecondary, colors.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('onPrimary sobre primary (texto de los botones): AA de sobra', () => {
    expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThan(4.5);
  });

  it('textInverse sobre textPrimary (fondo del Toast, Prioridad 6): AA de sobra', () => {
    expect(contrastRatio(colors.textInverse, colors.textPrimary)).toBeGreaterThan(4.5);
  });

  it('danger sobre background (mensajes de error): AA, aunque al límite', () => {
    expect(contrastRatio(colors.danger, colors.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('favorite sobre background (corazón de favoritos): AA, aunque al límite', () => {
    expect(contrastRatio(colors.favorite, colors.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('RIESGO DOCUMENTADO: rating sobre background (glifo ★ de StarRating) no llega ni al mínimo de 3:1 para componentes gráficos/UI', () => {
    // No se cambia el color acá a propósito -- es una decisión de marca/diseño
    // ("no cambies colores de forma arbitraria"), no algo para decidir en una
    // auditoría. Este test deja el hallazgo registrado y visible en la suite
    // en vez de dejarlo solo en un documento aparte: si alguien "arregla" el
    // color más adelante, este test empieza a fallar y hay que actualizarlo
    // a una aserción de que SÍ pasa -- lo cual es la señal correcta.
    const ratio = contrastRatio(colors.rating, colors.background);
    expect(ratio).toBeLessThan(3);
  });
});
