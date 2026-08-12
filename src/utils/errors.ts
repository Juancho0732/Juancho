/**
 * Auditoría de beta-readiness, Prioridad 4: ningún catch debe mostrarle al
 * usuario el mensaje crudo de un error (de Supabase, de un módulo nativo, de
 * la red, etc.) — puede traer detalles internos (nombres de tabla/columna,
 * constraints, texto de un proveedor externo) o venir en inglés en una app
 * en español. El detalle real solo va a la consola (equivalente local de
 * "logs de servidor" para una app cliente); el usuario siempre recibe el
 * mensaje genérico que cada pantalla ya define para ese caso.
 */
export function logAndGetSafeMessage(context: string, error: unknown, fallback: string): string {
  console.error(`${context}:`, error);
  return fallback;
}
