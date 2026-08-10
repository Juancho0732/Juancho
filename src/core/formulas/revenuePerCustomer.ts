import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * Revenue per Customer
 * Fórmula: Ingresos totales / Número total de clientes
 *
 * Distinción respecto a ARPU (ver arpu.ts): esta métrica es ACUMULADA
 * (ingresos totales históricos entre todos los clientes que ha tenido el
 * negocio), mientras que ARPU es periódica (ingresos de un mes entre
 * usuarios activos ese mismo mes). Ambas responden preguntas distintas y
 * por eso se mantienen como calculadoras separadas.
 */
export interface RevenuePerCustomerInputs {
  revenue: number;
  totalCustomers: number;
}

export function validateRevenuePerCustomerInputs(inputs: Partial<RevenuePerCustomerInputs>): ValidationResult {
  const issues = [
    ...requireFields({ revenue: inputs.revenue, totalCustomers: inputs.totalCustomers }),
    ...forbidNegative({ revenue: inputs.revenue, totalCustomers: inputs.totalCustomers }),
  ];
  if (inputs.totalCustomers !== undefined && inputs.totalCustomers === 0) {
    issues.push({ field: 'totalCustomers', severity: 'error', message: 'El número de clientes no puede ser cero.' });
  }
  return buildValidationResult(issues);
}

export function calculateRevenuePerCustomer(inputs: Partial<RevenuePerCustomerInputs>): MetricResult<RevenuePerCustomerInputs> {
  const validation = validateRevenuePerCustomerInputs(inputs);
  if (!validation.valid || inputs.revenue === undefined || inputs.totalCustomers === undefined) {
    return { value: undefined, unit: 'currency', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.revenue, inputs.totalCustomers);
  return { value, unit: 'currency', breakdown: { revenue: inputs.revenue, totalCustomers: inputs.totalCustomers } };
}

export function interpretRevenuePerCustomer(result: MetricResult<RevenuePerCustomerInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `A lo largo de la relación con tu negocio, cada cliente ha generado en promedio ${result.value.toLocaleString('es', { maximumFractionDigits: 0 })}.`;
}
