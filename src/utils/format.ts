/**
 * Formato manual (sin depender de Intl/ICU del motor JS) para que el
 * agrupado de miles sea consistente entre Hermes/web sin sorpresas.
 */
export function formatCOP(amount: number): string {
  const rounded = Math.round(amount);
  const withThousands = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${withThousands}`;
}

export function formatPriceRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Precio no disponible';
  if (min !== null && max !== null && min !== max) {
    return `${formatCOP(min)} - ${formatCOP(max)}`;
  }
  return formatCOP(min ?? max ?? 0);
}
