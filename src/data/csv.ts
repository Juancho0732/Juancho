/**
 * Exportación e importación de periodos (snapshots) a/desde CSV.
 * Un CSV = los periodos de un proyecto, una fila por periodo, con todas las
 * columnas de inputs crudos que la app reconoce — así el archivo exportado
 * de un proyecto puede reimportarse sin pérdida de datos.
 */
import Papa from 'papaparse';
import type { RawInputs } from '../core/types';
import type { Snapshot } from './db';

/** Orden fijo de columnas para que exportar → importar sea estable. */
const RAW_INPUT_COLUMNS: (keyof RawInputs)[] = [
  'marketingSpend',
  'salesSpend',
  'newCustomers',
  'ltvMethod',
  'avgOrderValue',
  'purchaseFrequencyPerYear',
  'customerLifespanYears',
  'marginPerPurchase',
  'revenue',
  'cogs',
  'operatingExpenses',
  'ordersCount',
  'customersStart',
  'customersLost',
  'activeUsers',
  'adSpend',
  'attributedRevenue',
  'clicks',
  'impressions',
  'visitors',
  'conversions',
  'conversionType',
  'campaignCost',
  'investment',
  'gain',
  'monthlyMarginPerCustomer',
];

const NON_NUMERIC_COLUMNS = new Set<keyof RawInputs>(['ltvMethod', 'conversionType']);

export function exportSnapshotsToCsv(snapshots: Snapshot[]): string {
  const rows = snapshots.map((s) => {
    const row: Record<string, string> = {
      label: s.label,
      periodStart: new Date(s.periodStart).toISOString().slice(0, 10),
      periodEnd: new Date(s.periodEnd).toISOString().slice(0, 10),
    };
    for (const key of RAW_INPUT_COLUMNS) {
      const value = s.rawInputs[key];
      row[key] = value === undefined ? '' : String(value);
    }
    return row;
  });
  return Papa.unparse({ fields: ['label', 'periodStart', 'periodEnd', ...RAW_INPUT_COLUMNS], data: rows });
}

export interface ParsedSnapshotRow {
  label: string;
  periodStart: number;
  periodEnd: number;
  rawInputs: RawInputs;
}

export interface CsvParseResult {
  rows: ParsedSnapshotRow[];
  errors: string[];
}

export function parseSnapshotsFromCsv(csvText: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
  const errors: string[] = parsed.errors.map((e) => `Fila ${e.row ?? '?'}: ${e.message}`);
  const rows: ParsedSnapshotRow[] = [];

  parsed.data.forEach((record, index) => {
    if (!record.label) {
      errors.push(`Fila ${index + 1}: falta la columna "label".`);
      return;
    }
    const periodStart = record.periodStart ? Date.parse(record.periodStart) : Date.now();
    const periodEnd = record.periodEnd ? Date.parse(record.periodEnd) : periodStart;
    const rawInputs: RawInputs = {};
    for (const key of RAW_INPUT_COLUMNS) {
      const raw = record[key];
      if (raw === undefined || raw === '') continue;
      if (NON_NUMERIC_COLUMNS.has(key)) {
        (rawInputs[key] as unknown as string) = raw;
        continue;
      }
      const num = Number(raw);
      if (Number.isNaN(num)) {
        errors.push(`Fila ${index + 1}: el valor de "${key}" ("${raw}") no es un número válido.`);
        continue;
      }
      (rawInputs[key] as unknown as number) = num;
    }
    rows.push({ label: record.label, periodStart, periodEnd, rawInputs });
  });

  return { rows, errors };
}
