/**
 * Control de costo de IA (auditoría de beta-readiness, Prioridad 9).
 *
 * Antes de esta prioridad solo existía un límite por usuario por minuto
 * (AI_RATE_LIMIT_PER_MINUTE) -- protege contra un abuso rápido y evidente
 * desde una sola cuenta, pero deja dos huecos reales:
 *
 *   1. Ese mismo usuario podía sostener el límite por minuto 24/7 (con
 *      AI_RATE_LIMIT_PER_MINUTE=5, hasta 7200 búsquedas por IA en un día
 *      desde una sola cuenta) -- de ahí el límite diario por usuario.
 *   2. Con muchos usuarios legítimos a la vez, el costo agregado no tiene
 *      techo: 1000 usuarios buscando 4 veces por minuto cada uno ya son
 *      4000 llamadas a la IA por minuto -- de ahí el límite global.
 *
 * Esta función es pura (nada de red/DB) a propósito: la orquestación real
 * (contar filas en ai_search_logs) vive en index.ts, que no se puede probar
 * con Jest sin Deno -- separar la *decisión* de la consulta es lo que la
 * hace testeable sin mockear Supabase.
 */

export type RateLimitCounts = {
  userSearchesLastMinute: number;
  userSearchesLastDay: number;
  globalSearchesLastMinute: number;
};

export type RateLimitConfig = {
  perUserPerMinute: number;
  perUserPerDay: number;
  globalPerMinute: number;
};

export type RateLimitResult = { allowed: true } | { allowed: false; message: string };

export function checkRateLimit(counts: RateLimitCounts, config: RateLimitConfig): RateLimitResult {
  if (counts.userSearchesLastMinute >= config.perUserPerMinute) {
    return {
      allowed: false,
      message: 'Estás buscando muy rápido. Espera un momento e intenta de nuevo.',
    };
  }
  if (counts.userSearchesLastDay >= config.perUserPerDay) {
    return {
      allowed: false,
      message:
        'Llegaste al límite de búsquedas con IA por hoy. Puedes seguir usando la búsqueda normal mientras tanto.',
    };
  }
  if (counts.globalSearchesLastMinute >= config.globalPerMinute) {
    return {
      allowed: false,
      message: 'Hay mucha demanda en la búsqueda con IA ahora mismo. Intenta en un momento.',
    };
  }
  return { allowed: true };
}
