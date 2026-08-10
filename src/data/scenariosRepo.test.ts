import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { createProject } from './projectsRepo';
import { createSnapshot } from './snapshotsRepo';
import { createScenario, deleteScenario, listScenariosByProject } from './scenariosRepo';

beforeEach(async () => {
  await db.projects.clear();
  await db.snapshots.clear();
  await db.scenarios.clear();
});

describe('scenariosRepo', () => {
  it('crea un escenario referenciando un snapshot base, sin duplicar inputs', async () => {
    const project = await createProject({ name: 'Purpal' });
    const snapshot = await createSnapshot({ projectId: project.id, label: 'Agosto', periodStart: 1, periodEnd: 2, rawInputs: { marketingSpend: 1000 } });
    const scenario = await createScenario({
      projectId: project.id,
      baseSnapshotId: snapshot.id,
      name: 'Optimista',
      type: 'optimista',
      adjustments: { marketingSpend: -10 },
    });
    expect(scenario.baseSnapshotId).toBe(snapshot.id);
    expect(scenario.adjustments.marketingSpend).toBe(-10);
  });

  it('lista escenarios de un proyecto', async () => {
    const project = await createProject({ name: 'Purpal' });
    const snapshot = await createSnapshot({ projectId: project.id, label: 'Agosto', periodStart: 1, periodEnd: 2, rawInputs: {} });
    await createScenario({ projectId: project.id, baseSnapshotId: snapshot.id, name: 'Optimista', type: 'optimista', adjustments: {} });
    await createScenario({ projectId: project.id, baseSnapshotId: snapshot.id, name: 'Pesimista', type: 'pesimista', adjustments: {} });
    const list = await listScenariosByProject(project.id);
    expect(list).toHaveLength(2);
  });

  it('borra un escenario', async () => {
    const project = await createProject({ name: 'Purpal' });
    const snapshot = await createSnapshot({ projectId: project.id, label: 'Agosto', periodStart: 1, periodEnd: 2, rawInputs: {} });
    const scenario = await createScenario({ projectId: project.id, baseSnapshotId: snapshot.id, name: 'Custom', type: 'custom', adjustments: {} });
    await deleteScenario(scenario.id);
    expect(await listScenariosByProject(project.id)).toHaveLength(0);
  });
});
