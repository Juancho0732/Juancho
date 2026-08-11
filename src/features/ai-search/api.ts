import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase/client';

import type { AiSearchResponse } from './types';

const GENERIC_ERROR: AiSearchResponse = {
  status: 'error',
  message: 'No pudimos conectarnos con la búsqueda por IA. Intenta de nuevo en un momento.',
};

const NETWORK_ERROR: AiSearchResponse = {
  status: 'error',
  message: 'No hay conexión. Revisa tu internet e intenta de nuevo.',
};

function isAiSearchResponse(value: unknown): value is AiSearchResponse {
  if (typeof value !== 'object' || value === null || !('status' in value)) return false;
  const status = (value as { status: unknown }).status;
  return status === 'ok' || status === 'needs_clarification' || status === 'error';
}

/**
 * La Edge Function responde con códigos HTTP reales (401, 429, 500...) para
 * que queden bien en logs/monitoreo, pero supabase-js solo expone el cuerpo
 * vía `data` cuando la respuesta es 2xx — en cualquier otro caso hay que
 * sacarlo de `error.context` (ver docs de FunctionsHttpError).
 */
export async function runAiSearch(query: string): Promise<AiSearchResponse> {
  const { data, error } = await supabase.functions.invoke('ai-search', { body: { query } });

  if (!error) {
    return isAiSearchResponse(data) ? data : GENERIC_ERROR;
  }

  if (error instanceof FunctionsHttpError) {
    try {
      const body: unknown = await error.context.json();
      if (isAiSearchResponse(body)) return body;
    } catch {
      // el cuerpo no era JSON válido; cae al mensaje genérico de abajo
    }
    return GENERIC_ERROR;
  }

  if (error instanceof FunctionsFetchError) {
    return NETWORK_ERROR;
  }
  if (error instanceof FunctionsRelayError) {
    return GENERIC_ERROR;
  }

  return GENERIC_ERROR;
}
