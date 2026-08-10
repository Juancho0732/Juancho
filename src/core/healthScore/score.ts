/**
 * Marketing Health Score — puntuación de 0 a 100.
 *
 * Metodología (documentada aquí, no oculta, y ajustable cambiando las
 * constantes de este archivo):
 *
 * Se evalúan 5 dimensiones, cada una anclada a UNA métrica ya calculada del
 * snapshot, normalizada a una escala de 0 a 100 mediante un punto de
 * referencia documentado (no una regla absoluta, igual que el resto de la
 * app):
 *
 *   - Adquisición       → LTV:CAC.        Referencia: 3x = 100 puntos.
 *   - Rentabilidad      → Margen neto %.   Referencia: 20% = 100 puntos.
 *   - Monetización      → Margen bruto %.  Referencia: 60% = 100 puntos.
 *   - Retención         → Tasa de retención %, mapeada 1:1 (ya es un % de 0-100).
 *   - Eficiencia publicitaria → ROAS.      Referencia: 3x = 100 puntos.
 *
 * Cada dimensión se limita entre 0 y 100 (un LTV:CAC de 6x no da 200
 * puntos, da 100). Si una dimensión no tiene los datos que necesita, se
 * excluye del cálculo — no se le asigna 0 ni se inventa un valor.
 *
 * La puntuación global es el promedio ponderado de las dimensiones
 * disponibles, renormalizando los pesos entre ellas. Por defecto los 5
 * pesos son iguales (20% cada uno); cambiarlos aquí cambia el cálculo para
 * toda la app.
 */
import { getMetricDefinition } from '../metricRegistry';
import { computeDashboardMetrics } from '../computeDashboardMetrics';
import type { LtvMethod, RawInputs } from '../types';

export type HealthDimensionId = 'acquisition' | 'profitability' | 'monetization' | 'retention' | 'adEfficiency';

export interface DimensionDefinition {
  id: HealthDimensionId;
  label: string;
  weight: number;
  basis: string;
}

export const HEALTH_SCORE_DIMENSIONS: DimensionDefinition[] = [
  { id: 'acquisition', label: 'Adquisición', weight: 0.2, basis: 'LTV:CAC (referencia: 3x = 100 puntos)' },
  { id: 'profitability', label: 'Rentabilidad', weight: 0.2, basis: 'Margen neto % (referencia: 20% = 100 puntos)' },
  { id: 'monetization', label: 'Monetización', weight: 0.2, basis: 'Margen bruto % (referencia: 60% = 100 puntos)' },
  { id: 'retention', label: 'Retención', weight: 0.2, basis: 'Tasa de retención % (mapeo directo)' },
  { id: 'adEfficiency', label: 'Eficiencia publicitaria', weight: 0.2, basis: 'ROAS (referencia: 3x = 100 puntos)' },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export interface DimensionScore {
  id: HealthDimensionId;
  label: string;
  score: number | undefined;
  weight: number;
  basis: string;
}

export interface HealthScoreResult {
  overall: number | undefined;
  dimensions: DimensionScore[];
}

export function computeHealthScore(raw: RawInputs, ltvMethod: LtvMethod): HealthScoreResult {
  const dashboard = computeDashboardMetrics(raw, ltvMethod);
  const effectiveRaw: RawInputs = { ...raw, ltvMethod: raw.ltvMethod ?? ltvMethod };
  const grossMargin = getMetricDefinition('grossMargin')!.compute(effectiveRaw).value;
  const netMargin = getMetricDefinition('netMargin')!.compute(effectiveRaw).value;
  const retention = getMetricDefinition('retention')!.compute(effectiveRaw).value;

  const rawScores: Record<HealthDimensionId, number | undefined> = {
    acquisition: dashboard.ltvCac.value !== undefined ? clampScore((dashboard.ltvCac.value / 3) * 100) : undefined,
    profitability: netMargin !== undefined ? clampScore((netMargin / 20) * 100) : undefined,
    monetization: grossMargin !== undefined ? clampScore((grossMargin / 60) * 100) : undefined,
    retention: retention !== undefined ? clampScore(retention) : undefined,
    adEfficiency: dashboard.roas.value !== undefined ? clampScore((dashboard.roas.value / 3) * 100) : undefined,
  };

  const dimensions: DimensionScore[] = HEALTH_SCORE_DIMENSIONS.map((d) => ({
    id: d.id,
    label: d.label,
    score: rawScores[d.id],
    weight: d.weight,
    basis: d.basis,
  }));

  const available = dimensions.filter((d) => d.score !== undefined);
  const totalWeight = available.reduce((sum, d) => sum + d.weight, 0);
  const overall = totalWeight > 0 ? available.reduce((sum, d) => sum + d.score! * d.weight, 0) / totalWeight : undefined;

  return { overall: overall !== undefined ? Math.round(overall) : undefined, dimensions };
}
