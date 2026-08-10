import { useState } from 'react';
import { useProjectStore } from '../../state/useProjectStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { PlusIcon } from '../../components/ui/icons';

export function ProjectsPage() {
  const { projects, activeProjectId, snapshots, activeSnapshotId, selectProject, selectSnapshot, addProject, renameProject, removeProject } =
    useProjectStore();
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | undefined>();
  const [renameValue, setRenameValue] = useState('');

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await addProject(name);
    setNewName('');
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
