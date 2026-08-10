import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Code-splitting por ruta: Gráficos (Recharts) y Proyectos (jsPDF vía export)
// son las páginas con dependencias más pesadas y no deben ir en el bundle
// inicial de un dispositivo que abre la app por primera vez.
const DashboardPage = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const CalculatorsListPage = lazy(() => import('./pages/Calculators/CalculatorsListPage').then((m) => ({ default: m.CalculatorsListPage })));
const CalculatorDetailPage = lazy(() => import('./pages/Calculators/CalculatorDetailPage').then((m) => ({ default: m.CalculatorDetailPage })));
const SimulatorPage = lazy(() => import('./pages/Simulator').then((m) => ({ default: m.SimulatorPage })));
const DiagnosticsPage = lazy(() => import('./pages/Diagnostics').then((m) => ({ default: m.DiagnosticsPage })));
const HealthScorePage = lazy(() => import('./pages/HealthScore').then((m) => ({ default: m.HealthScorePage })));
const ChartsPage = lazy(() => import('./pages/Charts').then((m) => ({ default: m.ChartsPage })));
const HistoryPage = lazy(() => import('./pages/History').then((m) => ({ default: m.HistoryPage })));
const ProjectsPage = lazy(() => import('./pages/Projects').then((m) => ({ default: m.ProjectsPage })));
const LearnPage = lazy(() => import('./pages/Learn').then((m) => ({ default: m.LearnPage })));
const LearnDetailPage = lazy(() => import('./pages/Learn/LearnDetailPage').then((m) => ({ default: m.LearnDetailPage })));

function RouteFallback() {
  return <div className="text-(--color-ink-faint) text-sm px-1 py-8">Cargando…</div>;
}

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/calculadoras" element={<CalculatorsListPage />} />
            <Route path="/calculadoras/:metricId" element={<CalculatorDetailPage />} />
            <Route path="/simulador" element={<SimulatorPage />} />
            <Route path="/diagnostico" element={<DiagnosticsPage />} />
            <Route path="/health-score" element={<HealthScorePage />} />
            <Route path="/graficos" element={<ChartsPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            <Route path="/proyectos" element={<ProjectsPage />} />
            <Route path="/aprendizaje" element={<LearnPage />} />
            <Route path="/aprendizaje/:metricId" element={<LearnDetailPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  );
}
