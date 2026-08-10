import { Link } from 'react-router-dom';
import { useProjectStore } from '../../state/useProjectStore';
import { runDiagnostics, type DiagnosticSeverity } from '../../core/diagnostics/rules';
import { PageHeader } from '../../components/ui/PageHeader';

const SEVERITY_BORDER: Record<DiagnosticSeverity, string> = {
  critical: 'border-l-(--color-bad)',
  warning: 'border-l-(--color-warning)',
  info: 'border-l-(--color-neutral)',
};

const SEVERITY_LABELS: Record<DiagnosticSeverity, string> = {
  critical: 'Crítico',
  warning: 'Atención',
  info: 'Para tener en cuenta',
};

const SEVERITY_TEXT: Record<DiagnosticSeverity, string> = {
  critical: 'text-(--color-bad)',
  warning: 'text-(--color-warning)',
  info: 'text-(--color-neutral)',
};

export function DiagnosticsPage() {
  const { projects, activeProjectId, snapshots, activeSnapshotId } = useProjectStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeSnapshot = snapshots.find((s) => s.id === activeSnapshotId);

  if (!activeProject) {
    return (
      <div>
        <PageHeader title="Diagnóstico" subtitle="Detección automática de problemas a partir de tus métricas reales." />
        <EmptyPanel text="Crea o selecciona un proyecto para ver su diagnóstico." />
      </div>
    );
  }

  if (!activeSnapshot) {
    return (
      <div>
        <PageHeader title="Diagnóstico" subtitle="Detección automática de problemas a partir de tus métricas reales." />
        <EmptyPanel text={`"${activeProject.name}" todavía no tiene datos. Añade un periodo desde las calculadoras.`} action />
      </div>
    );
  }

  const findings = runDiagnostics(activeSnapshot.rawInputs, activeProject.ltvMethod, activeProject.currency);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Diagnóstico" subtitle={`${activeProject.name} · ${activeSnapshot.label}`} />

      {findings.length === 0 ? (
        <div className="rounded-xl border border-(--color-good) bg-(--color-good-soft) px-5 py-6">
          <p className="text-[14px] font-medium text-(--color-good)">No se detectaron problemas con los datos disponibles.</p>
          <p className="text-[13px] text-(--color-ink-muted) mt-1.5">
            A medida que añadas más datos (márgenes, churn, publicidad) el diagnóstico podrá evaluar más aspectos de tu negocio.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {findings.map((finding) => (
            <div
              key={finding.id}
              className={`rounded-xl bg-(--color-surface) border border-(--color-border) border-l-4 ${SEVERITY_BORDER[finding.severity]} p-4`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_TEXT[finding.severity]}`}>
                  {SEVERITY_LABELS[finding.severity]}
                </span>
              </div>
              <p className="text-[14.5px] font-medium text-(--color-ink)">{finding.title}</p>
              <p className="text-[13.5px] leading-relaxed text-(--color-ink-muted) mt-1.5">{finding.message}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-[12px] text-(--color-ink-faint) mt-6 leading-relaxed">
        El diagnóstico solo evalúa los aspectos para los que introdujiste datos, y usa siempre tus números reales. Las
        referencias de industria que se mencionan (p. ej. "3x" en LTV:CAC) son orientativas, no reglas absolutas.
      </p>
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
