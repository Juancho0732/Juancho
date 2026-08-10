import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/Dashboard';
import { CalculatorsListPage } from './pages/Calculators/CalculatorsListPage';
import { CalculatorDetailPage } from './pages/Calculators/CalculatorDetailPage';
import { SimulatorPage } from './pages/Simulator';
import { DiagnosticsPage } from './pages/Diagnostics';
import { HealthScorePage } from './pages/HealthScore';
import { ChartsPage } from './pages/Charts';
import { HistoryPage } from './pages/History';
import { ProjectsPage } from './pages/Projects';
import { LearnPage } from './pages/Learn';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
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
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
