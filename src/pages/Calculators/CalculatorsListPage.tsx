import { Link } from 'react-router-dom';
import { METRIC_REGISTRY, type MetricCategory } from '../../core/metricRegistry';
import { PageHeader } from '../../components/ui/PageHeader';

const CATEGORY_LABELS: Record<MetricCategory, string> = {
  acquisition: 'Adquisición',
  value: 'Valor del cliente',
  profitability: 'Rentabilidad',
  retention: 'Retención',
  advertising: 'Publicidad',
  conversion: 'Conversión',
};

const CATEGORY_ORDER: MetricCategory[] = ['acquisition', 'value', 'profitability', 'retention', 'advertising', 'conversion'];

export function CalculatorsListPage() {
  return (
    <div>
      <PageHeader title="Calculadoras" subtitle="Una calculadora independiente para cada métrica, con explicación e interpretación." />

      <div className="flex flex-col gap-8">
        {CATEGORY_ORDER.map((category) => {
          const metrics = METRIC_REGISTRY.filter((m) => m.category === category);
          if (metrics.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-[13px] font-semibold text-(--color-ink-faint) font-mono uppercase tracking-widest mb-3">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.map((metric) => (
                  <Link
                    key={metric.id}
                    to={`/calculadoras/${metric.id}`}
                    className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 hover:border-(--color-border-strong) hover:shadow-sm transition-all"
                  >
                    <p className="text-[14px] font-semibold text-(--color-ink)">{metric.shortName}</p>
                    <p className="text-[12.5px] text-(--color-ink-muted) mt-0.5">{metric.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
