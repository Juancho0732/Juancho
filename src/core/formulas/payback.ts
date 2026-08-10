import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * Payback Period — tiempo para recuperar el CAC.
 *
 * Fórmula: CAC / Margen mensual por cliente
 *
 * Deliberadamente usa el MARGEN generado por el cliente cada mes, no sus
 * ingresos: pagar de vuelta el CAC con ingresos brutos ignora el coste de
 * servir a ese cliente y sobreestima la velocidad real de recuperación.
 * Resultado expresado en meses.
 */
export interface PaybackInputs {
  cac: number;
  monthlyMarginPerCustomer: number;
}

export interface PaybackBreakdown {
  cac: number;
  monthlyMarginPerCustomer: number;
}

export function validatePaybackInputs(inputs: Partial<PaybackInputs>): ValidationResult {
  const issues = [
    ...requireFields({ cac: inputs.cac, monthlyMarginPerCustomer: inputs.monthlyMarginPerCustomer }),
    ...forbidNegative({ cac: inputs.cac }),
  ];
  if (inputs.monthlyMarginPerCustomer !== undefined && inputs.monthlyMarginPerCustomer <= 0) {
    issues.push({
      field: 'monthlyMarginPerCustomer',
      severity: 'error',
      message: 'El margen mensual por cliente debe ser mayor que cero: si es cero o negativo, el CAC nunca se recupera.',
    });
  }
  return buildValidationResult(issues);
}

export function calculatePayback(inputs: Partial<PaybackInputs>): MetricResult<PaybackBreakdown> {
  const validation = validatePaybackInputs(inputs);
  if (!validation.valid || inputs.cac === undefined || inputs.monthlyMarginPerCustomer === undefined) {
    return { value: undefined, unit: 'months', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.cac, inputs.monthlyMarginPerCustomer);
  return {
    value,
    unit: 'months',
    breakdown: { cac: inputs.cac, monthlyMarginPerCustomer: inputs.monthlyMarginPerCustomer },
  };
}

export function interpretPayback(result: MetricResult<PaybackBreakdown>): string | undefined {
  if (result.value === undefined || !result.breakdown) return undefined;
  const { cac, monthlyMarginPerCustomer } = result.breakdown;
  return `Con un CAC de ${cac.toLocaleString('es', { maximumFractionDigits: 0 })} y un margen mensual por cliente de ${monthlyMarginPerCustomer.toLocaleString('es', { maximumFractionDigits: 0 })}, necesitas aproximadamente ${result.value.toFixed(1)} meses para recuperar el costo de adquisición.`;
}
