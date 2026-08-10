import { db, generateId, type Snapshot } from './db';
import type { RawInputs } from '../core/types';

export interface CreateSnapshotInput {
  projectId: string;
  label: string;
  periodStart: number;
  periodEnd: number;
  rawInputs: RawInputs;
}

export async function createSnapshot(input: CreateSnapshotInput): Promise<Snapshot> {
  const now = Date.now();
  const snapshot: Snapshot = {
    id: generateId(),
    projectId: input.projectId,
    label: input.label,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    rawInputs: input.rawInputs,
    createdAt: now,
    updatedAt: now,
  };
  await db.snapshots.add(snapshot);
  await db.projects.update(input.projectId, { updatedAt: now });
  return snapshot;
}

export async function listSnapshotsByProject(projectId: string): Promise<Snapshot[]> {
  return db.snapshots.where('projectId').equals(projectId).sortBy('periodStart');
}

export async function getLatestSnapshot(projectId: string): Promise<Snapshot | undefined> {
  const snapshots = await listSnapshotsByProject(projectId);
  return snapshots.at(-1);
}

export async function getSnapshot(id: string): Promise<Snapshot | undefined> {
  return db.snapshots.get(id);
}

export async function updateSnapshot(id: string, patch: Partial<Pick<Snapshot, 'label' | 'periodStart' | 'periodEnd' | 'rawInputs'>>): Promise<void> {
  await db.snapshots.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteSnapshot(id: string): Promise<void> {
  await db.transaction('rw', db.snapshots, db.scenarios, async () => {
    await db.scenarios.where('baseSnapshotId').equals(id).delete();
    await db.snapshots.delete(id);
  });
}
