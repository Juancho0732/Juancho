import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * Churn rate (tasa de cancelación)
 * Fórmula: Clientes perdidos / Clientes al inicio del periodo × 100
 */
export interface ChurnInputs {
  customersStart: number;
  customersLost: number;
}

export function validateChurnInputs(inputs: Partial<ChurnInputs>): ValidationResult {
  const issues = [
    ...requireFields({ customersStart: inputs.customersStart, customersLost: inputs.customersLost }),
    ...forbidNegative({ customersStart: inputs.customersStart, customersLost: inputs.customersLost }),
  ];
  if (inputs.customersStart !== undefined && inputs.customersStart === 0) {
    issues.push({ field: 'customersStart', severity: 'error', message: 'Los clientes al inicio del periodo no pueden ser cero.' });
  }
  if (
    inputs.customersStart !== undefined &&
    inputs.customersLost !== undefined &&
    inputs.customersLost > inputs.customersStart
  ) {
    issues.push({
      field: 'customersLost',
      severity: 'error',
      message: 'Los clientes perdidos no pueden ser más que los clientes al inicio del periodo.',
    });
  }
  return buildValidationResult(issues);
}

export function calculateChurn(inputs: Partial<ChurnInputs>): MetricResult<ChurnInputs> {
  const validation = validateChurnInputs(inputs);
  if (!validation.valid || inputs.customersStart === undefined || inputs.customersLost === undefined) {
    return { value: undefined, unit: 'percent', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.customersLost, inputs.customersStart);
  return {
    value: value === undefined ? undefined : value * 100,
    unit: 'percent',
    breakdown: { customersStart: inputs.customersStart, customersLost: inputs.customersLost },
  };
}

export function interpretChurn(result: MetricResult<ChurnInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Perdiste al ${result.value.toFixed(1)}% de tus clientes en este periodo.`;
}
