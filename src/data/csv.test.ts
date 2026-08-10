import { describe, expect, it } from 'vitest';
import { exportSnapshotsToCsv, parseSnapshotsFromCsv } from './csv';
import type { Snapshot } from './db';

const snapshot: Snapshot = {
  id: '1',
  projectId: 'p1',
  label: 'Agosto 2026',
  periodStart: Date.parse('2026-08-01'),
  periodEnd: Date.parse('2026-08-31'),
  rawInputs: { marketingSpend: 150000, salesSpend: 90000, newCustomers: 5, ltvMethod: 'revenue_based' },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('exportSnapshotsToCsv', () => {
  it('incluye la etiqueta y los inputs crudos', () => {
    const csv = exportSnapshotsToCsv([snapshot]);
    expect(csv).toContain('Agosto 2026');
    expect(csv).toContain('150000');
    expect(csv).toContain('revenue_based');
  });
});

describe('parseSnapshotsFromCsv', () => {
  it('reimporta lo que exportó, sin pérdida de datos (round-trip)', () => {
    const csv = exportSnapshotsToCsv([snapshot]);
    const { rows, errors } = parseSnapshotsFromCsv(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toBe('Agosto 2026');
    expect(rows[0].rawInputs.marketingSpend).toBe(150000);
    expect(rows[0].rawInputs.ltvMethod).toBe('revenue_based');
  });

  it('reporta un error por fila cuando falta la etiqueta', () => {
    const { rows, errors } = parseSnapshotsFromCsv('label,marketingSpend\n,1000\n');
    expect(rows).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('reporta un error cuando un campo numérico no es un número válido', () => {
    const { errors } = parseSnapshotsFromCsv('label,marketingSpend\nAgosto,abc\n');
    expect(errors.some((e) => e.includes('marketingSpend'))).toBe(true);
  });

  it('ignora columnas vacías sin generar un input inválido', () => {
    const { rows } = parseSnapshotsFromCsv('label,marketingSpend,salesSpend\nAgosto,1000,\n');
    expect(rows[0].rawInputs.marketingSpend).toBe(1000);
    expect(rows[0].rawInputs.salesSpend).toBeUndefined();
  });
});
