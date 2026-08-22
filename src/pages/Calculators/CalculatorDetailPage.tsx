import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProjectStore } from '../../state/useProjectStore';
import { getMetricDefinition } from '../../core/metricRegistry';
import { formatMetricValue, humanizeBreakdownKey } from '../../core/format';
import type { RawInputs } from '../../core/types';
import { createSnapshot, updateSnapshot } from '../../data/snapshotsRepo';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FieldInput } from '../../components/metrics/FieldInput';

export function CalculatorDetailPage() {
  const { metricId } = useParams<{ metricId: string }>();
  const navigate = useNavigate();
  const { projects, activeProjectId, snapshots, activeSnapshotId, refreshSnapshots } = useProjectStore();

  const definition = metricId ? getMetricDefinition(metricId) : undefined;
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeSnapshot = snapshots.find((s) => s.id === activeSnapshotId);

  const [rawInputs, setRawInputs] = useState<RawInputs>({});
  const [newPeriodLabel, setNewPeriodLabel] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Se re-sincroniza solo cuando cambia el snapshot activo (cambio de proyecto/periodo),
    // no en cada guardado, para no pisar ediciones locales del usuario en curso.
    setRawInputs(activeSnapshot?.rawInputs ?? {});
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSnapshot?.id]);

  if (!definition) {
    return (
      <div>
        <PageHeader title="Métrica no encontrada" />
        <Link to="/calculadoras" className="text-(--color-brand) text-[14px] font-medium">
          Volver a Calculadoras
        </Link>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div>
        <PageHeader title={definition.name} />
        <EmptyPanel text="Crea o selecciona un proyecto (arriba en iPhone, en la barra lateral en iPad) antes de introducir datos." />
      </div>
    );
  }

  function updateField(key: string, rawValue: string) {
    setDirty(true);
    setRawInputs((prev) => {
      if (key === 'ltvMethod' || key === 'conversionType') {
        return { ...prev, [key]: rawValue };
      }
      const parsed = rawValue === '' ? undefined : Number(rawValue);
      return { ...prev, [key]: parsed };
    });
  }

  async function handleSave() {
    if (!activeProject) return;
    setSaving(true);
    try {
      if (activeSnapshot) {
        await updateSnapshot(activeSnapshot.id, { rawInputs });
      } else {
        const label = newPeriodLabel.trim() || new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' });
        const now = Date.now();
        await createSnapshot({ projectId: activeProject.id, label, periodStart: now, periodEnd: now, rawInputs });
      }
      await refreshSnapshots(activeProject.id);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  const effectiveRaw: RawInputs = { ...rawInputs, ltvMethod: rawInputs.ltvMethod ?? activeProject.ltvMethod };
  const cacResult = getMetricDefinition('cac')!.compute(effectiveRaw);
  const clvResult = getMetricDefinition('clv')!.compute(effectiveRaw);
  const result = definition.compute(effectiveRaw, { cac: cacResult.value, clv: clvResult.value });
  const interpretation = definition.interpret(result);
  const status = definition.status?.(result);
  const visibleFields = definition.fields.filter((f) => !f.showIf || f.showIf(effectiveRaw));

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={definition.name}
        subtitle={activeSnapshot ? `${activeProject.name} · ${activeSnapshot.label}` : activeProject.name}
        actions={
          <Link to={`/aprendizaje/${definition.id}`} className="text-[13px] font-medium text-(--color-brand) hover:text-(--color-brand-ink)">
            ¿Qué significa esta métrica?
          </Link>
        }
      />

      {!activeSnapshot && (
        <div className="mb-5 rounded-lg border border-(--color-border) bg-(--color-surface-muted) px-4 py-3 flex flex-wrap items-center gap-3">
          <p className="text-[13px] text-(--color-ink-muted)">Este proyecto aún no tiene un periodo. Ponle nombre para guardar tus datos:</p>
          <input
            value={newPeriodLabel}
            onChange={(e) => setNewPeriodLabel(e.target.value)}
            placeholder="Ej. Agosto 2026"
            className="rounded-md border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-[13px] outline-none focus:border-(--color-brand)"
          />
        </div>
      )}

      {visibleFields.length > 0 && (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {visibleFields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={
                field.key === 'ltvMethod'
                  ? (rawInputs.ltvMethod ?? activeProject.ltvMethod)
                  : ((rawInputs as Record<string, string | number | undefined>)[field.key])
              }
              onChange={(v) => updateField(field.key, v)}
            />
          ))}
        </div>
      )}

      {visibleFields.length === 0 && (
        <p className="text-[13px] text-(--color-ink-faint) mb-5">
          Esta métrica se calcula automáticamente a partir de otras calculadoras ya completadas.
        </p>
      )}

      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 mb-5">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-[13px] font-medium text-(--color-ink-muted)">Resultado</p>
          {status && <StatusBadge status={status} />}
        </div>
        <p className="text-[32px] font-semibold tracking-tight text-(--color-ink) tabular-nums">
          {formatMetricValue(result, activeProject.currency)}
        </p>
        {result.error && <p className="text-[13px] text-(--color-bad) mt-2">{result.error}</p>}
        {interpretation && <p className="text-[13.5px] leading-relaxed text-(--color-ink-muted) mt-3">{interpretation}</p>}

        {result.breakdown && (
          <div className="mt-4 pt-4 border-t border-(--color-border) space-y-1">
            <p className="text-[12px] font-medium text-(--color-ink-faint) font-mono uppercase tracking-widest mb-1.5">Paso a paso</p>
            {Object.entries(result.breakdown)
              .filter(([, v]) => typeof v === 'number')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between text-[13px]">
                  <span className="text-(--color-ink-muted)">{humanizeBreakdownKey(key)}</span>
                  <span className="text-(--color-ink) tabular-nums">{(value as number).toLocaleString('es', { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || (!dirty && !!activeSnapshot)}
          className="rounded-lg bg-(--color-brand) text-white text-[14px] font-medium px-4 py-2.5 hover:bg-(--color-brand-ink) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando…' : activeSnapshot ? 'Guardar cambios' : 'Crear periodo y guardar'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-[13.5px] font-medium text-(--color-ink-muted) hover:text-(--color-ink)"
        >
          Ver en el Dashboard
        </button>
      </div>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-10 text-center">
      <p className="text-[13.5px] text-(--color-ink-muted)">{text}</p>
    </div>
  );
}
