import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/** CTR — Click-Through Rate. Fórmula: (Clics / Impresiones) × 100 */
export interface CtrInputs {
  clicks: number;
  impressions: number;
}

export function validateCtrInputs(inputs: Partial<CtrInputs>): ValidationResult {
  const issues = [
    ...requireFields({ clicks: inputs.clicks, impressions: inputs.impressions }),
    ...forbidNegative({ clicks: inputs.clicks, impressions: inputs.impressions }),
  ];
  if (inputs.impressions !== undefined && inputs.impressions === 0) {
    issues.push({ field: 'impressions', severity: 'error', message: 'Las impresiones no pueden ser cero.' });
  }
  if (inputs.clicks !== undefined && inputs.impressions !== undefined && inputs.clicks > inputs.impressions) {
    issues.push({ field: 'clicks', severity: 'error', message: 'Los clics no pueden ser más que las impresiones.' });
  }
  return buildValidationResult(issues);
}

export function calculateCtr(inputs: Partial<CtrInputs>): MetricResult<CtrInputs> {
  const validation = validateCtrInputs(inputs);
  if (!validation.valid || inputs.clicks === undefined || inputs.impressions === undefined) {
    return { value: undefined, unit: 'percent', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const ratio = safeDivide(inputs.clicks, inputs.impressions);
  return {
    value: ratio === undefined ? undefined : ratio * 100,
    unit: 'percent',
    breakdown: { clicks: inputs.clicks, impressions: inputs.impressions },
  };
}

export function interpretCtr(result: MetricResult<CtrInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `De cada 100 personas que vieron tu anuncio, ${result.value.toFixed(2)} hicieron clic.`;
}
