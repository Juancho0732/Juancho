import { db, generateId, type Project } from './db';
import type { LtvMethod } from '../core/types';

export interface CreateProjectInput {
  name: string;
  description?: string;
  currency?: string;
  ltvMethod?: LtvMethod;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const now = Date.now();
  const project: Project = {
    id: generateId(),
    name: input.name,
    description: input.description,
    currency: input.currency ?? 'USD',
    ltvMethod: input.ltvMethod ?? 'revenue_based',
    createdAt: now,
    updatedAt: now,
  };
  await db.projects.add(project);
  return project;
}

export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function updateProject(id: string, patch: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
  await db.projects.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', db.projects, db.snapshots, db.scenarios, async () => {
    const snapshotIds = await db.snapshots.where('projectId').equals(id).primaryKeys();
    await db.scenarios.where('projectId').equals(id).delete();
    await db.snapshots.bulkDelete(snapshotIds);
    await db.projects.delete(id);
  });
}
