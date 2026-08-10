/**
 * Registro de métricas: metadata declarativa que describe cada métrica
 * (inputs que necesita, cómo calcularla a partir de los inputs crudos de un
 * snapshot, y cómo interpretarla). Este registro es lo que alimenta tanto el
 * Dashboard como una única CalculatorView genérica, en vez de tener una
 * pantalla escrita a mano por cada una de las ~18 métricas.
 *
 * No depende de React: es pura metadata + funciones puras.
 */
import type { MetricResult, MetricStatus, RawInputs } from './types';
import {
  calculateAov,
  calculateArpu,
  calculateChurn,
  calculateClv,
  calculateConversionRate,
  calculateCpa,
  calculateCpc,
  calculateCpm,
  calculateCtr,
  calculateGrossMargin,
  calculateLtvCac,
  calculateNetMargin,
  calculatePayback,
  calculateCac,
  calculateRetention,
  calculateRevenuePerCustomer,
  calculateRoas,
  calculateRoi,
  interpretAov,
  interpretArpu,
  interpretChurn,
  interpretClv,
  interpretConversionRate,
  interpretCpa,
  interpretCpc,
  interpretCpm,
  interpretCtr,
  interpretGrossMargin,
  interpretLtvCac,
  interpretNetMargin,
  interpretPayback,
  interpretCac,
  interpretRetention,
  interpretRevenuePerCustomer,
  interpretRoas,
  interpretRoi,
} from './formulas';

export type MetricCategory = 'acquisition' | 'value' | 'profitability' | 'retention' | 'advertising' | 'conversion';

export interface FieldSpec {
  key: string;
  label: string;
  type: 'currency' | 'number' | 'percent' | 'select';
  options?: { value: string; label: string }[];
  helpText?: string;
  /** Si se define, el campo solo se muestra cuando esta condición sobre los inputs actuales es verdadera. */
  showIf?: (raw: RawInputs) => boolean;
}

export interface MetricDefinition {
  id: string;
  name: string;
  shortName: string;
  category: MetricCategory;
  unit: MetricResult['unit'];
  fields: FieldSpec[];
  /** Calcula la métrica a partir de los inputs crudos guardados en un snapshot,
   * y de resultados de otras métricas ya calculadas cuando hace falta encadenar
   * (p. ej. LTV:CAC necesita LTV y CAC ya calculados). */
  compute: (raw: RawInputs, derived?: Record<string, number | undefined>) => MetricResult<any>;
  interpret: (result: MetricResult<any>) => string | undefined;
  /** Estado cualitativo, cuando la métrica lo permite sin inventar reglas universales. */
  status?: (result: MetricResult<any>) => MetricStatus;
}

const goodBadFromRatio = (value: number | undefined, warnBelow: number, badBelow: number): MetricStatus => {
  if (value === undefined) return 'neutral';
  if (value < badBelow) return 'bad';
  if (value < warnBelow) return 'warning';
  return 'good';
};

export const METRIC_REGISTRY: MetricDefinition[] = [
  {
    id: 'cac',
    name: 'Costo de Adquisición de Cliente',
    shortName: 'CAC',
    category: 'acquisition',
    unit: 'currency',
    fields: [
      { key: 'marketingSpend', label: 'Gasto total de marketing', type: 'currency' },
      { key: 'salesSpend', label: 'Gasto en ventas', type: 'currency' },
      { key: 'newCustomers', label: 'Nuevos clientes adquiridos', type: 'number' },
    ],
    compute: (raw) => calculateCac(raw),
    interpret: interpretCac,
  },
  {
    id: 'clv',
    name: 'Valor del Cliente (CLV / LTV)',
    shortName: 'CLV',
    category: 'value',
    unit: 'currency',
    fields: [
      {
        key: 'ltvMethod',
        label: 'Método de cálculo',
        type: 'select',
        options: [
          { value: 'revenue_based', label: 'Ingresos (ticket × frecuencia × vida)' },
          { value: 'margin_churn_based', label: 'Margen y churn (ARPU × margen% / churn)' },
        ],
      },
      {
        key: 'avgOrderValue',
        label: 'Ticket promedio',
        type: 'currency',
        showIf: (raw) => raw.ltvMethod !== 'margin_churn_based',
      },
      {
        key: 'purchaseFrequencyPerYear',
        label: 'Frecuencia de compra (veces/año)',
        type: 'number',
        showIf: (raw) => raw.ltvMethod !== 'margin_churn_based',
      },
      {
        key: 'customerLifespanYears',
        label: 'Vida promedio del cliente (años)',
        type: 'number',
        showIf: (raw) => raw.ltvMethod !== 'margin_churn_based',
      },
      {
        key: 'revenue',
        label: 'Ingresos del periodo',
        type: 'currency',
        showIf: (raw) => raw.ltvMethod === 'margin_churn_based',
        helpText: 'Se reutiliza para calcular ARPU y el margen bruto.',
      },
      {
        key: 'activeUsers',
        label: 'Usuarios activos',
        type: 'number',
        showIf: (raw) => raw.ltvMethod === 'margin_churn_based',
      },
      {
        key: 'cogs',
        label: 'Costo de bienes vendidos',
        type: 'currency',
        showIf: (raw) => raw.ltvMethod === 'margin_churn_based',
        helpText: 'Se usa para calcular el margen bruto %, como en la calculadora de Margen bruto.',
      },
      {
        key: 'customersStart',
        label: 'Clientes al inicio del periodo',
        type: 'number',
        showIf: (raw) => raw.ltvMethod === 'margin_churn_based',
        helpText: 'Se usa para calcular la tasa de churn, como en la calculadora de Churn.',
      },
      {
        key: 'customersLost',
        label: 'Clientes perdidos',
        type: 'number',
        showIf: (raw) => raw.ltvMethod === 'margin_churn_based',
      },
    ],
    compute: (raw) => {
      if (raw.ltvMethod === 'margin_churn_based') {
        const arpu = raw.revenue !== undefined && raw.activeUsers ? raw.revenue / raw.activeUsers : undefined;
        const grossMarginPercent = calculateGrossMargin({ revenue: raw.revenue, cogs: raw.cogs }).value;
        const churnRatePercent = calculateChurn({ customersStart: raw.customersStart, customersLost: raw.customersLost }).value;
        return calculateClv({ method: 'margin_churn_based', arpu, grossMarginPercent, churnRatePercent });
      }
      return calculateClv({
        method: 'revenue_based',
        avgOrderValue: raw.avgOrderValue,
        purchaseFrequencyPerYear: raw.purchaseFrequencyPerYear,
        customerLifespanYears: raw.customerLifespanYears,
      });
    },
    interpret: interpretClv,
  },
  {
    id: 'ltvCac',
    name: 'Ratio LTV:CAC',
    shortName: 'LTV:CAC',
    category: 'value',
    unit: 'ratio',
    fields: [],
    compute: (_raw, derived) => calculateLtvCac({ ltv: derived?.clv, cac: derived?.cac }),
    interpret: interpretLtvCac,
    status: (result) => goodBadFromRatio(result.value, 3, 1),
  },
  {
    id: 'payback',
    name: 'Periodo de Recuperación (Payback)',
    shortName: 'Payback',
    category: 'profitability',
    unit: 'months',
    fields: [{ key: 'monthlyMarginPerCustomer', label: 'Margen mensual por cliente', type: 'currency' }],
    compute: (raw, derived) => calculatePayback({ cac: derived?.cac, monthlyMarginPerCustomer: raw.monthlyMarginPerCustomer }),
    interpret: interpretPayback,
    status: (result) => (result.value === undefined ? 'neutral' : result.value <= 6 ? 'good' : result.value <= 12 ? 'warning' : 'bad'),
  },
  {
    id: 'roas',
    name: 'Retorno de la Inversión Publicitaria',
    shortName: 'ROAS',
    category: 'advertising',
    unit: 'ratio',
    fields: [
      { key: 'adSpend', label: 'Inversión publicitaria', type: 'currency' },
      { key: 'attributedRevenue', label: 'Ingresos atribuibles a publicidad', type: 'currency' },
    ],
    compute: (raw) => calculateRoas(raw),
    interpret: interpretRoas,
    status: (result) => goodBadFromRatio(result.value, 2, 1),
  },
  {
    id: 'roi',
    name: 'Retorno de la Inversión',
    shortName: 'ROI',
    category: 'profitability',
    unit: 'percent',
    fields: [
      { key: 'investment', label: 'Inversión', type: 'currency' },
      { key: 'gain', label: 'Ganancia obtenida', type: 'currency' },
    ],
    compute: (raw) => calculateRoi(raw),
    interpret: interpretRoi,
    status: (result) => (result.value === undefined ? 'neutral' : result.value >= 20 ? 'good' : result.value >= 0 ? 'warning' : 'bad'),
  },
  {
    id: 'aov',
    name: 'Ticket Promedio',
    shortName: 'AOV',
    category: 'value',
    unit: 'currency',
    fields: [
      { key: 'revenue', label: 'Ingresos', type: 'currency' },
      { key: 'ordersCount', label: 'Número de pedidos', type: 'number' },
    ],
    compute: (raw) => calculateAov(raw),
    interpret: interpretAov,
  },
  {
    id: 'grossMargin',
    name: 'Margen Bruto',
    shortName: 'Margen bruto',
    category: 'profitability',
    unit: 'percent',
    fields: [
      { key: 'revenue', label: 'Ingresos', type: 'currency' },
      { key: 'cogs', label: 'Costo de bienes vendidos', type: 'currency' },
    ],
    compute: (raw) => calculateGrossMargin(raw),
    interpret: interpretGrossMargin,
    status: (result) => (result.value === undefined ? 'neutral' : result.value >= 50 ? 'good' : result.value >= 25 ? 'warning' : 'bad'),
  },
  {
    id: 'netMargin',
    name: 'Margen Neto',
    shortName: 'Margen neto',
    category: 'profitability',
    unit: 'percent',
    fields: [
      { key: 'revenue', label: 'Ingresos', type: 'currency' },
      { key: 'cogs', label: 'Costo de bienes vendidos', type: 'currency' },
      { key: 'operatingExpenses', label: 'Gastos operativos', type: 'currency' },
    ],
    compute: (raw) => calculateNetMargin(raw),
    interpret: interpretNetMargin,
    status: (result) => (result.value === undefined ? 'neutral' : result.value >= 15 ? 'good' : result.value >= 0 ? 'warning' : 'bad'),
  },
  {
    id: 'churn',
    name: 'Tasa de Cancelación',
    shortName: 'Churn',
    category: 'retention',
    unit: 'percent',
    fields: [
      { key: 'customersStart', label: 'Clientes al inicio del periodo', type: 'number' },
      { key: 'customersLost', label: 'Clientes perdidos', type: 'number' },
    ],
    compute: (raw) => calculateChurn(raw),
    interpret: interpretChurn,
    status: (result) => (result.value === undefined ? 'neutral' : result.value <= 5 ? 'good' : result.value <= 10 ? 'warning' : 'bad'),
  },
  {
    id: 'retention',
    name: 'Tasa de Retención',
    shortName: 'Retención',
    category: 'retention',
    unit: 'percent',
    fields: [
      { key: 'customersStart', label: 'Clientes al inicio del periodo', type: 'number' },
      { key: 'customersLost', label: 'Clientes perdidos', type: 'number' },
    ],
    compute: (raw) => calculateRetention(raw),
    interpret: interpretRetention,
    status: (result) => (result.value === undefined ? 'neutral' : result.value >= 95 ? 'good' : result.value >= 90 ? 'warning' : 'bad'),
  },
  {
    id: 'arpu',
    name: 'Ingreso Promedio por Usuario',
    shortName: 'ARPU',
    category: 'value',
    unit: 'currency',
    fields: [
      { key: 'revenue', label: 'Ingresos del periodo', type: 'currency' },
      { key: 'activeUsers', label: 'Usuarios activos', type: 'number' },
    ],
    compute: (raw) => calculateArpu(raw),
    interpret: interpretArpu,
  },
  {
    id: 'cpa',
    name: 'Costo por Conversión (CPA / Costo por lead)',
    shortName: 'CPA',
    category: 'advertising',
    unit: 'currency',
    fields: [
      {
        key: 'conversionType',
        label: 'Tipo de conversión',
        type: 'select',
        options: [
          { value: 'purchase', label: 'Compra' },
          { value: 'signup', label: 'Registro' },
          { value: 'lead', label: 'Lead' },
          { value: 'download', label: 'Descarga' },
          { value: 'other', label: 'Otra' },
        ],
      },
      { key: 'campaignCost', label: 'Costo de campaña', type: 'currency' },
      { key: 'conversions', label: 'Conversiones', type: 'number' },
    ],
    compute: (raw) => calculateCpa({ campaignCost: raw.campaignCost, conversions: raw.conversions, conversionType: raw.conversionType }),
    interpret: interpretCpa,
  },
  {
    id: 'cpc',
    name: 'Costo por Clic',
    shortName: 'CPC',
    category: 'advertising',
    unit: 'currency',
    fields: [
      { key: 'adSpend', label: 'Gasto publicitario', type: 'currency' },
      { key: 'clicks', label: 'Clics', type: 'number' },
    ],
    compute: (raw) => calculateCpc(raw),
    interpret: interpretCpc,
  },
  {
    id: 'cpm',
    name: 'Costo por Mil Impresiones',
    shortName: 'CPM',
    category: 'advertising',
    unit: 'currency',
    fields: [
      { key: 'adSpend', label: 'Gasto publicitario', type: 'currency' },
      { key: 'impressions', label: 'Impresiones', type: 'number' },
    ],
    compute: (raw) => calculateCpm(raw),
    interpret: interpretCpm,
  },
  {
    id: 'ctr',
    name: 'Tasa de Clics',
    shortName: 'CTR',
    category: 'advertising',
    unit: 'percent',
    fields: [
      { key: 'clicks', label: 'Clics', type: 'number' },
      { key: 'impressions', label: 'Impresiones', type: 'number' },
    ],
    compute: (raw) => calculateCtr(raw),
    interpret: interpretCtr,
  },
  {
    id: 'conversionRate',
    name: 'Tasa de Conversión',
    shortName: 'Conversion Rate',
    category: 'conversion',
    unit: 'percent',
    fields: [
      { key: 'conversions', label: 'Conversiones', type: 'number' },
      { key: 'visitors', label: 'Visitantes', type: 'number' },
    ],
    compute: (raw) => calculateConversionRate(raw),
    interpret: interpretConversionRate,
  },
  {
    id: 'revenuePerCustomer',
    name: 'Ingreso por Cliente (acumulado)',
    shortName: 'Revenue/Customer',
    category: 'value',
    unit: 'currency',
    fields: [
      { key: 'revenue', label: 'Ingresos totales', type: 'currency' },
      { key: 'totalCustomers', label: 'Número total de clientes', type: 'number' },
    ],
    compute: (raw) => calculateRevenuePerCustomer({ revenue: raw.revenue, totalCustomers: raw.newCustomers }),
    interpret: interpretRevenuePerCustomer,
  },
];

export function getMetricDefinition(id: string): MetricDefinition | undefined {
  return METRIC_REGISTRY.find((m) => m.id === id);
}
