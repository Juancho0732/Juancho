import type { MetricResult, ValidationResult } from '../types';
import { validateChurnInputs, type ChurnInputs } from './churn';

/**
 * Retention rate (tasa de retención)
 *
 * Fórmula elegida (complemento simple del churn):
 *   Retención % = 100 − Churn %
 *
 * Variación más rigurosa usada en SaaS (no implementada en el MVP porque
 * requiere un dato adicional que no todos los usuarios tienen a mano):
 *   Retención % = (Clientes al final − Clientes nuevos en el periodo)
 *                 / Clientes al inicio × 100
 * Esa fórmula excluye a los clientes nuevos del cálculo, evitando que la
 * adquisición "maquille" la retención real de la base de clientes existente.
 */
export function validateRetentionInputs(inputs: Partial<ChurnInputs>): ValidationResult {
  return validateChurnInputs(inputs);
}

export function calculateRetention(inputs: Partial<ChurnInputs>): MetricResult<ChurnInputs> {
  const validation = validateRetentionInputs(inputs);
  if (!validation.valid || inputs.customersStart === undefined || inputs.customersLost === undefined) {
    return { value: undefined, unit: 'percent', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const churnRate = (inputs.customersLost / inputs.customersStart) * 100;
  return {
    value: 100 - churnRate,
    unit: 'percent',
    breakdown: { customersStart: inputs.customersStart, customersLost: inputs.customersLost },
  };
}

export function interpretRetention(result: MetricResult<ChurnInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Conservaste al ${result.value.toFixed(1)}% de tus clientes durante este periodo.`;
}
