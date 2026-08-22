import { Link } from 'react-router-dom';
import type { MetricResult, MetricStatus } from '../../core/types';
import { formatMetricValue } from '../../core/format';
import { computeTrend } from '../../core/trend';
import { StatusBadge } from '../ui/StatusBadge';

export interface MetricCardProps {
  metricId: string;
  name: string;
  result: MetricResult;
  previousValue?: number;
  interpretation?: string;
  status?: MetricStatus;
  currency: string;
}

export function MetricCard({ metricId, name, result, previousValue, interpretation, status, currency }: MetricCardProps) {
  const trend = computeTrend(result.value, previousValue);
  const trendLabel = trend ? `${trend.changePercent >= 0 ? '+' : ''}${trend.changePercent.toFixed(1)}% vs periodo anterior` : undefined;

  return (
    <Link
      to={`/calculadoras/${metricId}`}
      className="group flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 hover:border-(--color-border-strong) hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-(--color-ink-muted)">{name}</p>
        {status && <StatusBadge status={status} />}
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-[28px] font-semibold tracking-tight text-(--color-ink) tabular-nums">
          {formatMetricValue(result, currency)}
        </p>
        {trend && (
          <span
            className={`text-[12.5px] font-medium tabular-nums ${
              trend.direction === 'up' ? 'text-(--color-good)' : trend.direction === 'down' ? 'text-(--color-bad)' : 'text-(--color-ink-faint)'
            }`}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '·'} {trendLabel}
          </span>
        )}
      </div>

      {result.error ? (
        <p className="text-[12.5px] text-(--color-ink-faint)">Añade los datos necesarios en la calculadora para verla aquí.</p>
      ) : interpretation ? (
        <p className="text-[12.5px] leading-relaxed text-(--color-ink-muted) line-clamp-2">{interpretation}</p>
      ) : null}
    </Link>
  );
}
