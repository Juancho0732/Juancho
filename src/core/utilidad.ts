import type { MetricResult, RawInputs } from './types';
import { safeDivide } from './validation/validators';

/**
 * Utilidad total estimada del periodo, generada por los clientes nuevos:
 *   Utilidad = Margen mensual por cliente × Clientes adquiridos
 *
 * Es una cifra derivada explícitamente de dos inputs que el usuario ya
 * introdujo (no un nuevo dato inventado): sirve para ver, en unidades
 * monetarias, el efecto conjunto de mover el margen y el volumen de
 * clientes en el Simulador.
 */
export function calculateUtilidad(raw: Pick<RawInputs, 'monthlyMarginPerCustomer' | 'newCustomers'>): MetricResult {
  const { monthlyMarginPerCustomer, newCustomers } = raw;
  if (monthlyMarginPerCustomer === undefined || newCustomers === undefined) {
    return { value: undefined, unit: 'currency', error: 'Faltan el margen mensual por cliente y/o los clientes adquiridos.' };
  }
  if (monthlyMarginPerCustomer < 0 || newCustomers < 0) {
    return { value: undefined, unit: 'currency', error: 'Los valores no pueden ser negativos.' };
  }
  const value = safeDivide(monthlyMarginPerCustomer * newCustomers, 1);
  return { value, unit: 'currency', breakdown: { monthlyMarginPerCustomer, newCustomers } };
}
