export type TrendDirection = 'up' | 'down' | 'flat';

export interface Trend {
  direction: TrendDirection;
  changePercent: number;
}

/** Compara un valor actual contra uno anterior. Un cambio menor al 0.05% se
 * considera "flat" para no mostrar ruido de redondeo como tendencia. */
export function computeTrend(current: number | undefined, previous: number | undefined): Trend | undefined {
  if (current === undefined || previous === undefined || previous === 0) return undefined;
  const changePercent = ((current - previous) / Math.abs(previous)) * 100;
  const direction: TrendDirection = changePercent > 0.05 ? 'up' : changePercent < -0.05 ? 'down' : 'flat';
  return { direction, changePercent };
}
