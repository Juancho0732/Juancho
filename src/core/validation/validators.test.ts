import { describe, expect, it } from 'vitest';
import { safeDivide, isMissing, isNegative, forbidNegative, requireFields } from './validators';

describe('safeDivide', () => {
  it('divide normalmente', () => {
    expect(safeDivide(10, 2)).toBe(5);
  });

  it('devuelve undefined al dividir entre cero', () => {
    expect(safeDivide(10, 0)).toBeUndefined();
  });

  it('devuelve undefined si falta el numerador o el denominador', () => {
    expect(safeDivide(undefined, 2)).toBeUndefined();
    expect(safeDivide(10, undefined)).toBeUndefined();
  });

  it('devuelve undefined con valores no finitos', () => {
    expect(safeDivide(Infinity, 2)).toBeUndefined();
    expect(safeDivide(NaN, 2)).toBeUndefined();
  });
});

describe('isMissing / isNegative', () => {
  it('detecta valores ausentes', () => {
    expect(isMissing(undefined)).toBe(true);
    expect(isMissing(NaN)).toBe(true);
    expect(isMissing(0)).toBe(false);
  });

  it('detecta valores negativos', () => {
    expect(isNegative(-1)).toBe(true);
    expect(isNegative(0)).toBe(false);
    expect(isNegative(undefined)).toBe(false);
  });
});

describe('requireFields / forbidNegative', () => {
  it('reporta campos vacíos', () => {
    const issues = requireFields({ a: undefined, b: 5 });
    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe('a');
  });

  it('reporta campos negativos', () => {
    const issues = forbidNegative({ a: -5, b: 5 });
    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe('a');
  });
});
