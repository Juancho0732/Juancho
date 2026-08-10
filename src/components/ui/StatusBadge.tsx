import type { MetricStatus } from '../../core/types';

const STYLES: Record<MetricStatus, string> = {
  good: 'bg-(--color-good-soft) text-(--color-good)',
  warning: 'bg-(--color-warning-soft) text-(--color-warning)',
  bad: 'bg-(--color-bad-soft) text-(--color-bad)',
  neutral: 'bg-(--color-neutral-soft) text-(--color-neutral)',
};

const LABELS: Record<MetricStatus, string> = {
  good: 'Favorable',
  warning: 'Atención',
  bad: 'Preocupante',
  neutral: 'Sin datos suficientes',
};

export function StatusBadge({ status }: { status: MetricStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${STYLES[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
