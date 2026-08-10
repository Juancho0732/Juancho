/**
 * Genera un PDF de una página con el análisis de un periodo: métricas
 * principales, Health Score y diagnóstico. Se genera enteramente en el
 * navegador del usuario (jsPDF) — no se envía ningún dato a un servicio
 * externo para producir el archivo.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { computeComparisonMetrics, COMPARISON_METRIC_IDS } from '../core/computeComparisonMetrics';
import { computeHealthScore } from '../core/healthScore/score';
import { runDiagnostics } from '../core/diagnostics/rules';
import { getMetricDefinition } from '../core/metricRegistry';
import { formatMetricValue } from '../core/format';
import type { Project, Snapshot } from './db';

export function generateAnalysisPdf(project: Project, snapshot: Snapshot): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Marketing Metrics', marginX, y);
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`${project.name} · ${snapshot.label}`, marginX, y);
  y += 14;
  doc.text(`Generado el ${new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}`, marginX, y);
  y += 24;
  doc.setTextColor(0);

  // Métricas principales
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Métricas principales', marginX, y);
  y += 8;

  const metrics = computeComparisonMetrics(snapshot.rawInputs, project.ltvMethod);
  const metricRows = COMPARISON_METRIC_IDS.map((id) => {
    const definition = getMetricDefinition(id)!;
    const result = metrics[id];
    return [definition.name, formatMetricValue(result, project.currency), definition.interpret(result) ?? '—'];
  });

  autoTable(doc, {
    startY: y + 6,
    margin: { left: marginX, right: marginX },
    head: [['Métrica', 'Valor', 'Interpretación']],
    body: metricRows,
    styles: { fontSize: 9, cellPadding: 6, textColor: 20 },
    headStyles: { fillColor: [24, 24, 27], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 80 }, 2: { cellWidth: 'auto' } },
    alternateRowStyles: { fillColor: [247, 247, 248] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 26;

  // Health Score
  const { overall, dimensions } = computeHealthScore(snapshot.rawInputs, project.ltvMethod);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Marketing Health Score', marginX, y);
  y += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(overall !== undefined ? `${overall} / 100` : 'Sin datos suficientes', marginX, y + 16);
  y += 22;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['Dimensión', 'Puntaje', 'Basado en']],
    body: dimensions.map((d) => [d.label, d.score !== undefined ? `${Math.round(d.score)}/100` : 'Sin datos', d.basis]),
    styles: { fontSize: 9, cellPadding: 6, textColor: 20 },
    headStyles: { fillColor: [24, 24, 27], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 60 }, 2: { cellWidth: 'auto' } },
    alternateRowStyles: { fillColor: [247, 247, 248] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 26;

  // Diagnóstico
  const findings = runDiagnostics(snapshot.rawInputs, project.ltvMethod, project.currency);
  if (y > 680) {
    doc.addPage();
    y = 50;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Diagnóstico', marginX, y);
  y += 4;

  if (findings.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No se detectaron problemas con los datos disponibles.', marginX, y + 18);
  } else {
    autoTable(doc, {
      startY: y + 10,
      margin: { left: marginX, right: marginX },
      head: [['Severidad', 'Hallazgo']],
      body: findings.map((f) => [
        f.severity === 'critical' ? 'Crítico' : f.severity === 'warning' ? 'Atención' : 'Info',
        `${f.title}\n${f.message}`,
      ]),
      styles: { fontSize: 9, cellPadding: 6, textColor: 20 },
      headStyles: { fillColor: [24, 24, 27], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 'auto' } },
      alternateRowStyles: { fillColor: [247, 247, 248] },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Generado con Marketing Metrics · Datos almacenados solo en el dispositivo del usuario.', marginX, 820);
  }

  return doc;
}
