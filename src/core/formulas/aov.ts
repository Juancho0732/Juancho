import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * AOV — Average Order Value (Ticket promedio)
 * Fórmula: Ingresos / Número de pedidos
 */
export interface AovInputs {
  revenue: number;
  ordersCount: number;
}

export function validateAovInputs(inputs: Partial<AovInputs>): ValidationResult {
  const issues = [
    ...requireFields({ revenue: inputs.revenue, ordersCount: inputs.ordersCount }),
    ...forbidNegative({ revenue: inputs.revenue, ordersCount: inputs.ordersCount }),
  ];
  if (inputs.ordersCount !== undefined && inputs.ordersCount === 0) {
    issues.push({ field: 'ordersCount', severity: 'error', message: 'El número de pedidos no puede ser cero.' });
  }
  return buildValidationResult(issues);
}

export function calculateAov(inputs: Partial<AovInputs>): MetricResult<AovInputs> {
  const validation = validateAovInputs(inputs);
  if (!validation.valid || inputs.revenue === undefined || inputs.ordersCount === undefined) {
    return { value: undefined, unit: 'currency', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.revenue, inputs.ordersCount);
  return { value, unit: 'currency', breakdown: { revenue: inputs.revenue, ordersCount: inputs.ordersCount } };
}

export function interpretAov(result: MetricResult<AovInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Cada pedido genera en promedio ${result.value.toLocaleString('es', { maximumFractionDigits: 0 })}.`;
}
