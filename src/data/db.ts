/**
 * Capa de almacenamiento local (IndexedDB vía Dexie).
 *
 * Decisión de producto y arquitectura: la app NO tiene backend. Todos los
 * datos del usuario viven únicamente en su dispositivo, en IndexedDB. Esto
 * es deliberado (ver sección de privacidad de la especificación): no hay
 * login, no hay sincronización entre dispositivos, no se envía nada a
 * servidores externos. La contrapartida es que el usuario es responsable de
 * exportar sus datos (CSV/JSON) si quiere conservarlos al cambiar de
 * dispositivo o reinstalar la app — la UI debe recordárselo.
 *
 * Los snapshots guardan SOLO los inputs crudos que introduce el usuario.
 * Las métricas nunca se persisten calculadas: siempre se derivan en el
 * momento desde `/core` para que un cambio de fórmula no deje datos
 * históricos desincronizados.
 */
import Dexie, { type EntityTable } from 'dexie';
import type { LtvMethod, RawInputs } from '../core/types';

export interface Project {
  id: string;
  name: string;
  description?: string;
  currency: string;
  /** Método de LTV fijado para todo el proyecto, para que Payback, Diagnóstico,
   * Health Score y Simulador sean siempre consistentes entre sí. */
  ltvMethod: LtvMethod;
  createdAt: number;
  updatedAt: number;
}

export interface Snapshot {
  id: string;
  projectId: string;
  /** Etiqueta legible, ej. "Agosto 2026". */
  label: string;
  periodStart: number;
  periodEnd: number;
  rawInputs: RawInputs;
  createdAt: number;
  updatedAt: number;
}

export type ScenarioType = 'optimista' | 'pesimista' | 'custom';

export interface Scenario {
  id: string;
  projectId: string;
  baseSnapshotId: string;
  name: string;
  type: ScenarioType;
  /** Deltas porcentuales aplicados sobre los inputs del snapshot base, ej. { cac: -15, retention: 10 }. */
  adjustments: Record<string, number>;
  createdAt: number;
}

class MarketingMetricsDB extends Dexie {
  projects!: EntityTable<Project, 'id'>;
  snapshots!: EntityTable<Snapshot, 'id'>;
  scenarios!: EntityTable<Scenario, 'id'>;

  constructor() {
    super('marketing-metrics');
    this.version(1).stores({
      projects: 'id, name, updatedAt',
      snapshots: 'id, projectId, periodStart, updatedAt',
      scenarios: 'id, projectId, baseSnapshotId',
    });
  }
}

export const db = new MarketingMetricsDB();

export function generateId(): string {
  return crypto.randomUUID();
}
