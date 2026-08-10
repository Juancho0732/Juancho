import type { RawInputs } from './types';

export interface SliderDefinition {
  id: string;
  label: string;
  /** Todos los campos crudos que este slider mueve a la vez con el mismo % (p. ej. marketing + ventas juntos como "gasto de adquisición"). */
  keys: (keyof RawInputs)[];
  unit: 'currency' | 'number';
}

/**
 * Variables del Simulador. "CAC" y "Precio" de la especificación original no
 * se exponen como sliders independientes: CAC es un resultado derivado del
 * gasto de adquisición y los clientes adquiridos (moverlo directamente
 * rompería su propia fórmula), y "Precio"/"Ticket promedio" son el mismo
 * dato. Por eso el Simulador mueve los inputs crudos que sí son
 * independientes entre sí, y CAC/LTV/etc. se recalculan a partir de ellos.
 */
export const SIMULATOR_SLIDERS: SliderDefinition[] = [
  { id: 'acquisitionSpend', label: 'Gasto de adquisición (marketing + ventas)', keys: ['marketingSpend', 'salesSpend'], unit: 'currency' },
  { id: 'newCustomers', label: 'Clientes adquiridos', keys: ['newCustomers'], unit: 'number' },
  { id: 'avgOrderValue', label: 'Ticket promedio', keys: ['avgOrderValue'], unit: 'currency' },
  { id: 'purchaseFrequencyPerYear', label: 'Frecuencia de compra', keys: ['purchaseFrequencyPerYear'], unit: 'number' },
  { id: 'monthlyMarginPerCustomer', label: 'Margen mensual por cliente', keys: ['monthlyMarginPerCustomer'], unit: 'currency' },
  { id: 'customersLost', label: 'Clientes perdidos (churn)', keys: ['customersLost'], unit: 'number' },
  { id: 'adSpend', label: 'Inversión publicitaria', keys: ['adSpend'], unit: 'currency' },
  { id: 'attributedRevenue', label: 'Ingresos atribuidos a publicidad', keys: ['attributedRevenue'], unit: 'currency' },
];

/** Un slider solo tiene sentido mostrarlo si al menos uno de sus campos tiene un valor base en el snapshot. */
export function isSliderApplicable(slider: SliderDefinition, base: RawInputs): boolean {
  return slider.keys.some((key) => typeof base[key] === 'number');
}

/** Construye el objeto de ajustes % a partir del valor de un único slider, aplicado a todos sus campos. */
export function sliderToAdjustments(slider: SliderDefinition, percent: number): Partial<Record<keyof RawInputs, number>> {
  const adjustments: Partial<Record<keyof RawInputs, number>> = {};
  for (const key of slider.keys) adjustments[key] = percent;
  return adjustments;
}
