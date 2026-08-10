/**
 * Conjunto ampliado de métricas usado por Historial y Gráficos para comparar
 * periodos: además de las 6 del Dashboard, incluye márgenes, churn y
 * retención — todas derivadas de los mismos inputs crudos de un snapshot.
 */
import { getMetricDefinition } from './metricRegistry';
import { computeDashboardMetrics } from './computeDashboardMetrics';
import type { LtvMethod, MetricResult, RawInputs } from './types';

export const COMPARISON_METRIC_IDS = ['cac', 'clv', 'ltvCac', 'payback', 'roas', 'roi', 'grossMargin', 'netMargin', 'churn', 'retention'] as const;

export type ComparisonMetricId = (typeof COMPARISON_METRIC_IDS)[number];

export function computeComparisonMetrics(raw: RawInputs, ltvMethod: LtvMethod): Record<ComparisonMetricId, MetricResult> {
  const dashboard = computeDashboardMetrics(raw, ltvMethod);
  const effectiveRaw: RawInputs = { ...raw, ltvMethod: raw.ltvMethod ?? ltvMethod };
  return {
    cac: dashboard.cac,
    clv: dashboard.clv,
    ltvCac: dashboard.ltvCac,
    payback: dashboard.payback,
    roas: dashboard.roas,
    roi: dashboard.roi,
    grossMargin: getMetricDefinition('grossMargin')!.compute(effectiveRaw),
    netMargin: getMetricDefinition('netMargin')!.compute(effectiveRaw),
    churn: getMetricDefinition('churn')!.compute(effectiveRaw),
    retention: getMetricDefinition('retention')!.compute(effectiveRaw),
  };
}
