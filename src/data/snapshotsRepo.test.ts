import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { createProject } from './projectsRepo';
import { createSnapshot, getLatestSnapshot, listSnapshotsByProject, updateSnapshot } from './snapshotsRepo';

beforeEach(async () => {
  await db.projects.clear();
  await db.snapshots.clear();
  await db.scenarios.clear();
});

describe('snapshotsRepo', () => {
  it('crea un snapshot con los inputs crudos del usuario', async () => {
    const project = await createProject({ name: 'Purpal' });
    const snapshot = await createSnapshot({
      projectId: project.id,
      label: 'Agosto 2026',
      periodStart: Date.parse('2026-08-01'),
      periodEnd: Date.parse('2026-08-31'),
      rawInputs: { marketingSpend: 150000, newCustomers: 10 },
    });
    expect(snapshot.rawInputs.marketingSpend).toBe(150000);
  });

  it('lista snapshots de un proyecto ordenados por periodo', async () => {
    const project = await createProject({ name: 'Purpal' });
    await createSnapshot({
      projectId: project.id,
      label: 'Septiembre 2026',
      periodStart: Date.parse('2026-09-01'),
      periodEnd: Date.parse('2026-09-30'),
      rawInputs: {},
    });
    await createSnapshot({
      projectId: project.id,
      label: 'Agosto 2026',
      periodStart: Date.parse('2026-08-01'),
      periodEnd: Date.parse('2026-08-31'),
      rawInputs: {},
    });
    const list = await listSnapshotsByProject(project.id);
    expect(list.map((s) => s.label)).toEqual(['Agosto 2026', 'Septiembre 2026']);
  });

  it('getLatestSnapshot devuelve el snapshot del periodo más reciente', async () => {
    const project = await createProject({ name: 'Purpal' });
    await createSnapshot({ projectId: project.id, label: 'Agosto', periodStart: 1, periodEnd: 2, rawInputs: {} });
    const latest = await createSnapshot({ projectId: project.id, label: 'Septiembre', periodStart: 3, periodEnd: 4, rawInputs: {} });
    expect((await getLatestSnapshot(project.id))?.id).toBe(latest.id);
  });

  it('actualiza los inputs de un snapshot existente', async () => {
    const project = await createProject({ name: 'Purpal' });
    const snapshot = await createSnapshot({ projectId: project.id, label: 'Agosto', periodStart: 1, periodEnd: 2, rawInputs: { newCustomers: 5 } });
    await updateSnapshot(snapshot.id, { rawInputs: { newCustomers: 8 } });
    const list = await listSnapshotsByProject(project.id);
    expect(list[0].rawInputs.newCustomers).toBe(8);
  });

  it('devuelve undefined si el proyecto no tiene snapshots', async () => {
    const project = await createProject({ name: 'Vacío' });
    expect(await getLatestSnapshot(project.id)).toBeUndefined();
  });
});
