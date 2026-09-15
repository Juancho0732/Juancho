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

  it('textPrimary sobre canvas (títulos de sección sobre el azul): AA de sobra', () => {
    expect(contrastRatio(colors.textPrimary, colors.canvas)).toBeGreaterThan(4.5);
  });

  it('textSecondary sobre canvas: AA — hay texto secundario que cae directo en el lienzo, no solo dentro de tarjetas', () => {
    expect(contrastRatio(colors.textSecondary, colors.canvas)).toBeGreaterThanOrEqual(4.5);
  });

  it('primary sobre surface (texto vino sobre los chips amarillos): AA de sobra', () => {
    expect(contrastRatio(colors.primary, colors.surface)).toBeGreaterThan(4.5);
  });

  it('onPrimaryMuted sobre background (tab inactivo sobre la barra vino): mínimo 3:1 de componente UI', () => {
    // Un tab inactivo es deliberadamente de menor jerarquía que el activo, así
    // que se le exige el 3:1 de componentes gráficos, no el 4.5:1 de texto.
    expect(contrastRatio(colors.onPrimaryMuted, colors.background)).toBeGreaterThanOrEqual(3);
  });

  it('border sobre background (estrella vacía de StarRating): mínimo 3:1 de componente UI', () => {
    expect(contrastRatio(colors.border, colors.background)).toBeGreaterThanOrEqual(3);
  });

  it('textInverse sobre accent (inicial dentro de la miniatura azul): AA de sobra', () => {
    expect(contrastRatio(colors.textInverse, colors.accent)).toBeGreaterThan(4.5);
  });

  it('RIESGO RESUELTO: rating sobre background (glifo ★ de StarRating) ya supera el 3:1 de componentes gráficos/UI', () => {
    // Este test registraba lo contrario: el amarillo sobre fondo claro no
    // llegaba ni a 3:1, y se dejó documentado con la instrucción de
    // convertirlo en una aserción positiva si alguna vez el color pasaba.
    // Eso ocurrió, pero no por tocar el amarillo: al invertir el tema a fondo
    // vino, el mismo #F7CB34 pasó a leerse sobre oscuro y hoy da ~7.7:1.
    const ratio = contrastRatio(colors.rating, colors.background);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});
