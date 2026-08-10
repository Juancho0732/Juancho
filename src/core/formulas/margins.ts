import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * Margen bruto y margen neto.
 *
 * Margen bruto = Ingresos − Costo de bienes vendidos (COGS)
 * Margen bruto % = Margen bruto / Ingresos × 100
 *
 * Margen neto = Ingresos − COGS − Gastos operativos (y otros costes, según
 * lo que el usuario incluya en "gastos operativos")
 * Margen neto % = Margen neto / Ingresos × 100
 */
export interface GrossMarginInputs {
  revenue: number;
  cogs: number;
}

export interface GrossMarginBreakdown {
  revenue: number;
  cogs: number;
  grossMarginAmount: number;
}

export function validateGrossMarginInputs(inputs: Partial<GrossMarginInputs>): ValidationResult {
  const issues = [
    ...requireFields({ revenue: inputs.revenue, cogs: inputs.cogs }),
    ...forbidNegative({ revenue: inputs.revenue, cogs: inputs.cogs }),
  ];
  if (inputs.revenue !== undefined && inputs.revenue === 0) {
    issues.push({ field: 'revenue', severity: 'error', message: 'Los ingresos no pueden ser cero para calcular el margen.' });
  }
  if (inputs.revenue !== undefined && inputs.cogs !== undefined && inputs.cogs > inputs.revenue) {
    issues.push({
      field: 'cogs',
      severity: 'warning',
      message: 'El costo de bienes vendidos es mayor que los ingresos: el margen bruto será negativo.',
    });
  }
  return buildValidationResult(issues);
}

export function calculateGrossMargin(inputs: Partial<GrossMarginInputs>): MetricResult<GrossMarginBreakdown> {
  const validation = validateGrossMarginInputs(inputs);
  if (!validation.valid || inputs.revenue === undefined || inputs.cogs === undefined) {
    return { value: undefined, unit: 'percent', error: validation.issues.find((i) => i.severity === 'error')?.message ?? 'Datos insuficientes.' };
  }
  const grossMarginAmount = inputs.revenue - inputs.cogs;
  const value = safeDivide(grossMarginAmount, inputs.revenue);
  return {
    value: value === undefined ? undefined : value * 100,
    unit: 'percent',
    breakdown: { revenue: inputs.revenue, cogs: inputs.cogs, grossMarginAmount },
  };
}

export interface NetMarginInputs {
  revenue: number;
  cogs: number;
  operatingExpenses: number;
}

export interface NetMarginBreakdown {
  revenue: number;
  netProfitAmount: number;
}

export function validateNetMarginInputs(inputs: Partial<NetMarginInputs>): ValidationResult {
  const issues = [
    ...requireFields({ revenue: inputs.revenue, cogs: inputs.cogs, operatingExpenses: inputs.operatingExpenses }),
    ...forbidNegative({ revenue: inputs.revenue, cogs: inputs.cogs, operatingExpenses: inputs.operatingExpenses }),
  ];
  if (inputs.revenue !== undefined && inputs.revenue === 0) {
    issues.push({ field: 'revenue', severity: 'error', message: 'Los ingresos no pueden ser cero para calcular el margen.' });
  }
  return buildValidationResult(issues);
}

export function calculateNetMargin(inputs: Partial<NetMarginInputs>): MetricResult<NetMarginBreakdown> {
  const validation = validateNetMarginInputs(inputs);
  if (!validation.valid || inputs.revenue === undefined || inputs.cogs === undefined || inputs.operatingExpenses === undefined) {
    return { value: undefined, unit: 'percent', error: validation.issues.find((i) => i.severity === 'error')?.message ?? 'Datos insuficientes.' };
  }
  const netProfitAmount = inputs.revenue - inputs.cogs - inputs.operatingExpenses;
  const value = safeDivide(netProfitAmount, inputs.revenue);
  return {
    value: value === undefined ? undefined : value * 100,
    unit: 'percent',
    breakdown: { revenue: inputs.revenue, netProfitAmount },
  };
}

export function interpretGrossMargin(result: MetricResult<GrossMarginBreakdown>): string | undefined {
  if (result.value === undefined || !result.breakdown) return undefined;
  return `De cada ${result.breakdown.revenue.toLocaleString('es', { maximumFractionDigits: 0 })} de ingresos, te quedan ${result.breakdown.grossMarginAmount.toLocaleString('es', { maximumFractionDigits: 0 })} (${result.value.toFixed(1)}%) después de cubrir el costo de lo vendido.`;
}

export function interpretNetMargin(result: MetricResult<NetMarginBreakdown>): string | undefined {
  if (result.value === undefined || !result.breakdown) return undefined;
  return `Después de todos los costos y gastos operativos, tu negocio se queda con el ${result.value.toFixed(1)}% de los ingresos (${result.breakdown.netProfitAmount.toLocaleString('es', { maximumFractionDigits: 0 })}).`;
}
