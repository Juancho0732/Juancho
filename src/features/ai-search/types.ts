import type { Place } from '@/types/database';

/** Debe reflejar SearchIntent en supabase/functions/ai-search/types.ts. */
export type SearchIntent = {
  people: number | null;
  budgetTotal: number | null;
  location: string | null;
  occasion: string | null;
  categoryHint: string | null;
  activityPreference: string | null;
};

export type AiSearchResult = Place & { score: number };

export type AiSearchSuccess = {
  status: 'ok';
  intent: SearchIntent;
  explanation: string;
  results: AiSearchResult[];
};

export type AiSearchClarification = {
  status: 'needs_clarification';
  message: string;
};

export type AiSearchError = {
  status: 'error';
  message: string;
};

export type AiSearchResponse = AiSearchSuccess | AiSearchClarification | AiSearchError;
