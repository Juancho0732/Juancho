import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * LTV:CAC — ratio de eficiencia de adquisición.
 *
 * Fórmula: LTV / CAC
 *
 * Se presenta como ratio ("3.2x"). Los benchmarks habituales en la industria
 * (p. ej. "3x es sano") son solo referencias externas, no reglas universales:
 * la app los muestra etiquetados como tal y nunca como un umbral absoluto de
 * corrección/incorrección.
 */
export interface LtvCacInputs {
  ltv: number;
  cac: number;
}

export interface LtvCacBreakdown {
  ltv: number;
  cac: number;
}

export function validateLtvCacInputs(inputs: Partial<LtvCacInputs>): ValidationResult {
  const issues = [
    ...requireFields({ ltv: inputs.ltv, cac: inputs.cac }),
    ...forbidNegative({ ltv: inputs.ltv, cac: inputs.cac }),
  ];
  if (inputs.cac !== undefined && inputs.cac === 0) {
    issues.push({ field: 'cac', severity: 'error', message: 'El CAC no puede ser cero para calcular el ratio LTV:CAC.' });
  }
  return buildValidationResult(issues);
}

export function calculateLtvCac(inputs: Partial<LtvCacInputs>): MetricResult<LtvCacBreakdown> {
  const validation = validateLtvCacInputs(inputs);
  if (!validation.valid || inputs.ltv === undefined || inputs.cac === undefined) {
    return { value: undefined, unit: 'ratio', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.ltv, inputs.cac);
  return { value, unit: 'ratio', breakdown: { ltv: inputs.ltv, cac: inputs.cac } };
}

/** Referencia de industria citada habitualmente. NO es una regla absoluta: se etiqueta como tal en la UI. */
export const LTV_CAC_REFERENCE_BENCHMARK = 3;

export function interpretLtvCac(result: MetricResult<LtvCacBreakdown>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Por cada 1 gastado en adquirir un cliente, tu negocio recupera aproximadamente ${result.value.toFixed(1)} en valor de ese cliente a lo largo del tiempo.`;
}
