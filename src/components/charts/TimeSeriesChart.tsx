import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { formatMetricValue } from '../../core/format';
import type { MetricResult } from '../../core/types';

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

export function TimeSeriesChart({
  title,
  data,
  series,
  unit,
  currency,
}: {
  title: string;
  data: Record<string, number | undefined | string>[];
  series: ChartSeries[];
  unit: MetricResult['unit'];
  currency: string;
}) {
  const format = (v: number) => formatMetricValue({ value: v, unit }, currency);

  /** Formato compacto para los ticks del eje Y, donde el espacio horizontal es limitado
   * (el valor completo y sin abreviar siempre se ve en el tooltip al pasar el cursor). */
  const formatAxisTick = (v: number) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
    }
    if (unit === 'percent') return `${v.toFixed(0)}%`;
    if (unit === 'ratio') return `${v.toFixed(1)}x`;
    return new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  };

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
      <p className="text-[13.5px] font-medium text-(--color-ink) mb-4">{title}</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--color-ink-faint)', fontSize: 11.5 }} axisLine={{ stroke: 'var(--color-border-strong)' }} tickLine={false} />
            <YAxis
              tick={{ fill: 'var(--color-ink-faint)', fontSize: 11.5 }}
              axisLine={false}
              tickLine={false}
              width={unit === 'currency' ? 58 : 40}
              tickFormatter={formatAxisTick}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12.5,
              }}
              labelStyle={{ color: 'var(--color-ink)', fontWeight: 500, marginBottom: 4 }}
              formatter={(value) => (typeof value === 'number' ? format(value) : '—')}
            />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="plainline" iconSize={14} />}
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
