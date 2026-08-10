import { create } from 'zustand';
import type { Project, Snapshot } from '../data/db';
import { createProject, deleteProject as deleteProjectRepo, listProjects, updateProject } from '../data/projectsRepo';
import { getLatestSnapshot, listSnapshotsByProject } from '../data/snapshotsRepo';

const ACTIVE_PROJECT_KEY = 'marketing-metrics:active-project-id';

interface ProjectStoreState {
  projects: Project[];
  activeProjectId: string | undefined;
  snapshots: Snapshot[];
  activeSnapshotId: string | undefined;
  loading: boolean;
  hydrate: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  selectSnapshot: (snapshotId: string) => void;
  addProject: (name: string) => Promise<Project>;
  renameProject: (id: string, name: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  refreshSnapshots: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: [],
  activeProjectId: undefined,
  snapshots: [],
  activeSnapshotId: undefined,
  loading: true,

  hydrate: async () => {
    const projects = await listProjects();
    const storedId = localStorage.getItem(ACTIVE_PROJECT_KEY) ?? undefined;
    const activeProjectId = projects.find((p) => p.id === storedId)?.id ?? projects[0]?.id;
    set({ projects, activeProjectId, loading: false });
    if (activeProjectId) await get().refreshSnapshots(activeProjectId);
  },

  selectProject: async (projectId) => {
    localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
    set({ activeProjectId: projectId });
    await get().refreshSnapshots(projectId);
  },

  selectSnapshot: (snapshotId) => set({ activeSnapshotId: snapshotId }),

  refreshSnapshots: async (projectId) => {
    const snapshots = await listSnapshotsByProject(projectId);
    const latest = await getLatestSnapshot(projectId);
    set({ snapshots, activeSnapshotId: latest?.id });
  },

  addProject: async (name) => {
    const project = await createProject({ name });
    set({ projects: [project, ...get().projects] });
    await get().selectProject(project.id);
    return project;
  },

  renameProject: async (id, name) => {
    await updateProject(id, { name });
    set({ projects: get().projects.map((p) => (p.id === id ? { ...p, name } : p)) });
  },

  removeProject: async (id) => {
    await deleteProjectRepo(id);
    const remaining = get().projects.filter((p) => p.id !== id);
    set({ projects: remaining });
    if (get().activeProjectId === id) {
      const next = remaining[0]?.id;
      if (next) await get().selectProject(next);
      else set({ activeProjectId: undefined, snapshots: [], activeSnapshotId: undefined });
    }
  },
}));
