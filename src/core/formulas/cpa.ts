import type { MetricResult, ValidationResult } from '../types';
import { buildValidationResult, forbidNegative, requireFields, safeDivide } from '../validation/validators';

/**
 * CPA — Cost Per Acquisition (costo por conversión)
 * Fórmula: Costo de campaña / Número de conversiones
 *
 * Nota de diseño: la especificación original pedía "Coste por lead" como
 * calculadora independiente de CPA. Es matemáticamente la misma fórmula
 * (Costo / Conversiones) aplicada a un tipo de conversión distinto, así que
 * se implementa aquí como una única calculadora con un selector de tipo de
 * conversión (Compra, Registro, Lead, Descarga, Otra) en vez de duplicar la
 * lógica y la pantalla.
 */
export type ConversionType = 'purchase' | 'signup' | 'lead' | 'download' | 'other';

export const CONVERSION_TYPE_LABELS: Record<ConversionType, string> = {
  purchase: 'Compra',
  signup: 'Registro',
  lead: 'Lead',
  download: 'Descarga',
  other: 'Otra',
};

export interface CpaInputs {
  campaignCost: number;
  conversions: number;
  conversionType: ConversionType;
}

export function validateCpaInputs(inputs: Partial<CpaInputs>): ValidationResult {
  const issues = [
    ...requireFields({ campaignCost: inputs.campaignCost, conversions: inputs.conversions }),
    ...forbidNegative({ campaignCost: inputs.campaignCost, conversions: inputs.conversions }),
  ];
  if (inputs.conversions !== undefined && inputs.conversions === 0) {
    issues.push({ field: 'conversions', severity: 'error', message: 'El número de conversiones no puede ser cero.' });
  }
  return buildValidationResult(issues);
}

export function calculateCpa(inputs: Partial<CpaInputs>): MetricResult<CpaInputs> {
  const validation = validateCpaInputs(inputs);
  if (!validation.valid || inputs.campaignCost === undefined || inputs.conversions === undefined) {
    return { value: undefined, unit: 'currency', error: validation.issues[0]?.message ?? 'Datos insuficientes.' };
  }
  const value = safeDivide(inputs.campaignCost, inputs.conversions);
  return {
    value,
    unit: 'currency',
    breakdown: {
      campaignCost: inputs.campaignCost,
      conversions: inputs.conversions,
      conversionType: inputs.conversionType ?? 'other',
    } as unknown as CpaInputs,
  };
}

export function interpretCpa(result: MetricResult<CpaInputs>): string | undefined {
  if (result.value === undefined || !result.breakdown) return undefined;
  const label = CONVERSION_TYPE_LABELS[result.breakdown.conversionType] ?? 'conversión';
  return `Cada ${label.toLowerCase()} te cuesta en promedio ${result.value.toLocaleString('es', { maximumFractionDigits: 0 })}.`;
}
