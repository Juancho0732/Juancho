import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../../state/useProjectStore';
import { computeDashboardMetrics, type DashboardMetrics } from '../../core/computeDashboardMetrics';
import { getMetricDefinition } from '../../core/metricRegistry';
import { MetricCard } from '../../components/metrics/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { PlusIcon } from '../../components/ui/icons';

const HEADLINE_METRICS = ['cac', 'clv', 'ltvCac', 'roas', 'roi', 'payback'] as const;

export function DashboardPage() {
  const { projects, activeProjectId, snapshots, activeSnapshotId } = useProjectStore();
  const [current, setCurrent] = useState<DashboardMetrics | undefined>();
  const [previous, setPrevious] = useState<DashboardMetrics | undefined>();

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeSnapshot = snapshots.find((s) => s.id === activeSnapshotId);
  const activeIndex = snapshots.findIndex((s) => s.id === activeSnapshotId);
  const previousSnapshot = activeIndex > 0 ? snapshots[activeIndex - 1] : undefined;

  useEffect(() => {
    if (!activeProject || !activeSnapshot) {
      setCurrent(undefined);
      setPrevious(undefined);
      return;
    }
    setCurrent(computeDashboardMetrics(activeSnapshot.rawInputs, activeProject.ltvMethod));
    setPrevious(previousSnapshot ? computeDashboardMetrics(previousSnapshot.rawInputs, activeProject.ltvMethod) : undefined);
  }, [activeProject, activeSnapshot, previousSnapshot]);

  if (!activeProject) {
    return (
      <div>
        <PageHeader title="Marketing Metrics" subtitle="Convierte tus datos en decisiones." />
        <EmptyState
          title="Crea tu primer proyecto"
          description="Un proyecto agrupa los datos, métricas e historial de un negocio, cliente o caso de estudio. Usa el selector de proyectos de arriba para empezar."
        />
      </div>
    );
  }

  if (!activeSnapshot) {
    return (
      <div>
        <PageHeader title="Marketing Metrics" subtitle="Convierte tus datos en decisiones." />
        <EmptyState
          title={`"${activeProject.name}" todavía no tiene datos`}
          description="Añade un periodo con tus datos de marketing y financieros desde las calculadoras para ver aquí tus métricas principales."
          action={{ to: '/calculadoras/cac', label: 'Empezar por CAC' }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Marketing Metrics"
        subtitle="Convierte tus datos en decisiones."
        actions={
          <Link
            to="/calculadoras"
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-brand) text-white text-[13.5px] font-medium px-3.5 py-2 hover:bg-(--color-brand-ink) transition-colors"
          >
            <PlusIcon width={15} height={15} />
            Actualizar datos
          </Link>
        }
      />

      <p className="text-[13px] text-(--color-ink-muted) -mt-4 mb-6">
        {activeProject.name} · {activeSnapshot.label}
      </p>

      {current && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {HEADLINE_METRICS.map((id) => {
            const definition = getMetricDefinition(id)!;
            const result = current[id as keyof DashboardMetrics];
            const previousValue = previous?.[id as keyof DashboardMetrics]?.value;
            return (
              <MetricCard
                key={id}
                metricId={id}
                name={definition.name}
                result={result}
                previousValue={previousValue}
                interpretation={definition.interpret(result)}
                status={definition.status?.(result)}
                currency={activeProject.currency}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: { to: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-14 text-center max-w-xl mx-auto">
      <p className="text-[15px] font-medium text-(--color-ink)">{title}</p>
      <p className="text-[13.5px] text-(--color-ink-muted) mt-2 leading-relaxed">{description}</p>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1.5 mt-5 rounded-lg bg-(--color-brand) text-white text-[13.5px] font-medium px-4 py-2.5 hover:bg-(--color-brand-ink) transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
