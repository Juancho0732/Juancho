import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../../state/useProjectStore';
import { COMPARISON_METRIC_IDS, computeComparisonMetrics } from '../../core/computeComparisonMetrics';
import { getMetricDefinition } from '../../core/metricRegistry';
import { computeTrend } from '../../core/trend';
import { formatMetricValue } from '../../core/format';
import { PageHeader } from '../../components/ui/PageHeader';

export function HistoryPage() {
  const { projects, activeProjectId, snapshots } = useProjectStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const [periodAId, setPeriodAId] = useState<string | undefined>();
  const [periodBId, setPeriodBId] = useState<string | undefined>();

  if (!activeProject) {
    return (
      <div>
        <PageHeader title="Historial" subtitle="Guarda y compara distintos periodos y proyectos." />
        <EmptyPanel text="Crea o selecciona un proyecto para ver su historial." />
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div>
        <PageHeader title="Historial" subtitle="Guarda y compara distintos periodos y proyectos." />
        <EmptyPanel text={`"${activeProject.name}" todavía no tiene periodos guardados.`} action />
      </div>
    );
  }

  const sorted = [...snapshots].sort((a, b) => a.periodStart - b.periodStart);
  const defaultB = sorted.at(-1)?.id;
  const defaultA = sorted.length > 1 ? sorted.at(-2)?.id : sorted.at(-1)?.id;

  const snapshotA = sorted.find((s) => s.id === (periodAId ?? defaultA));
  const snapshotB = sorted.find((s) => s.id === (periodBId ?? defaultB));

  const metricsA = snapshotA ? computeComparisonMetrics(snapshotA.rawInputs, activeProject.ltvMethod) : undefined;
  const metricsB = snapshotB ? computeComparisonMetrics(snapshotB.rawInputs, activeProject.ltvMethod) : undefined;

  return (
    <div>
      <PageHeader title="Historial" subtitle={activeProject.name} />

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 mb-5">
        <p className="text-[13px] font-medium text-(--color-ink-muted) mb-3">Periodos guardados</p>
        <div className="flex flex-wrap gap-2">
          {sorted.map((s) => (
            <span key={s.id} className="rounded-full border border-(--color-border) px-3 py-1.5 text-[12.5px] text-(--color-ink)">
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <div className="flex flex-wrap gap-4 mb-5">
          <PeriodSelect label="Periodo A" value={snapshotA?.id} options={sorted} onChange={setPeriodAId} />
          <PeriodSelect label="Periodo B" value={snapshotB?.id} options={sorted} onChange={setPeriodBId} />
        </div>

        {metricsA && metricsB && (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] min-w-[520px]">
              <thead>
                <tr className="border-b border-(--color-border)">
                  <th className="text-left font-medium text-(--color-ink-muted) px-3 py-2.5">Métrica</th>
                  <th className="text-right font-medium text-(--color-ink-muted) px-3 py-2.5">{snapshotA!.label}</th>
                  <th className="text-right font-medium text-(--color-ink-muted) px-3 py-2.5">{snapshotB!.label}</th>
                  <th className="text-right font-medium text-(--color-ink-muted) px-3 py-2.5">Cambio</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_METRIC_IDS.map((id) => {
                  const definition = getMetricDefinition(id)!;
                  const a = metricsA[id];
                  const b = metricsB[id];
                  const trend = computeTrend(b.value, a.value);
                  return (
                    <tr key={id} className="border-b border-(--color-border) last:border-0">
                      <td className="px-3 py-2.5 text-(--color-ink-muted)">{definition.shortName}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-(--color-ink)">{formatMetricValue(a, activeProject.currency)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-(--color-ink)">{formatMetricValue(b, activeProject.currency)}</td>
                      <td
                        className={`px-3 py-2.5 text-right tabular-nums font-medium ${
                          !trend ? 'text-(--color-ink-faint)' : trend.direction === 'up' ? 'text-(--color-good)' : trend.direction === 'down' ? 'text-(--color-bad)' : 'text-(--color-ink-faint)'
                        }`}
                      >
                        {trend ? `${trend.changePercent >= 0 ? '+' : ''}${trend.changePercent.toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PeriodSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-(--color-ink-muted)">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-(--color-border) bg-(--color-surface-muted) px-3 py-2 text-[13.5px] text-(--color-ink) outline-none focus:border-(--color-brand)"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyPanel({ text, action }: { text: string; action?: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-14 text-center max-w-xl">
      <p className="text-[13.5px] text-(--color-ink-muted)">{text}</p>
      {action && (
        <Link
          to="/calculadoras/cac"
          className="inline-flex items-center gap-1.5 mt-5 rounded-lg bg-(--color-brand) text-white text-[13.5px] font-medium px-4 py-2.5 hover:bg-(--color-brand-ink) transition-colors"
        >
          Empezar por CAC
        </Link>
      )}
    </div>
  );
}
