import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../../state/useProjectStore';
import { ChevronDownIcon, PlusIcon, ProjectsIcon } from '../ui/icons';

export function ProjectSwitcher() {
  const { projects, activeProjectId, selectProject, addProject } = useProjectStore();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await addProject(name);
    setNewName('');
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 rounded-lg border border-(--color-border) bg-(--color-surface-muted) px-3 py-2.5 text-left hover:border-(--color-border-strong) transition-colors"
      >
        <ProjectsIcon width={17} height={17} className="text-(--color-ink-faint) shrink-0" />
        <span className="flex-1 min-w-0 text-[13.5px] font-medium text-(--color-ink) truncate">
          {activeProject?.name ?? 'Sin proyectos'}
        </span>
        <ChevronDownIcon width={15} height={15} className="text-(--color-ink-faint) shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-(--color-border) bg-(--color-surface) shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto py-1">
            {projects.length === 0 && (
              <p className="px-3 py-2 text-[13px] text-(--color-ink-faint)">Todavía no tienes proyectos.</p>
            )}
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={async () => {
                  await selectProject(project.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[13.5px] truncate hover:bg-(--color-surface-muted) ${
                  project.id === activeProjectId ? 'text-(--color-brand-ink) font-medium' : 'text-(--color-ink)'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
          <div className="border-t border-(--color-border) p-2 flex gap-1.5">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nuevo proyecto…"
              className="flex-1 min-w-0 rounded-md border border-(--color-border) bg-(--color-canvas) px-2.5 py-1.5 text-[13px] text-(--color-ink) outline-none focus:border-(--color-brand)"
            />
            <button
              type="button"
              onClick={handleCreate}
              aria-label="Crear proyecto"
              className="shrink-0 rounded-md bg-(--color-brand) text-white p-1.5 hover:bg-(--color-brand-ink) transition-colors"
            >
              <PlusIcon width={16} height={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
