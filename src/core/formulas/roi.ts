import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, requireFields, safeDivide } from '../validation/validators';

/**
 * ROI — Return On Investment
 *
 * Fórmula: (Ganancia obtenida − Inversión) / Inversión × 100
 *
 * Diferencia clave con ROAS: ROI descuenta la inversión del resultado (mide
 * beneficio neto sobre lo invertido), mientras que ROAS es un ratio bruto de
 * ingresos sobre gasto publicitario y nunca resta el gasto. Dos campañas con
 * el mismo ROAS pueden tener ROI muy distinto si sus márgenes difieren.
 *
 * "Ganancia obtenida" (`gain`) se interpreta como el beneficio total
 * generado por la inversión (ingresos ya menos costes asociados), no como
 * ingresos brutos — de lo contrario ROI y ROAS colapsarían en la misma cifra.
 */
export interface RoiInputs {
  investment: number;
  gain: number;
}

export interface RoiBreakdown {
  investment: number;
  gain: number;
  netProfit: number;
}

export function validateRoiInputs(inputs: Partial<RoiInputs>): ValidationResult {
  const issues = requireFields({ investment: inputs.investment, gain: inputs.gain });
  if (inputs.investment !== undefined && inputs.investment <= 0) {
    issues.push({ field: 'investment', severity: 'error', message: 'La inversión debe ser mayor que cero para calcular el ROI.' });
  }
  return buildValidationResult(issues);
}

export function calculateRoi(inputs: Partial<RoiInputs>): MetricResult<RoiBreakdown> {
  const validation = validateRoiInputs(inputs);
  if (!validation.valid || inputs.investment === undefined || inputs.gain === undefined) {
    return { value: undefined, unit: 'percent', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const netProfit = inputs.gain - inputs.investment;
  const value = safeDivide(netProfit, inputs.investment);
  return {
    value: value === undefined ? undefined : value * 100,
    unit: 'percent',
    breakdown: { investment: inputs.investment, gain: inputs.gain, netProfit },
  };
}

export function interpretRoi(result: MetricResult<RoiBreakdown>): string | undefined {
  if (result.value === undefined || !result.breakdown) return undefined;
  const sign = result.value >= 0 ? 'una ganancia' : 'una pérdida';
  return `La inversión generó ${sign} neta del ${Math.abs(result.value).toFixed(1)}% sobre lo invertido (beneficio neto de ${result.breakdown.netProfit.toLocaleString('es', { maximumFractionDigits: 0 })}).`;
}
