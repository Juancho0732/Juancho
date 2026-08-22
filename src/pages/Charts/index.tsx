import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../../state/useProjectStore';
import { computeComparisonMetrics } from '../../core/computeComparisonMetrics';
import { PageHeader } from '../../components/ui/PageHeader';
import { TimeSeriesChart } from '../../components/charts/TimeSeriesChart';

const RANGE_OPTIONS = [
  { id: '6', label: 'Últimos 6 periodos' },
  { id: '12', label: 'Últimos 12 periodos' },
  { id: 'all', label: 'Todos' },
];

export function ChartsPage() {
  const { projects, activeProjectId, snapshots } = useProjectStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const [range, setRange] = useState('12');

  if (!activeProject) {
    return (
      <div>
        <PageHeader title="Gráficos" subtitle="Evolución de tus métricas a través del tiempo." />
        <EmptyPanel text="Crea o selecciona un proyecto para ver sus gráficos." />
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div>
        <PageHeader title="Gráficos" subtitle="Evolución de tus métricas a través del tiempo." />
        <EmptyPanel text={`"${activeProject.name}" todavía no tiene periodos guardados.`} action />
      </div>
    );
  }

  const sorted = [...snapshots].sort((a, b) => a.periodStart - b.periodStart);
  const limited = range === 'all' ? sorted : sorted.slice(-Number(range));

  const points = limited.map((s) => {
    const m = computeComparisonMetrics(s.rawInputs, activeProject.ltvMethod);
    return {
      label: s.label,
      cac: m.cac.value,
      clv: m.clv.value,
      revenue: s.rawInputs.revenue,
      grossMargin: m.grossMargin.value,
      newCustomers: s.rawInputs.newCustomers,
      churn: m.churn.value,
      retention: m.retention.value,
      roas: m.roas.value,
      roi: m.roi.value,
    };
  });

  const singlePoint = points.length < 2;

  return (
    <div>
      <PageHeader
        title="Gráficos"
        subtitle={activeProject.name}
        actions={
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-[13px] text-(--color-ink) outline-none focus:border-(--color-brand)"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        }
      />

      {singlePoint && (
        <p className="text-[12.5px] text-(--color-ink-faint) mb-5 -mt-4">
          Solo hay un periodo guardado. Añade más periodos para ver la evolución en el tiempo.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TimeSeriesChart
          title="CAC vs LTV"
          data={points}
          series={[
            { key: 'cac', label: 'CAC', color: 'var(--color-series-1)' },
            { key: 'clv', label: 'LTV', color: 'var(--color-series-2)' },
          ]}
          unit="currency"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="Revenue"
          data={points}
          series={[{ key: 'revenue', label: 'Ingresos', color: 'var(--color-series-1)' }]}
          unit="currency"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="Evolución del CAC"
          data={points}
          series={[{ key: 'cac', label: 'CAC', color: 'var(--color-series-1)' }]}
          unit="currency"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="Evolución del LTV"
          data={points}
          series={[{ key: 'clv', label: 'LTV', color: 'var(--color-series-2)' }]}
          unit="currency"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="Margen bruto"
          data={points}
          series={[{ key: 'grossMargin', label: 'Margen bruto', color: 'var(--color-series-1)' }]}
          unit="percent"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="Clientes adquiridos"
          data={points}
          series={[{ key: 'newCustomers', label: 'Clientes nuevos', color: 'var(--color-series-3)' }]}
          unit="count"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="Churn"
          data={points}
          series={[{ key: 'churn', label: 'Churn', color: 'var(--color-bad)' }]}
          unit="percent"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="Retención"
          data={points}
          series={[{ key: 'retention', label: 'Retención', color: 'var(--color-good)' }]}
          unit="percent"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="ROAS"
          data={points}
          series={[{ key: 'roas', label: 'ROAS', color: 'var(--color-series-1)' }]}
          unit="ratio"
          currency={activeProject.currency}
        />
        <TimeSeriesChart
          title="ROI"
          data={points}
          series={[{ key: 'roi', label: 'ROI', color: 'var(--color-series-2)' }]}
          unit="percent"
          currency={activeProject.currency}
        />
      </div>
    </div>
  );
}

function EmptyPanel({ text, action }: { text: string; action?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-14 text-center max-w-xl">
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
