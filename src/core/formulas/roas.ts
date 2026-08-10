import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * ROAS — Return On Ad Spend
 *
 * Fórmula: Ingresos atribuidos a publicidad / Gasto publicitario
 *
 * IMPORTANTE: ROAS no equivale a rentabilidad. Es un ratio de ingresos, no
 * de beneficio: no descuenta el coste de los productos/servicios vendidos
 * ni otros gastos operativos. Un ROAS alto con márgenes bajos puede seguir
 * siendo una campaña poco o nada rentable (ver ROI).
 */
export interface RoasInputs {
  adSpend: number;
  attributedRevenue: number;
}

export interface RoasBreakdown {
  adSpend: number;
  attributedRevenue: number;
}

export function validateRoasInputs(inputs: Partial<RoasInputs>): ValidationResult {
  const issues = [
    ...requireFields({ adSpend: inputs.adSpend, attributedRevenue: inputs.attributedRevenue }),
    ...forbidNegative({ adSpend: inputs.adSpend, attributedRevenue: inputs.attributedRevenue }),
  ];
  if (inputs.adSpend !== undefined && inputs.adSpend === 0) {
    issues.push({ field: 'adSpend', severity: 'error', message: 'El gasto publicitario no puede ser cero para calcular el ROAS.' });
  }
  return buildValidationResult(issues);
}

export function calculateRoas(inputs: Partial<RoasInputs>): MetricResult<RoasBreakdown> {
  const validation = validateRoasInputs(inputs);
  if (!validation.valid || inputs.adSpend === undefined || inputs.attributedRevenue === undefined) {
    return { value: undefined, unit: 'ratio', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.attributedRevenue, inputs.adSpend);
  return { value, unit: 'ratio', breakdown: { adSpend: inputs.adSpend, attributedRevenue: inputs.attributedRevenue } };
}

export function interpretRoas(result: MetricResult<RoasBreakdown>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Por cada 1 invertido en publicidad se generaron ${result.value.toFixed(2)} de ingresos atribuidos. Esto no significa que la campaña sea rentable: aún falta descontar el costo de lo vendido y otros gastos.`;
}
