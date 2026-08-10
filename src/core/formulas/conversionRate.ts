import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/** Conversion Rate. Fórmula: (Conversiones / Visitantes) × 100 */
export interface ConversionRateInputs {
  conversions: number;
  visitors: number;
}

export function validateConversionRateInputs(inputs: Partial<ConversionRateInputs>): ValidationResult {
  const issues = [
    ...requireFields({ conversions: inputs.conversions, visitors: inputs.visitors }),
    ...forbidNegative({ conversions: inputs.conversions, visitors: inputs.visitors }),
  ];
  if (inputs.visitors !== undefined && inputs.visitors === 0) {
    issues.push({ field: 'visitors', severity: 'error', message: 'Los visitantes no pueden ser cero.' });
  }
  if (inputs.conversions !== undefined && inputs.visitors !== undefined && inputs.conversions > inputs.visitors) {
    issues.push({ field: 'conversions', severity: 'error', message: 'Las conversiones no pueden ser más que los visitantes.' });
  }
  return buildValidationResult(issues);
}

export function calculateConversionRate(inputs: Partial<ConversionRateInputs>): MetricResult<ConversionRateInputs> {
  const validation = validateConversionRateInputs(inputs);
  if (!validation.valid || inputs.conversions === undefined || inputs.visitors === undefined) {
    return { value: undefined, unit: 'percent', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const ratio = safeDivide(inputs.conversions, inputs.visitors);
  return {
    value: ratio === undefined ? undefined : ratio * 100,
    unit: 'percent',
    breakdown: { conversions: inputs.conversions, visitors: inputs.visitors },
  };
}

export function interpretConversionRate(result: MetricResult<ConversionRateInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `De cada 100 visitantes, ${result.value.toFixed(2)} completan la conversión.`;
}
