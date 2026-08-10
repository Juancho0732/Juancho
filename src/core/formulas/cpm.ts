import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/** CPM — Cost Per Mille. Fórmula: (Gasto publicitario / Impresiones) × 1000 */
export interface CpmInputs {
  adSpend: number;
  impressions: number;
}

export function validateCpmInputs(inputs: Partial<CpmInputs>): ValidationResult {
  const issues = [
    ...requireFields({ adSpend: inputs.adSpend, impressions: inputs.impressions }),
    ...forbidNegative({ adSpend: inputs.adSpend, impressions: inputs.impressions }),
  ];
  if (inputs.impressions !== undefined && inputs.impressions === 0) {
    issues.push({ field: 'impressions', severity: 'error', message: 'El número de impresiones no puede ser cero.' });
  }
  return buildValidationResult(issues);
}

export function calculateCpm(inputs: Partial<CpmInputs>): MetricResult<CpmInputs> {
  const validation = validateCpmInputs(inputs);
  if (!validation.valid || inputs.adSpend === undefined || inputs.impressions === undefined) {
    return { value: undefined, unit: 'currency', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const perImpression = safeDivide(inputs.adSpend, inputs.impressions);
  const value = perImpression === undefined ? undefined : perImpression * 1000;
  return { value, unit: 'currency', breakdown: { adSpend: inputs.adSpend, impressions: inputs.impressions } };
}

export function interpretCpm(result: MetricResult<CpmInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Cada mil impresiones te cuestan en promedio ${result.value.toLocaleString('es', { maximumFractionDigits: 2 })}.`;
}
