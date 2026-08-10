/**
 * Tipos de dominio compartidos por el motor de cálculo (/core).
 * Esta capa no importa React ni nada de UI: es lógica pura y testeable.
 */

/** Resultado de una validación de negocio sobre un conjunto de inputs. */
export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/** Estado cualitativo de una métrica calculada, usado para semáforos e indicadores visuales. */
export type MetricStatus = 'good' | 'warning' | 'bad' | 'neutral';

/** Resultado estándar que devuelve cada fórmula del motor. */
export interface MetricResult<TBreakdown = Record<string, number>> {
  /** Valor numérico final de la métrica. undefined si no se pudo calcular (ver `error`). */
  value: number | undefined;
  /** Unidad de presentación: moneda, ratio ('x'), porcentaje, meses, etc. */
  unit: 'currency' | 'ratio' | 'percent' | 'months' | 'count';
  /** Motivo por el que no se pudo calcular (p. ej. división por cero). */
  error?: string;
  /** Valores intermedios del cálculo, para mostrar el "paso a paso". */
  breakdown?: TBreakdown;
}

/** Método de cálculo de CLV/LTV soportado. Debe fijarse a nivel de proyecto/snapshot
 * para que Payback, Diagnóstico, Health Score y Simulador usen siempre el mismo. */
export type LtvMethod = 'revenue_based' | 'margin_churn_based';

/**
 * Inputs crudos que el usuario introduce para un periodo (Snapshot).
 * Todos opcionales porque el usuario puede rellenar solo lo que necesita
 * para las métricas que le interesan en ese momento.
 */
export interface RawInputs {
  // Adquisición / CAC
  marketingSpend?: number;
  salesSpend?: number;
  newCustomers?: number;

  // CLV / LTV
  ltvMethod?: LtvMethod;
  avgOrderValue?: number;
  purchaseFrequencyPerYear?: number;
  customerLifespanYears?: number;
  marginPerPurchase?: number;

  // Ingresos / márgenes
  revenue?: number;
  cogs?: number;
  operatingExpenses?: number;
  ordersCount?: number;

  // Clientes / retención
  customersStart?: number;
  customersLost?: number;
  activeUsers?: number;

  // Publicidad
  adSpend?: number;
  attributedRevenue?: number;
  clicks?: number;
  impressions?: number;
  visitors?: number;

  // Conversión / campañas
  conversions?: number;
  conversionType?: 'purchase' | 'signup' | 'lead' | 'download' | 'other';
  campaignCost?: number;

  // ROI genérico
  investment?: number;
  gain?: number;

  // Margen por cliente (usado en Payback)
  monthlyMarginPerCustomer?: number;
}
