/**
 * Motor de diagnóstico: un conjunto de reglas puras que evalúan las métricas
 * ya calculadas de un snapshot y devuelven hallazgos usando los números
 * reales del usuario. Ninguna regla inventa un dato que el usuario no
 * introdujo: si faltan los inputs que una regla necesita, esa regla
 * simplemente no se evalúa (no se rellena con supuestos).
 *
 * Los umbrales usados (p. ej. "más de 12 meses de payback es largo") son
 * puntos de referencia de uso común en la industria, no reglas absolutas.
 * Se explicitan en cada mensaje como orientativos.
 */
import { getMetricDefinition } from '../metricRegistry';
import { computeDashboardMetrics } from '../computeDashboardMetrics';
import type { LtvMethod, RawInputs } from '../types';
import { formatMetricValue } from '../format';

export type DiagnosticSeverity = 'critical' | 'warning' | 'info';

export interface DiagnosticFinding {
  id: string;
  severity: DiagnosticSeverity;
  title: string;
  message: string;
}

interface RuleContext {
  raw: RawInputs;
  currency: string;
  cac: number | undefined;
  clv: number | undefined;
  ltvCac: number | undefined;
  payback: number | undefined;
  roas: number | undefined;
  grossMargin: number | undefined;
  netMargin: number | undefined;
  churn: number | undefined;
  retention: number | undefined;
}

function money(value: number, currency: string): string {
  return formatMetricValue({ value, unit: 'currency' }, currency);
}

const rules: ((ctx: RuleContext) => DiagnosticFinding | undefined)[] = [
  // R1 — LTV:CAC bajo
  (ctx) => {
    if (ctx.ltvCac === undefined || ctx.cac === undefined || ctx.clv === undefined) return undefined;
    if (ctx.ltvCac < 1) {
      return {
        id: 'ltv-cac-bajo-critico',
        severity: 'critical',
        title: 'El CAC supera al valor del cliente',
        message: `Tu LTV:CAC es de ${ctx.ltvCac.toFixed(1)}x: gastas ${money(ctx.cac, ctx.currency)} en adquirir un cliente que a lo largo del tiempo genera ${money(ctx.clv, ctx.currency)}. Estás perdiendo dinero en cada cliente adquirido, antes de contar ningún otro gasto.`,
      };
    }
    if (ctx.ltvCac < 3) {
      return {
        id: 'ltv-cac-ajustado',
        severity: 'warning',
        title: 'El margen entre CAC y LTV es ajustado',
        message: `Tu LTV:CAC es de ${ctx.ltvCac.toFixed(1)}x (CAC ${money(ctx.cac, ctx.currency)}, LTV ${money(ctx.clv, ctx.currency)}). Como referencia orientativa —no una regla absoluta— muchos negocios apuntan a 3x o más para tener margen de maniobra frente a imprevistos.`,
      };
    }
    return undefined;
  },

  // R2 — Payback demasiado largo
  (ctx) => {
    if (ctx.payback === undefined || ctx.cac === undefined || ctx.raw.monthlyMarginPerCustomer === undefined) return undefined;
    if (ctx.payback > 24) {
      return {
        id: 'payback-muy-largo',
        severity: 'critical',
        title: 'El periodo de recuperación es muy largo',
        message: `Con un CAC de ${money(ctx.cac, ctx.currency)} y un margen mensual por cliente de ${money(ctx.raw.monthlyMarginPerCustomer, ctx.currency)}, necesitas ${ctx.payback.toFixed(1)} meses (más de 2 años) para recuperar lo invertido en cada cliente. Cualquier cliente que se vaya antes de ese punto deja el costo de adquisición sin recuperar.`,
      };
    }
    if (ctx.payback > 12) {
      return {
        id: 'payback-largo',
        severity: 'warning',
        title: 'El periodo de recuperación es relativamente largo',
        message: `Con un CAC de ${money(ctx.cac, ctx.currency)} y un margen mensual por cliente de ${money(ctx.raw.monthlyMarginPerCustomer, ctx.currency)}, tardas ${ctx.payback.toFixed(1)} meses en recuperar el costo de adquisición. Una reducción del CAC o un aumento del margen o la retención podrían acortar este periodo.`,
      };
    }
    return undefined;
  },

  // R3 — Margen bruto bajo
  (ctx) => {
    if (ctx.grossMargin === undefined) return undefined;
    if (ctx.grossMargin < 10) {
      return {
        id: 'margen-bruto-critico',
        severity: 'critical',
        title: 'El margen bruto es muy ajustado',
        message: `Tu margen bruto es del ${ctx.grossMargin.toFixed(1)}%: por cada 100 que ingresas, apenas te quedan ${ctx.grossMargin.toFixed(0)} después de cubrir el costo de lo vendido. Con tan poco margen, cualquier otro gasto (adquisición, operación) puede volver el negocio no rentable.`,
      };
    }
    if (ctx.grossMargin < 30) {
      return {
        id: 'margen-bruto-bajo',
        severity: 'warning',
        title: 'El margen bruto es bajo',
        message: `Tu margen bruto es del ${ctx.grossMargin.toFixed(1)}%. Es un margen ajustado para sostener gastos de adquisición, operación y crecimiento al mismo tiempo.`,
      };
    }
    return undefined;
  },

  // R4 — Margen neto bajo o negativo
  (ctx) => {
    if (ctx.netMargin === undefined) return undefined;
    if (ctx.netMargin < 0) {
      return {
        id: 'margen-neto-negativo',
        severity: 'critical',
        title: 'El negocio opera con pérdidas en este periodo',
        message: `Tu margen neto es del ${ctx.netMargin.toFixed(1)}%: los costos y gastos operativos superan a los ingresos en este periodo.`,
      };
    }
    if (ctx.netMargin < 10) {
      return {
        id: 'margen-neto-bajo',
        severity: 'warning',
        title: 'El margen neto es bajo',
        message: `Tu margen neto es del ${ctx.netMargin.toFixed(1)}%. Queda poco colchón después de todos los costos y gastos operativos.`,
      };
    }
    return undefined;
  },

  // R5 — Churn elevado, conectado con el costo de adquisición
  (ctx) => {
    if (ctx.churn === undefined) return undefined;
    if (ctx.churn > 20) {
      return {
        id: 'churn-critico',
        severity: 'critical',
        title: 'La cancelación de clientes es muy alta',
        message: `Perdiste al ${ctx.churn.toFixed(1)}% de tus clientes en este periodo${
          ctx.cac !== undefined ? `, cada uno de los cuales costó en promedio ${money(ctx.cac, ctx.currency)} adquirir` : ''
        }. A este ritmo, gran parte de la inversión en adquisición se pierde antes de generar valor sostenido.`,
      };
    }
    if (ctx.churn > 10) {
      return {
        id: 'churn-elevado',
        severity: 'warning',
        title: 'La cancelación de clientes es elevada',
        message: `Perdiste al ${ctx.churn.toFixed(1)}% de tus clientes en este periodo. Mejorar la retención suele tener más impacto en la rentabilidad que seguir bajando el CAC.`,
      };
    }
    return undefined;
  },

  // R6 — ROAS aparentemente bueno pero margen insuficiente
  (ctx) => {
    if (ctx.roas === undefined || ctx.netMargin === undefined) return undefined;
    if (ctx.roas >= 2 && ctx.netMargin < 10) {
      return {
        id: 'roas-bueno-margen-bajo',
        severity: 'warning',
        title: 'Buen ROAS, pero el margen no lo respalda',
        message: `Tu ROAS es de ${ctx.roas.toFixed(1)}x (por cada 1 invertido en publicidad, ${ctx.roas.toFixed(1)} en ingresos atribuidos), pero tu margen neto es de solo el ${ctx.netMargin.toFixed(1)}%. Un ROAS alto no garantiza rentabilidad si el margen sobre esos ingresos es insuficiente.`,
      };
    }
    return undefined;
  },

  // R7 — Dependencia excesiva de publicidad dentro del gasto de adquisición
  (ctx) => {
    const { adSpend, marketingSpend } = ctx.raw;
    if (adSpend === undefined || marketingSpend === undefined || marketingSpend <= 0) return undefined;
    const share = (adSpend / marketingSpend) * 100;
    if (share > 80) {
      return {
        id: 'dependencia-publicidad',
        severity: 'info',
        title: 'Alta dependencia de la publicidad paga',
        message: `El ${share.toFixed(0)}% de tu gasto de marketing es publicidad paga (${money(adSpend, ctx.currency)} de ${money(marketingSpend, ctx.currency)}). Si el costo o rendimiento de esa publicidad cambia, el impacto sobre tu adquisición sería alto por depender casi por completo de un solo canal.`,
      };
    }
    return undefined;
  },
];

const SEVERITY_ORDER: Record<DiagnosticSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function runDiagnostics(raw: RawInputs, ltvMethod: LtvMethod, currency: string): DiagnosticFinding[] {
  const dashboard = computeDashboardMetrics(raw, ltvMethod);
  const effectiveRaw: RawInputs = { ...raw, ltvMethod: raw.ltvMethod ?? ltvMethod };
  const grossMargin = getMetricDefinition('grossMargin')!.compute(effectiveRaw).value;
  const netMargin = getMetricDefinition('netMargin')!.compute(effectiveRaw).value;
  const churn = getMetricDefinition('churn')!.compute(effectiveRaw).value;
  const retention = getMetricDefinition('retention')!.compute(effectiveRaw).value;

  const ctx: RuleContext = {
    raw: effectiveRaw,
    currency,
    cac: dashboard.cac.value,
    clv: dashboard.clv.value,
    ltvCac: dashboard.ltvCac.value,
    payback: dashboard.payback.value,
    roas: dashboard.roas.value,
    grossMargin,
    netMargin,
    churn,
    retention,
  };

  return rules
    .map((rule) => rule(ctx))
    .filter((f): f is DiagnosticFinding => f !== undefined)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
