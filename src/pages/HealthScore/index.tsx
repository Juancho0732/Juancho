import { Link } from 'react-router-dom';
import { useProjectStore } from '../../state/useProjectStore';
import { computeHealthScore } from '../../core/healthScore/score';
import { PageHeader } from '../../components/ui/PageHeader';

function scoreColor(score: number): string {
  if (score >= 70) return 'text-(--color-good)';
  if (score >= 40) return 'text-(--color-warning)';
  return 'text-(--color-bad)';
}

function barColor(score: number): string {
  if (score >= 70) return 'bg-(--color-good)';
  if (score >= 40) return 'bg-(--color-warning)';
  return 'bg-(--color-bad)';
}

export function HealthScorePage() {
  const { projects, activeProjectId, snapshots, activeSnapshotId } = useProjectStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeSnapshot = snapshots.find((s) => s.id === activeSnapshotId);

  if (!activeProject) {
    return (
      <div>
        <PageHeader title="Marketing Health Score" subtitle="Puntuación de 0 a 100 con metodología documentada y visible." />
        <EmptyPanel text="Crea o selecciona un proyecto para ver su Health Score." />
      </div>
    );
  }

  if (!activeSnapshot) {
    return (
      <div>
        <PageHeader title="Marketing Health Score" subtitle="Puntuación de 0 a 100 con metodología documentada y visible." />
        <EmptyPanel text={`"${activeProject.name}" todavía no tiene datos.`} action />
      </div>
    );
  }

  const { overall, dimensions } = computeHealthScore(activeSnapshot.rawInputs, activeProject.ltvMethod);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Marketing Health Score" subtitle={`${activeProject.name} · ${activeSnapshot.label}`} />

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 mb-5 flex items-center gap-6 flex-wrap">
        {overall !== undefined ? (
          <>
            <p className={`text-[48px] font-semibold tabular-nums leading-none ${scoreColor(overall)}`}>{overall}</p>
            <div>
              <p className="text-[14px] font-medium text-(--color-ink)">de 100 puntos</p>
              <p className="text-[13px] text-(--color-ink-muted) mt-1">
                Calculado con {dimensions.filter((d) => d.score !== undefined).length} de {dimensions.length} dimensiones disponibles.
              </p>
            </div>
          </>
        ) : (
          <p className="text-[13.5px] text-(--color-ink-muted)">
            Todavía no hay suficientes datos para calcular ninguna dimensión. Añade datos de CAC, LTV, márgenes, churn o publicidad.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 mb-5">
        <p className="text-[13px] font-medium text-(--color-ink-muted) mb-4">Dimensiones</p>
        <div className="flex flex-col gap-4">
          {dimensions.map((d) => (
            <div key={d.id}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[13.5px] font-medium text-(--color-ink)">{d.label}</span>
                <span className={`text-[13px] font-medium tabular-nums ${d.score !== undefined ? scoreColor(d.score) : 'text-(--color-ink-faint)'}`}>
                  {d.score !== undefined ? `${Math.round(d.score)}/100` : 'Sin datos'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-(--color-surface-muted) overflow-hidden">
                {d.score !== undefined && <div className={`h-full rounded-full ${barColor(d.score)}`} style={{ width: `${d.score}%` }} />}
              </div>
              <p className="text-[12px] text-(--color-ink-faint) mt-1">{d.basis}</p>
            </div>
          ))}
        </div>
      </div>

      <details className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <summary className="text-[13.5px] font-medium text-(--color-ink) cursor-pointer">¿Cómo se calcula este puntaje?</summary>
        <div className="text-[13px] text-(--color-ink-muted) leading-relaxed mt-3 space-y-2">
          <p>
            Se evalúan 5 dimensiones, cada una anclada a una sola métrica ya calculada, normalizada de 0 a 100 con un
            punto de referencia orientativo (no una regla absoluta):
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Adquisición → LTV:CAC, donde 3x equivale a 100 puntos.</li>
            <li>Rentabilidad → Margen neto %, donde 20% equivale a 100 puntos.</li>
            <li>Monetización → Margen bruto %, donde 60% equivale a 100 puntos.</li>
            <li>Retención → Tasa de retención %, mapeada directamente (ya es un porcentaje de 0 a 100).</li>
            <li>Eficiencia publicitaria → ROAS, donde 3x equivale a 100 puntos.</li>
          </ul>
          <p>
            Cada dimensión se limita entre 0 y 100 puntos. Si falta el dato que una dimensión necesita, esa dimensión
            se excluye del cálculo (no se le asigna cero). El puntaje total es el promedio ponderado de las
            dimensiones disponibles — por defecto los 5 pesos son iguales (20% cada una).
          </p>
        </div>
      </details>
    </div>
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
