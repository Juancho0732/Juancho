import type { MetricResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';
import type { ValidationResult } from '../types';

/**
 * CAC — Customer Acquisition Cost
 *
 * Fórmula elegida (fully-loaded simple):
 *   CAC = (Gasto de marketing + Gasto de ventas) / Nuevos clientes adquiridos
 *
 * Variaciones conocidas en la industria:
 *  - CAC "solo marketing": excluye el gasto de ventas. Más fácil de calcular
 *    pero subestima el coste real de adquisición cuando hay equipo comercial.
 *  - CAC "fully loaded": añade además salarios de marketing/ventas, herramientas
 *    y overhead. Es el más preciso pero requiere datos que un usuario no
 *    siempre tiene a mano en una primera pasada.
 *  - Aquí usamos el punto intermedio (marketing + ventas) porque es el
 *    estándar más citado y el usuario decide qué incluir en cada campo.
 */
export interface CacInputs {
  marketingSpend: number;
  salesSpend: number;
  newCustomers: number;
}

export interface CacBreakdown {
  totalAcquisitionCost: number;
  newCustomers: number;
}

export function validateCacInputs(inputs: Partial<CacInputs>): ValidationResult {
  const issues = [
    ...requireFields({
      marketingSpend: inputs.marketingSpend,
      salesSpend: inputs.salesSpend,
      newCustomers: inputs.newCustomers,
    }),
    ...forbidNegative({
      marketingSpend: inputs.marketingSpend,
      salesSpend: inputs.salesSpend,
      newCustomers: inputs.newCustomers,
    }),
  ];
  if (inputs.newCustomers !== undefined && inputs.newCustomers === 0) {
    issues.push({
      field: 'newCustomers',
      severity: 'error',
      message: 'No se puede calcular el CAC sin al menos un cliente nuevo adquirido.',
    });
  }
  return buildValidationResult(issues);
}

export function calculateCac(inputs: Partial<CacInputs>): MetricResult<CacBreakdown> {
  const { marketingSpend, salesSpend, newCustomers } = inputs;
  const validation = validateCacInputs(inputs);
  if (!validation.valid || marketingSpend === undefined || salesSpend === undefined || newCustomers === undefined) {
    return { value: undefined, unit: 'currency', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }

  const totalAcquisitionCost = marketingSpend + salesSpend;
  const value = safeDivide(totalAcquisitionCost, newCustomers);

  return {
    value,
    unit: 'currency',
    breakdown: { totalAcquisitionCost, newCustomers },
  };
}

/** Interpretación en lenguaje sencillo. No inventa datos: solo usa el resultado ya calculado. */
export function interpretCac(result: MetricResult<CacBreakdown>): string | undefined {
  if (result.value === undefined) return undefined;
  return `Tu empresa está gastando ${result.value.toLocaleString('es', { maximumFractionDigits: 0 })} para adquirir cada cliente nuevo.`;
}
