import { useRef, useState } from 'react';
import { useProjectStore } from '../../state/useProjectStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { PlusIcon } from '../../components/ui/icons';
import { exportSnapshotsToCsv, parseSnapshotsFromCsv } from '../../data/csv';
import { downloadTextFile } from '../../data/download';
import { generateAnalysisPdf } from '../../data/pdf';
import { createSnapshot } from '../../data/snapshotsRepo';

export function ProjectsPage() {
  const { projects, activeProjectId, snapshots, activeSnapshotId, selectProject, selectSnapshot, addProject, renameProject, removeProject, refreshSnapshots } =
    useProjectStore();
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | undefined>();
  const [renameValue, setRenameValue] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importMessage, setImportMessage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeSnapshot = snapshots.find((s) => s.id === activeSnapshotId);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await addProject(name);
    setNewName('');
  }

  function handleExportCsv() {
    if (!activeProject) return;
    const csv = exportSnapshotsToCsv(snapshots);
    downloadTextFile(`${activeProject.name}.csv`, csv, 'text/csv;charset=utf-8');
  }

  function handleExportPdf() {
    if (!activeProject || !activeSnapshot) return;
    const doc = generateAnalysisPdf(activeProject, activeSnapshot);
    doc.save(`${activeProject.name} - ${activeSnapshot.label}.pdf`);
  }

  async function handleImportCsv(file: File) {
    if (!activeProject) return;
    const text = await file.text();
    const { rows, errors } = parseSnapshotsFromCsv(text);
    setImportErrors(errors);
    for (const row of rows) {
      await createSnapshot({ projectId: activeProject.id, label: row.label, periodStart: row.periodStart, periodEnd: row.periodEnd, rawInputs: row.rawInputs });
    }
    await refreshSnapshots(activeProject.id);
    setImportMessage(rows.length > 0 ? `Se importaron ${rows.length} periodo(s).` : undefined);
  }

  return (
    <div>
      <PageHeader title="Proyectos" subtitle="Cada proyecto agrupa sus propios datos, métricas, historial y escenarios." />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-6">
        <div>
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
            <div className="flex gap-2 mb-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Nombre del proyecto…"
                className="flex-1 min-w-0 rounded-lg border border-(--color-border) bg-(--color-surface-muted) px-3 py-2 text-[13.5px] outline-none focus:border-(--color-brand)"
              />
              <button
                type="button"
                onClick={handleCreate}
                className="shrink-0 rounded-lg bg-(--color-brand) text-white p-2 hover:bg-(--color-brand-ink) transition-colors"
                aria-label="Crear proyecto"
              >
                <PlusIcon width={17} height={17} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {projects.length === 0 && <p className="text-[13px] text-(--color-ink-faint) px-2 py-3">Todavía no tienes proyectos.</p>}
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer ${
                    project.id === activeProjectId ? 'bg-(--color-brand-soft)' : 'hover:bg-(--color-surface-muted)'
                  }`}
                  onClick={() => selectProject(project.id)}
                >
                  {renamingId === project.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          await renameProject(project.id, renameValue.trim() || project.name);
                          setRenamingId(undefined);
                        }
                      }}
                      onBlur={() => setRenamingId(undefined)}
                      className="flex-1 min-w-0 rounded-md border border-(--color-border) bg-(--color-surface) px-2 py-1 text-[13.5px] outline-none focus:border-(--color-brand)"
                    />
                  ) : (
                    <span
                      className={`flex-1 min-w-0 text-[13.5px] truncate ${
                        project.id === activeProjectId ? 'text-(--color-brand-ink) font-medium' : 'text-(--color-ink)'
                      }`}
                    >
                      {project.name}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(project.id);
                      setRenameValue(project.name);
                    }}
                    className="text-[12px] text-(--color-ink-faint) hover:text-(--color-ink) px-1.5 py-1"
                  >
                    Renombrar
                  </button>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`¿Eliminar el proyecto "${project.name}" y todos sus datos? Esta acción no se puede deshacer.`)) {
                        await removeProject(project.id);
                      }
                    }}
                    className="text-[12px] text-(--color-bad) hover:text-(--color-bad) px-1.5 py-1"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {activeProjectId ? (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
                <p className="text-[13px] font-medium text-(--color-ink-muted) mb-3">Periodos guardados</p>
                {snapshots.length === 0 ? (
                  <p className="text-[13px] text-(--color-ink-faint)">
                    Este proyecto todavía no tiene periodos. Introduce datos en cualquier calculadora para crear el primero.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {snapshots.map((snapshot) => (
                      <button
                        key={snapshot.id}
                        type="button"
                        onClick={() => selectSnapshot(snapshot.id)}
                        className={`text-left rounded-lg px-3 py-2.5 text-[13.5px] ${
                          snapshot.id === activeSnapshotId
                            ? 'bg-(--color-brand-soft) text-(--color-brand-ink) font-medium'
                            : 'hover:bg-(--color-surface-muted) text-(--color-ink)'
                        }`}
                      >
                        {snapshot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
                <p className="text-[13px] font-medium text-(--color-ink-muted) mb-3">Importar y exportar</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={snapshots.length === 0}
                    onClick={handleExportCsv}
                    className="rounded-lg border border-(--color-border) px-3.5 py-2 text-[13px] font-medium text-(--color-ink) hover:bg-(--color-surface-muted) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Exportar CSV
                  </button>
                  <button
                    type="button"
                    disabled={!activeSnapshot}
                    onClick={handleExportPdf}
                    className="rounded-lg border border-(--color-border) px-3.5 py-2 text-[13px] font-medium text-(--color-ink) hover:bg-(--color-surface-muted) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Exportar PDF del periodo activo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-(--color-border) px-3.5 py-2 text-[13px] font-medium text-(--color-ink) hover:bg-(--color-surface-muted) transition-colors"
                  >
                    Importar CSV
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportCsv(file);
                      e.target.value = '';
                    }}
                  />
                </div>
                {importMessage && <p className="text-[12.5px] text-(--color-good) mt-3">{importMessage}</p>}
                {importErrors.length > 0 && (
                  <div className="mt-3 text-[12px] text-(--color-bad) space-y-0.5">
                    {importErrors.map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                  </div>
                )}
                <p className="text-[12px] text-(--color-ink-faint) mt-3">
                  El CSV incluye todos los periodos del proyecto con sus datos crudos, y puede reimportarse sin pérdida de información.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-14 text-center">
              <p className="text-[13.5px] text-(--color-ink-muted)">Selecciona o crea un proyecto para ver sus periodos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
