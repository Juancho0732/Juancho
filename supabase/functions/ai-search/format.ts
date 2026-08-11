/** Copia de src/utils/format.ts#formatCOP — mantener en sync si cambia. */
export function formatCOP(amount: number): string {
  const rounded = Math.round(amount);
  const withThousands = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${withThousands}`;
}
