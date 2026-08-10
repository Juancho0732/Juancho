import type { LtvMethod, MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * CLV / LTV — Customer Lifetime Value
 *
 * Existen múltiples definiciones ampliamente usadas en marketing. Esta app
 * implementa dos y obliga a declarar explícitamente cuál se está usando
 * (el método se guarda a nivel de proyecto/snapshot para que Payback,
 * Diagnóstico, Health Score y Simulador sean consistentes entre sí):
 *
 *  1) "revenue_based" (método histórico simple, por defecto):
 *       LTV = Ticket promedio × Frecuencia de compra anual × Vida del cliente (años)
 *     Intuitivo, útil en retail/e-commerce. Limitación: usa ingresos, no
 *     rentabilidad — puede sobreestimar el valor real de un cliente.
 *
 *  2) "margin_churn_based" (método basado en margen y churn):
 *       LTV = (ARPU × Margen bruto %) / Tasa de churn
 *     Más riguroso, estándar en modelos de suscripción/recurrentes: no
 *     requiere estimar a ojo la "vida del cliente", la deriva del churn.
 *     Requiere ARPU, margen bruto % y churn (no cero).
 *
 * Ambos métodos son válidos; cuál es "mejor" depende del modelo de negocio,
 * por eso la app no impone uno sobre otro salvo el valor por defecto.
 */

export interface ClvRevenueBasedInputs {
  avgOrderValue: number;
  purchaseFrequencyPerYear: number;
  customerLifespanYears: number;
}

export interface ClvMarginChurnBasedInputs {
  arpu: number;
  grossMarginPercent: number; // 0-100
  churnRatePercent: number; // 0-100, por el mismo periodo que ARPU
}

export type ClvInputs =
  | ({ method: 'revenue_based' } & Partial<ClvRevenueBasedInputs>)
  | ({ method: 'margin_churn_based' } & Partial<ClvMarginChurnBasedInputs>);

export interface ClvBreakdown {
  method: LtvMethod;
  [key: string]: number | string;
}

export function validateClvInputs(inputs: ClvInputs): ValidationResult {
  if (inputs.method === 'revenue_based') {
    const issues = [
      ...requireFields({
        avgOrderValue: inputs.avgOrderValue,
        purchaseFrequencyPerYear: inputs.purchaseFrequencyPerYear,
        customerLifespanYears: inputs.customerLifespanYears,
      }),
      ...forbidNegative({
        avgOrderValue: inputs.avgOrderValue,
        purchaseFrequencyPerYear: inputs.purchaseFrequencyPerYear,
        customerLifespanYears: inputs.customerLifespanYears,
      }),
    ];
    return buildValidationResult(issues);
  }

  const issues = [
    ...requireFields({
      arpu: inputs.arpu,
      grossMarginPercent: inputs.grossMarginPercent,
      churnRatePercent: inputs.churnRatePercent,
    }),
    ...forbidNegative({ arpu: inputs.arpu }),
  ];
  if (inputs.grossMarginPercent !== undefined && (inputs.grossMarginPercent < 0 || inputs.grossMarginPercent > 100)) {
    issues.push({ field: 'grossMarginPercent', severity: 'error', message: 'El margen bruto debe estar entre 0 y 100%.' });
  }
  if (inputs.churnRatePercent !== undefined && (inputs.churnRatePercent <= 0 || inputs.churnRatePercent > 100)) {
    issues.push({
      field: 'churnRatePercent',
      severity: 'error',
      message: 'La tasa de churn debe ser mayor que 0 y como máximo 100% para poder calcular el LTV.',
    });
  }
  return buildValidationResult(issues);
}

export function calculateClv(inputs: ClvInputs): MetricResult<ClvBreakdown> {
  const validation = validateClvInputs(inputs);
  if (!validation.valid) {
    return { value: undefined, unit: 'currency', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }

  if (inputs.method === 'revenue_based') {
    const { avgOrderValue, purchaseFrequencyPerYear, customerLifespanYears } = inputs;
    const value =
      avgOrderValue! * purchaseFrequencyPerYear! * customerLifespanYears!;
    return {
      value,
      unit: 'currency',
      breakdown: {
        method: 'revenue_based',
        avgOrderValue: avgOrderValue!,
        purchaseFrequencyPerYear: purchaseFrequencyPerYear!,
        customerLifespanYears: customerLifespanYears!,
      },
    };
  }

  const { arpu, grossMarginPercent, churnRatePercent } = inputs;
  const value = safeDivide(arpu! * (grossMarginPercent! / 100), churnRatePercent! / 100);
  return {
    value,
    unit: 'currency',
    breakdown: {
      method: 'margin_churn_based',
      arpu: arpu!,
      grossMarginPercent: grossMarginPercent!,
      churnRatePercent: churnRatePercent!,
    },
  };
}

export function interpretClv(result: MetricResult<ClvBreakdown>): string | undefined {
  if (result.value === undefined || !result.breakdown) return undefined;
  const methodLabel =
    result.breakdown.method === 'revenue_based'
      ? 'ingresos (ticket promedio × frecuencia × vida del cliente)'
      : 'margen y churn (ARPU × margen bruto % / tasa de churn)';
  return `Se estima que cada cliente genera ${result.value.toLocaleString('es', { maximumFractionDigits: 0 })} a lo largo de su relación con tu negocio, usando el método de ${methodLabel}.`;
}
