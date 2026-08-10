import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { createProject, deleteProject, getProject, listProjects, updateProject } from './projectsRepo';
import { createSnapshot } from './snapshotsRepo';

beforeEach(async () => {
  await db.projects.clear();
  await db.snapshots.clear();
  await db.scenarios.clear();
});

describe('projectsRepo', () => {
  it('crea un proyecto con valores por defecto', async () => {
    const project = await createProject({ name: 'Purpal' });
    expect(project.name).toBe('Purpal');
    expect(project.currency).toBe('USD');
    expect(project.ltvMethod).toBe('revenue_based');
  });

  it('lista proyectos ordenados por actualización más reciente primero', async () => {
    const a = await createProject({ name: 'A' });
    await new Promise((r) => setTimeout(r, 2));
    await createProject({ name: 'B' });
    const list = await listProjects();
    expect(list[0].name).toBe('B');
    expect(list.map((p) => p.id)).toContain(a.id);
  });

  it('actualiza un proyecto', async () => {
    const project = await createProject({ name: 'Purpal' });
    await updateProject(project.id, { name: 'Purpal Renombrado' });
    const updated = await getProject(project.id);
    expect(updated?.name).toBe('Purpal Renombrado');
  });

  it('al borrar un proyecto borra también sus snapshots', async () => {
    const project = await createProject({ name: 'Purpal' });
    await createSnapshot({
      projectId: project.id,
      label: 'Agosto 2026',
      periodStart: Date.now(),
      periodEnd: Date.now(),
      rawInputs: {},
    });
    await deleteProject(project.id);
    expect(await getProject(project.id)).toBeUndefined();
    expect(await db.snapshots.where('projectId').equals(project.id).count()).toBe(0);
  });
});
