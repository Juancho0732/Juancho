import { createClient } from '@supabase/supabase-js';

import { AIProviderError, AnthropicProvider, type AIProvider } from './aiProvider.ts';
import { buildFallbackExplanation } from './fallbackExplanation.ts';
import { heuristicParseIntent } from './heuristicParser.ts';
import { isIntentEmpty, sanitizeIntent } from './intentSchema.ts';
import { rankPlaces } from './ranking.ts';
import type { AiSearchResponse, CategoryRow, PlaceRow } from './types.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_QUERY_LENGTH = 300;
const CANDIDATE_POOL_SIZE = 100;
const RESULTS_LIMIT = 6;

function jsonResponse(body: AiSearchResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function getAIProvider(): AIProvider | null {
  const provider = Deno.env.get('AI_PROVIDER') ?? 'anthropic';
  const apiKey = Deno.env.get('AI_API_KEY');
  const model = Deno.env.get('AI_MODEL');

  if (!apiKey || !model) return null;

  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider({ apiKey, model });
    default:
      // Punto de extensión (Regla 8): un proveedor nuevo solo implementa AIProvider.
      console.error(`AI_PROVIDER "${provider}" no está implementado.`);
      return null;
  }
}

function findMatchingCategoryId(hint: string | null, categories: CategoryRow[]): string | null {
  if (!hint) return null;
  const normalized = hint.trim().toLowerCase();
  if (!normalized) return null;
  const match = categories.find(
    (category) =>
      category.name.toLowerCase().includes(normalized) ||
      normalized.includes(category.name.toLowerCase()) ||
      category.slug.includes(normalized.replace(/\s+/g, '-')),
  );
  return match?.id ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ status: 'error', message: 'Método no soportado.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const rateLimitPerMinute = Number(Deno.env.get('AI_RATE_LIMIT_PER_MINUTE') ?? '5');

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ status: 'error', message: 'No autenticado.' }, 401);
    }

    // Cliente "del usuario": solo para confirmar quién llama (RLS de por medio).
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ status: 'error', message: 'No autenticado.' }, 401);
    }
    const userId = userData.user.id;

    // Cliente admin: lee/escribe ai_search_logs (bloqueada para anon/authenticated,
    // ver supabase/migrations/20260811120007_ai_search_logs.sql) y consulta places.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    let body: { query?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ status: 'error', message: 'Cuerpo de la solicitud inválido.' }, 400);
    }
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    if (!query) {
      return jsonResponse({ status: 'error', message: 'Escribe qué estás buscando.' }, 400);
    }
    if (query.length > MAX_QUERY_LENGTH) {
      return jsonResponse(
        { status: 'error', message: `La búsqueda es muy larga (máximo ${MAX_QUERY_LENGTH} caracteres).` },
        400,
      );
    }

    // --- Control de costo: límite de búsquedas por minuto por usuario. ---
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count: recentSearches, error: rateLimitError } = await adminClient
      .from('ai_search_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneMinuteAgo);
    if (rateLimitError) throw rateLimitError;
    if ((recentSearches ?? 0) >= rateLimitPerMinute) {
      return jsonResponse(
        { status: 'error', message: 'Estás buscando muy rápido. Espera un momento e intenta de nuevo.' },
        429,
      );
    }

    // --- Interpretación: IA primero, heurística si falla (nunca se deja al usuario sin nada). ---
    const provider = getAIProvider();
    let usedFallbackParser = false;
    let rawIntent: unknown;
    if (provider) {
      try {
        rawIntent = await provider.interpretIntent(query);
      } catch (error) {
        console.error('interpretIntent falló, usando heurística:', error);
        usedFallbackParser = true;
      }
    } else {
      usedFallbackParser = true;
    }

    const intent = usedFallbackParser ? heuristicParseIntent(query) : sanitizeIntent(rawIntent);

    if (isIntentEmpty(intent)) {
      const { error: logError } = await adminClient.from('ai_search_logs').insert({
        user_id: userId,
        raw_query: query,
        parsed_intent: intent,
        result_count: 0,
      });
      if (logError) console.error('No se pudo registrar ai_search_logs:', logError);
      return jsonResponse(
        {
          status: 'needs_clarification',
          message:
            'No logramos entender bien qué buscas. ¿Nos cuentas presupuesto, zona de Bogotá u ocasión (amigos, pareja, familia)?',
        },
        200,
      );
    }

    // --- Consulta real (la IA nunca inventa lugares, Regla 10) ---
    const { data: categories, error: categoriesError } = await adminClient
      .from('categories')
      .select('id, name, slug');
    if (categoriesError) throw categoriesError;

    let placesQuery = adminClient
      .from('places')
      .select(
        'id, name, description, category_id, tags, address, locality, lat, lng, price_min, price_max, schedule, rating_avg, review_count, status, is_mock, created_at',
      )
      .eq('status', 'active')
      .order('rating_avg', { ascending: false })
      .limit(CANDIDATE_POOL_SIZE);

    const matchedCategoryId = findMatchingCategoryId(intent.categoryHint, categories as CategoryRow[]);
    if (matchedCategoryId) {
      placesQuery = placesQuery.eq('category_id', matchedCategoryId);
    }

    const { data: candidates, error: placesError } = await placesQuery;
    if (placesError) throw placesError;

    // --- Ranking (determinístico, sin IA) ---
    const results = rankPlaces(
      intent,
      candidates as PlaceRow[],
      categories as CategoryRow[],
      RESULTS_LIMIT,
    );

    // --- Explicación: IA primero, resumen simple si falla ---
    let explanation: string;
    if (provider && !usedFallbackParser) {
      try {
        explanation = await provider.generateExplanation(query, intent, results);
      } catch (error) {
        console.error('generateExplanation falló, usando resumen simple:', error);
        explanation = buildFallbackExplanation(intent, results);
      }
    } else {
      explanation = buildFallbackExplanation(intent, results);
    }

    const { error: logError } = await adminClient.from('ai_search_logs').insert({
      user_id: userId,
      raw_query: query,
      parsed_intent: intent,
      result_count: results.length,
    });
    if (logError) console.error('No se pudo registrar ai_search_logs:', logError);

    return jsonResponse({ status: 'ok', intent, explanation, results }, 200);
  } catch (error) {
    console.error('ai-search error inesperado:', error);
    const message =
      error instanceof AIProviderError ? error.message : 'Algo salió mal buscando tus planes. Intenta de nuevo.';
    return jsonResponse({ status: 'error', message }, 500);
  }
});
