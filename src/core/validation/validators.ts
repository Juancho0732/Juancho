import type { ValidationIssue, ValidationResult } from '../types';

/**
 * División segura: evita NaN/Infinity y devuelve undefined cuando el
 * denominador es cero o cualquiera de los operandos no es un número finito.
 */
export function safeDivide(numerator: number | undefined, denominator: number | undefined): number | undefined {
  if (numerator === undefined || denominator === undefined) return undefined;
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return undefined;
  if (denominator === 0) return undefined;
  return numerator / denominator;
}

export function isMissing(value: number | undefined): boolean {
  return value === undefined || value === null || Number.isNaN(value);
}

export function isNegative(value: number | undefined): boolean {
  return value !== undefined && value < 0;
}

/** Combina varias comprobaciones en un único ValidationResult. */
export function buildValidationResult(issues: ValidationIssue[]): ValidationResult {
  return {
    valid: !issues.some((i) => i.severity === 'error'),
    issues,
  };
}

/** Comprobaciones genéricas reutilizables por las validaciones específicas de cada fórmula. */
export function requireFields(
  fields: Record<string, number | undefined>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [field, value] of Object.entries(fields)) {
    if (isMissing(value)) {
      issues.push({ field, severity: 'error', message: `El campo "${field}" es obligatorio.` });
    }
  }
  return issues;
}

export function forbidNegative(
  fields: Record<string, number | undefined>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [field, value] of Object.entries(fields)) {
    if (isNegative(value)) {
      issues.push({ field, severity: 'error', message: `El campo "${field}" no puede ser negativo.` });
    }
  }
  return issues;
}

/** Comprueba que un porcentaje introducido directamente (0-100) sea válido. */
export function validatePercentRange(field: string, value: number | undefined): ValidationIssue[] {
  if (value === undefined) return [];
  if (value < 0 || value > 100) {
    return [{ field, severity: 'error', message: `El campo "${field}" debe estar entre 0 y 100.` }];
  }
  return [];
}
