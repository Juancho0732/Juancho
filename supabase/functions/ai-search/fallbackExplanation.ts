import { formatCOP } from './format.ts';
import type { PlaceRow, SearchIntent } from './types.ts';

/**
 * Cuando la IA no está disponible (proveedor caído, sin API key en dev, error
 * de red) no se deja al usuario sin explicación: se arma un resumen simple a
 * partir de los mismos datos reales que ya se le muestran.
 */
export function buildFallbackExplanation(intent: SearchIntent, places: PlaceRow[]): string {
  if (places.length === 0) {
    return 'No encontramos lugares que encajen con tu búsqueda todavía. Prueba con otros términos o explora las categorías.';
  }

  const criteria: string[] = [];
  if (intent.location) criteria.push(`en ${intent.location}`);
  if (intent.budgetTotal) criteria.push(`con un presupuesto cercano a ${formatCOP(intent.budgetTotal)}`);
  if (intent.occasion) criteria.push(`para un plan de ${intent.occasion}`);

  const criteriaText = criteria.length > 0 ? ` ${criteria.join(', ')}` : '';
  const topNames = places
    .slice(0, 3)
    .map((place) => place.name)
    .join(', ');

  return (
    `Encontramos ${places.length} ${places.length === 1 ? 'lugar' : 'lugares'}${criteriaText}. ` +
    `Entre los mejor calificados: ${topNames}.`
  );
}
