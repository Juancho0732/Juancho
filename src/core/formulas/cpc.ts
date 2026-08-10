import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/** CPC — Cost Per Click. Fórmula: Gasto publicitario / Clics */
export interface CpcInputs {
  adSpend: number;
  clicks: number;
}

export function validateCpcInputs(inputs: Partial<CpcInputs>): ValidationResult {
  const issues = [
    ...requireFields({ adSpend: inputs.adSpend, clicks: inputs.clicks }),
    ...forbidNegative({ adSpend: inputs.adSpend, clicks: inputs.clicks }),
  ];
  if (inputs.clicks !== undefined && inputs.clicks === 0) {
    issues.push({ field: 'clicks', severity: 'error', message: 'El número de clics no puede ser cero.' });
  }
  return buildValidationResult(issues);
}

export function calculateCpc(inputs: Partial<CpcInputs>): MetricResult<CpcInputs> {
  const validation = validateCpcInputs(inputs);
  if (!validation.valid || inputs.adSpend === undefined || inputs.clicks === undefined) {
    return { value: undefined, unit: 'currency', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.adSpend, inputs.clicks);
  return { value, unit: 'currency', breakdown: { adSpend: inputs.adSpend, clicks: inputs.clicks } };
}

export function interpretCpc(result: MetricResult<CpcInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Cada clic te cuesta en promedio ${result.value.toLocaleString('es', { maximumFractionDigits: 2 })}.`;
}
