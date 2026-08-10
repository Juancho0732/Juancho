import { describe, expect, it } from 'vitest';
import { runDiagnostics } from './rules';

describe('runDiagnostics', () => {
  it('detecta LTV:CAC crítico (CAC mayor que LTV) con los números reales', () => {
    const findings = runDiagnostics(
      {
        marketingSpend: 150000,
        salesSpend: 0,
        newCustomers: 1,
        avgOrderValue: 10000,
        purchaseFrequencyPerYear: 1,
        customerLifespanYears: 1,
      },
      'revenue_based',
      'USD',
    );
    const finding = findings.find((f) => f.id === 'ltv-cac-bajo-critico');
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('critical');
    expect(finding?.message).toMatch(/150.000/);
  });

  it('detecta payback largo usando el CAC y el margen mensual reales', () => {
    const findings = runDiagnostics(
      { marketingSpend: 300000, salesSpend: 0, newCustomers: 1, monthlyMarginPerCustomer: 10000 },
      'revenue_based',
      'USD',
    );
    const finding = findings.find((f) => f.id === 'payback-muy-largo');
    expect(finding).toBeDefined();
    expect(finding?.message).toMatch(/30.0 meses/);
  });

  it('detecta churn crítico', () => {
    const findings = runDiagnostics({ customersStart: 100, customersLost: 30 }, 'revenue_based', 'USD');
    expect(findings.find((f) => f.id === 'churn-critico')).toBeDefined();
  });

  it('detecta margen bruto crítico', () => {
    const findings = runDiagnostics({ revenue: 1000, cogs: 950 }, 'revenue_based', 'USD');
    expect(findings.find((f) => f.id === 'margen-bruto-critico')).toBeDefined();
  });

  it('detecta dependencia excesiva de publicidad', () => {
    const findings = runDiagnostics({ adSpend: 900, marketingSpend: 1000 }, 'revenue_based', 'USD');
    const finding = findings.find((f) => f.id === 'dependencia-publicidad');
    expect(finding).toBeDefined();
    expect(finding?.message).toMatch(/90%/);
  });

  it('no genera hallazgos de una regla si faltan los inputs que necesita', () => {
    const findings = runDiagnostics({}, 'revenue_based', 'USD');
    expect(findings).toHaveLength(0);
  });

  it('ordena los hallazgos por severidad: critical antes que warning antes que info', () => {
    const findings = runDiagnostics(
      {
        marketingSpend: 150000,
        salesSpend: 0,
        newCustomers: 1,
        avgOrderValue: 10000,
        purchaseFrequencyPerYear: 1,
        customerLifespanYears: 1,
        customersStart: 100,
        customersLost: 12,
        adSpend: 900,
      },
      'revenue_based',
      'USD',
    );
    const severities = findings.map((f) => f.severity);
    const sorted = [...severities].sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a] - { critical: 0, warning: 1, info: 2 }[b]));
    expect(severities).toEqual(sorted);
  });

  it('un caso saludable no genera hallazgos críticos', () => {
    const findings = runDiagnostics(
      {
        marketingSpend: 50000,
        salesSpend: 0,
        newCustomers: 5,
        avgOrderValue: 100000,
        purchaseFrequencyPerYear: 4,
        customerLifespanYears: 3,
        monthlyMarginPerCustomer: 50000,
        revenue: 1000000,
        cogs: 300000,
        operatingExpenses: 200000,
        customersStart: 200,
        customersLost: 5,
      },
      'revenue_based',
      'USD',
    );
    expect(findings.find((f) => f.severity === 'critical')).toBeUndefined();
  });
});
