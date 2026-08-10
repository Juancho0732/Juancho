import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * ARPU — Average Revenue Per User
 * Fórmula: Ingresos del periodo / Usuarios activos en ese mismo periodo
 *
 * Distinción respecto a "Revenue per customer": ARPU es una métrica
 * PERIÓDICA (ingresos de un mes / usuarios activos ese mes), típica de
 * modelos recurrentes. "Revenue per customer" (ver revenuePerCustomer.ts)
 * es acumulada: ingresos totales históricos / clientes totales.
 */
export interface ArpuInputs {
  revenue: number;
  activeUsers: number;
}

export function validateArpuInputs(inputs: Partial<ArpuInputs>): ValidationResult {
  const issues = [
    ...requireFields({ revenue: inputs.revenue, activeUsers: inputs.activeUsers }),
    ...forbidNegative({ revenue: inputs.revenue, activeUsers: inputs.activeUsers }),
  ];
  if (inputs.activeUsers !== undefined && inputs.activeUsers === 0) {
    issues.push({ field: 'activeUsers', severity: 'error', message: 'Los usuarios activos no pueden ser cero.' });
  }
  return buildValidationResult(issues);
}

export function calculateArpu(inputs: Partial<ArpuInputs>): MetricResult<ArpuInputs> {
  const validation = validateArpuInputs(inputs);
  if (!validation.valid || inputs.revenue === undefined || inputs.activeUsers === undefined) {
    return { value: undefined, unit: 'currency', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.revenue, inputs.activeUsers);
  return { value, unit: 'currency', breakdown: { revenue: inputs.revenue, activeUsers: inputs.activeUsers } };
}

export function interpretArpu(result: MetricResult<ArpuInputs>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Cada usuario activo genera en promedio ${result.value.toLocaleString('es', { maximumFractionDigits: 0 })} en este periodo.`;
}
