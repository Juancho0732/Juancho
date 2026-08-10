/**
 * Orquesta el cálculo de las 6 métricas principales del Dashboard, respetando
 * las dependencias entre ellas: LTV:CAC y Payback necesitan el CAC (y LTV en
 * el caso de LTV:CAC) ya calculados, así que no pueden derivarse solo de los
 * inputs crudos como el resto. Vive en /core porque es lógica pura de
 * orquestación, sin nada de React, y por tanto testeable de forma aislada.
 */
import { getMetricDefinition } from './metricRegistry';
import type { LtvMethod, MetricResult, RawInputs } from './types';

export interface DashboardMetrics {
  cac: MetricResult;
  clv: MetricResult;
  ltvCac: MetricResult;
  payback: MetricResult;
  roas: MetricResult;
  roi: MetricResult;
}

export function computeDashboardMetrics(raw: RawInputs, projectLtvMethod: LtvMethod): DashboardMetrics {
  const effectiveRaw: RawInputs = { ...raw, ltvMethod: raw.ltvMethod ?? projectLtvMethod };

  const cac = getMetricDefinition('cac')!.compute(effectiveRaw);
  const clv = getMetricDefinition('clv')!.compute(effectiveRaw);
  const derived = { cac: cac.value, clv: clv.value };
  const ltvCac = getMetricDefinition('ltvCac')!.compute(effectiveRaw, derived);
  const payback = getMetricDefinition('payback')!.compute(effectiveRaw, derived);
  const roas = getMetricDefinition('roas')!.compute(effectiveRaw);
  const roi = getMetricDefinition('roi')!.compute(effectiveRaw);

  return { cac, clv, ltvCac, payback, roas, roi };
}
