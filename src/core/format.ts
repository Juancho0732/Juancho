import type { MetricResult } from './types';

/** Formatea el valor de un MetricResult según su unidad, para mostrarlo en la UI. */
export function formatMetricValue(result: Pick<MetricResult, 'value' | 'unit'>, currency = 'USD'): string {
  if (result.value === undefined) return '—';
  switch (result.unit) {
    case 'currency':
      return new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 0 }).format(result.value);
    case 'percent':
      return `${result.value.toFixed(1)}%`;
    case 'ratio':
      return `${result.value.toFixed(1)}x`;
    case 'months':
      return `${result.value.toFixed(1)} meses`;
    case 'count':
      return new Intl.NumberFormat('es').format(result.value);
    default:
      return String(result.value);
  }
}

/** Etiquetas en español para las claves más comunes que aparecen en los `breakdown`
 * de las fórmulas, usadas en el "paso a paso" de cada calculadora. */
const BREAKDOWN_KEY_LABELS: Record<string, string> = {
  totalAcquisitionCost: 'Costo total de adquisición',
  newCustomers: 'Nuevos clientes',
  marketingSpend: 'Gasto de marketing',
  salesSpend: 'Gasto de ventas',
  avgOrderValue: 'Ticket promedio',
  purchaseFrequencyPerYear: 'Frecuencia de compra (al año)',
  customerLifespanYears: 'Vida del cliente (años)',
  arpu: 'ARPU',
  grossMarginPercent: 'Margen bruto %',
  churnRatePercent: 'Tasa de churn %',
  ltv: 'LTV',
  cac: 'CAC',
  monthlyMarginPerCustomer: 'Margen mensual por cliente',
  adSpend: 'Gasto publicitario',
  attributedRevenue: 'Ingresos atribuidos',
  investment: 'Inversión',
  gain: 'Ganancia obtenida',
  netProfit: 'Ganancia neta',
  netProfitAmount: 'Utilidad neta',
  revenue: 'Ingresos',
  ordersCount: 'Número de pedidos',
  cogs: 'Costo de bienes vendidos',
  grossMarginAmount: 'Margen bruto',
  customersStart: 'Clientes al inicio',
  customersLost: 'Clientes perdidos',
  activeUsers: 'Usuarios activos',
  campaignCost: 'Costo de campaña',
  conversions: 'Conversiones',
  clicks: 'Clics',
  impressions: 'Impresiones',
  visitors: 'Visitantes',
  totalCustomers: 'Clientes totales',
};

/** Convierte una clave de breakdown en una etiqueta legible en español, con
 * fallback a una versión "Title Case" separada por espacios si no está mapeada. */
export function humanizeBreakdownKey(key: string): string {
  if (BREAKDOWN_KEY_LABELS[key]) return BREAKDOWN_KEY_LABELS[key];
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}
