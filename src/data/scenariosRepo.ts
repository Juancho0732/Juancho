import { db, generateId, type Scenario, type ScenarioType } from './db';

export interface CreateScenarioInput {
  projectId: string;
  baseSnapshotId: string;
  name: string;
  type: ScenarioType;
  adjustments: Record<string, number>;
}

export async function createScenario(input: CreateScenarioInput): Promise<Scenario> {
  const scenario: Scenario = {
    id: generateId(),
    projectId: input.projectId,
    baseSnapshotId: input.baseSnapshotId,
    name: input.name,
    type: input.type,
    adjustments: input.adjustments,
    createdAt: Date.now(),
  };
  await db.scenarios.add(scenario);
  return scenario;
}

export async function listScenariosByProject(projectId: string): Promise<Scenario[]> {
  return db.scenarios.where('projectId').equals(projectId).toArray();
}

export async function deleteScenario(id: string): Promise<void> {
  await db.scenarios.delete(id);
}
