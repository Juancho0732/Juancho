import { useState } from 'react';
import { useProjectStore } from '../../state/useProjectStore';
import { computeDashboardMetrics, type DashboardMetrics } from '../../core/computeDashboardMetrics';
import { calculateUtilidad } from '../../core/utilidad';
import { applyAdjustments, DEFAULT_OPTIMISTIC_ADJUSTMENTS, DEFAULT_PESSIMISTIC_ADJUSTMENTS, type FieldAdjustments } from '../../core/scenario';
import { isSliderApplicable, sliderToAdjustments, SIMULATOR_SLIDERS } from '../../core/simulatorSliders';
import { formatMetricValue } from '../../core/format';
import type { MetricResult, RawInputs } from '../../core/types';
import { createScenario } from '../../data/scenariosRepo';
import { PageHeader } from '../../components/ui/PageHeader';
import { Slider } from '../../components/ui/Slider';
import { Link } from 'react-router-dom';

const OUTPUT_ROWS: { id: keyof DashboardMetrics; label: string }[] = [
  { id: 'clv', label: 'LTV' },
  { id: 'cac', label: 'CAC' },
  { id: 'ltvCac', label: 'LTV:CAC' },
  { id: 'payback', label: 'Payback' },
  { id: 'roi', label: 'ROI' },
];

export function SimulatorPage() {
  const { projects, activeProjectId, snapshots, activeSnapshotId, refreshSnapshots } = useProjectStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeSnapshot = snapshots.find((s) => s.id === activeSnapshotId);

  const [adjustments, setAdjustments] = useState<FieldAdjustments>({});
  const [savingName, setSavingName] = useState('');
  const [saved, setSaved] = useState(false);

  const base: RawInputs = activeSnapshot?.rawInputs ?? {};
  const ltvMethod = activeProject?.ltvMethod ?? 'revenue_based';

  // `base` es un objeto nuevo en cada render (deriva de activeSnapshot), así que memoizar
  // sobre su identidad no ahorraría cálculo real; los cálculos son aritmética pura y barata.
  const adjustedRaw = applyAdjustments(base, adjustments);
  const actual = computeDashboardMetrics(base, ltvMethod);
  const custom = computeDashboardMetrics(adjustedRaw, ltvMethod);
  const optimistic = computeDashboardMetrics(applyAdjustments(base, DEFAULT_OPTIMISTIC_ADJUSTMENTS), ltvMethod);
  const pessimistic = computeDashboardMetrics(applyAdjustments(base, DEFAULT_PESSIMISTIC_ADJUSTMENTS), ltvMethod);

  const utilidadActual = calculateUtilidad(base);
  const utilidadCustom = calculateUtilidad(adjustedRaw);
  const utilidadOptimistic = calculateUtilidad(applyAdjustments(base, DEFAULT_OPTIMISTIC_ADJUSTMENTS));
  const utilidadPessimistic = calculateUtilidad(applyAdjustments(base, DEFAULT_PESSIMISTIC_ADJUSTMENTS));

  const hasAdjustments = Object.values(adjustments).some((v) => v !== undefined && v !== 0);

  function updateSlider(sliderId: string, percent: number) {
    const slider = SIMULATOR_SLIDERS.find((s) => s.id === sliderId)!;
    setSaved(false);
    setAdjustments((prev) => ({ ...prev, ...sliderToAdjustments(slider, percent) }));
  }

  function resetAdjustments() {
    setAdjustments({});
    setSaved(false);
  }

  async function handleSaveScenario() {
    if (!activeProject || !activeSnapshot) return;
    await createScenario({
      projectId: activeProject.id,
      baseSnapshotId: activeSnapshot.id,
      name: savingName.trim() || 'Escenario personalizado',
      type: 'custom',
      adjustments: adjustments as Record<string, number>,
    });
    await refreshSnapshots(activeProject.id);
    setSaved(true);
    setSavingName('');
  }

  if (!activeProject) {
    return (
      <div>
        <PageHeader title="¿Qué pasaría si…?" subtitle="Ajusta variables y observa el impacto en tus métricas en tiempo real." />
        <EmptyPanel text="Crea o selecciona un proyecto para usar el simulador." />
      </div>
    );
  }

  if (!activeSnapshot) {
    return (
      <div>
        <PageHeader title="¿Qué pasaría si…?" subtitle="Ajusta variables y observa el impacto en tus métricas en tiempo real." />
        <EmptyPanel text={`"${activeProject.name}" todavía no tiene datos. Añade un periodo desde las calculadoras.`} action />
      </div>
    );
  }

  const applicableSliders = SIMULATOR_SLIDERS.filter((s) => isSliderApplicable(s, base));

  return (
    <div>
      <PageHeader title="¿Qué pasaría si…?" subtitle={`${activeProject.name} · ${activeSnapshot.label}`} />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_1fr] gap-6">
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-medium text-(--color-ink-muted)">Variables</p>
            {hasAdjustments && (
              <button type="button" onClick={resetAdjustments} className="text-[12.5px] font-medium text-(--color-brand) hover:text-(--color-brand-ink)">
                Restablecer
              </button>
            )}
          </div>

          {applicableSliders.length === 0 ? (
            <p className="text-[13px] text-(--color-ink-faint)">
              Añade más datos en las calculadoras (gasto de marketing, clientes, ticket promedio, margen…) para poder simular escenarios.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {applicableSliders.map((slider) => {
                const percent = adjustments[slider.keys[0]] ?? 0;
                const baseValue = base[slider.keys[0]] as number | undefined;
                const adjustedValue = adjustedRaw[slider.keys[0]] as number | undefined;
                const fmt = (v: number | undefined) =>
                  v === undefined ? '—' : slider.unit === 'currency' ? formatMetricValue({ value: v, unit: 'currency' }, activeProject.currency) : v.toFixed(1);
                return (
                  <Slider
                    key={slider.id}
                    label={slider.label}
                    percent={percent}
                    onChange={(p) => updateSlider(slider.id, p)}
                    baseLabel={fmt(baseValue)}
                    adjustedLabel={fmt(adjustedValue)}
                  />
                );
              })}
            </div>
          )}

          {hasAdjustments && (
            <div className="mt-6 pt-5 border-t border-(--color-border) flex gap-2">
              <input
                value={savingName}
                onChange={(e) => setSavingName(e.target.value)}
                placeholder="Nombre del escenario…"
                className="flex-1 min-w-0 rounded-lg border border-(--color-border) bg-(--color-surface-muted) px-3 py-2 text-[13px] outline-none focus:border-(--color-brand)"
              />
              <button
                type="button"
                onClick={handleSaveScenario}
                className="shrink-0 rounded-lg bg-(--color-brand) text-white text-[13px] font-medium px-3.5 py-2 hover:bg-(--color-brand-ink) transition-colors"
              >
                {saved ? 'Guardado ✓' : 'Guardar escenario'}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) overflow-x-auto">
          <table className="w-full text-[13.5px] min-w-[560px]">
            <thead>
              <tr className="border-b border-(--color-border)">
                <th className="text-left font-medium text-(--color-ink-muted) px-4 py-3">Métrica</th>
                <th className="text-right font-medium text-(--color-ink-muted) px-4 py-3">Actual</th>
                <th className="text-right font-medium text-(--color-brand-ink) px-4 py-3">Tu simulación</th>
                <th className="text-right font-medium text-(--color-good) px-4 py-3">Optimista</th>
                <th className="text-right font-medium text-(--color-bad) px-4 py-3">Pesimista</th>
              </tr>
            </thead>
            <tbody>
              {OUTPUT_ROWS.map(({ id, label }) => (
                <ResultRow
                  key={id}
                  label={label}
                  actual={actual[id]}
                  custom={custom[id]}
                  optimistic={optimistic[id]}
                  pessimistic={pessimistic[id]}
                  currency={activeProject.currency}
                />
              ))}
              <ResultRow
                label="Utilidad estimada"
                actual={utilidadActual}
                custom={utilidadCustom}
                optimistic={utilidadOptimistic}
                pessimistic={utilidadPessimistic}
                currency={activeProject.currency}
              />
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[12px] text-(--color-ink-faint) mt-5 leading-relaxed max-w-2xl">
        Utilidad estimada = margen mensual por cliente × clientes adquiridos. Optimista y Pesimista aplican ajustes
        sugeridos (editables más adelante) sobre tus datos actuales — no son predicciones, son puntos de comparación.
      </p>
    </div>
  );
}

function ResultRow({
  label,
  actual,
  custom,
  optimistic,
  pessimistic,
  currency,
}: {
  label: string;
  actual: MetricResult;
  custom: MetricResult;
  optimistic: MetricResult;
  pessimistic: MetricResult;
  currency: string;
}) {
  return (
    <tr className="border-b border-(--color-border) last:border-0">
      <td className="px-4 py-3 text-(--color-ink-muted)">{label}</td>
      <td className="px-4 py-3 text-right tabular-nums text-(--color-ink)">{formatMetricValue(actual, currency)}</td>
      <td className="px-4 py-3 text-right tabular-nums font-medium text-(--color-brand-ink)">{formatMetricValue(custom, currency)}</td>
      <td className="px-4 py-3 text-right tabular-nums text-(--color-good)">{formatMetricValue(optimistic, currency)}</td>
      <td className="px-4 py-3 text-right tabular-nums text-(--color-bad)">{formatMetricValue(pessimistic, currency)}</td>
    </tr>
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
