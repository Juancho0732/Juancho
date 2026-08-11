import { BOGOTA_LOCALITIES, EMPTY_INTENT, OCCASION_VALUES } from './intentSchema.ts';
import type { SearchIntent } from './types.ts';

type OccasionValue = (typeof OCCASION_VALUES)[number];

const OCCASION_KEYWORDS: Record<string, OccasionValue> = {
  novia: 'pareja',
  novio: 'pareja',
  pareja: 'pareja',
  cita: 'pareja',
  amigos: 'amigos',
  amigas: 'amigos',
  familia: 'familia',
  papas: 'familia',
  solo: 'solo',
  sola: 'solo',
  trabajo: 'trabajo',
  colegas: 'trabajo',
  oficina: 'trabajo',
};

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extractBudget(text: string): number | null {
  const milMatch = text.match(/(\d+)\s*mil\b/i);
  if (milMatch) return Number(milMatch[1]) * 1000;

  const numberMatch = text.match(/\$\s?(\d{1,3}(?:[.,]\d{3})+|\d{4,7})|\b(\d{1,3}(?:[.,]\d{3})+)\b/);
  const raw = numberMatch?.[1] ?? numberMatch?.[2];
  if (!raw) return null;
  const value = Number(raw.replace(/[.,]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function extractPeople(text: string): number | null {
  const match =
    text.match(/(\d+)\s*(personas|amigos|amigas)\b/i) ?? text.match(/somos\s+(\d+)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function extractLocation(text: string): string | null {
  const normalized = stripAccents(text.toLowerCase());
  return (
    BOGOTA_LOCALITIES.find((locality) => normalized.includes(stripAccents(locality.toLowerCase()))) ??
    null
  );
}

function extractOccasion(text: string): SearchIntent['occasion'] {
  const normalized = stripAccents(text.toLowerCase());
  for (const [keyword, occasion] of Object.entries(OCCASION_KEYWORDS)) {
    if (normalized.includes(stripAccents(keyword))) return occasion;
  }
  return null;
}

/**
 * Respaldo para cuando la llamada a la IA falla (red, proveedor caído, error
 * de parseo). Reconoce menos matices que un LLM — solo señales concretas
 * (presupuesto, localidad, personas, ocasión) — pero evita dejar al usuario
 * sin resultados (docs/00-fase0-analisis.md §7).
 */
export function heuristicParseIntent(query: string): SearchIntent {
  return {
    ...EMPTY_INTENT,
    people: extractPeople(query),
    budgetTotal: extractBudget(query),
    location: extractLocation(query),
    occasion: extractOccasion(query),
  };
}
