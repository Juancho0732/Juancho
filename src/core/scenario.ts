/**
 * Aplica ajustes porcentuales sobre un conjunto de inputs crudos.
 *
 * Usado tanto por el Simulador ("¿Qué pasaría si...?") como por los
 * escenarios guardados (Optimista/Pesimista/Custom): ambos son la misma
 * operación (deltas % sobre un snapshot base), así que comparten esta única
 * función en vez de tener dos motores de escenarios distintos.
 */
import type { RawInputs } from './types';

export type FieldAdjustments = Partial<Record<keyof RawInputs, number>>;

const NON_NUMERIC_FIELDS = new Set<keyof RawInputs>(['ltvMethod', 'conversionType']);

export function applyAdjustments(base: RawInputs, adjustmentsPercent: FieldAdjustments): RawInputs {
  const result: RawInputs = { ...base };
  for (const [key, percent] of Object.entries(adjustmentsPercent) as [keyof RawInputs, number | undefined][]) {
    if (percent === undefined || NON_NUMERIC_FIELDS.has(key)) continue;
    const baseValue = base[key];
    if (typeof baseValue !== 'number') continue;
    (result[key] as number) = baseValue * (1 + percent / 100);
  }
  return result;
}

/** Deltas sugeridos por defecto para generar un escenario optimista a partir del actual.
 * Son un punto de partida editable, no una regla fija. */
export const DEFAULT_OPTIMISTIC_ADJUSTMENTS: FieldAdjustments = {
  marketingSpend: -10,
  salesSpend: -10,
  avgOrderValue: 10,
  purchaseFrequencyPerYear: 15,
  customersLost: -25,
};

/** Deltas sugeridos por defecto para generar un escenario pesimista a partir del actual. */
export const DEFAULT_PESSIMISTIC_ADJUSTMENTS: FieldAdjustments = {
  marketingSpend: 15,
  salesSpend: 15,
  avgOrderValue: -10,
  purchaseFrequencyPerYear: -15,
  customersLost: 25,
};
