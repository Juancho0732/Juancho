import type { ComponentType, SVGProps } from 'react';
import {
  CalculatorIcon,
  ChartIcon,
  DashboardIcon,
  DiagnosisIcon,
  HistoryIcon,
  LearnIcon,
  ProjectsIcon,
  ScoreIcon,
  SimulatorIcon,
} from '../ui/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/calculadoras', label: 'Calculadoras', icon: CalculatorIcon },
  { to: '/simulador', label: 'Simulador', icon: SimulatorIcon },
  { to: '/diagnostico', label: 'Diagnóstico', icon: DiagnosisIcon },
  { to: '/health-score', label: 'Health Score', icon: ScoreIcon },
  { to: '/graficos', label: 'Gráficos', icon: ChartIcon },
  { to: '/historial', label: 'Historial', icon: HistoryIcon },
  { to: '/proyectos', label: 'Proyectos', icon: ProjectsIcon },
  { to: '/aprendizaje', label: 'Aprendizaje', icon: LearnIcon },
];

/** Subconjunto priorizado para la barra inferior en iPhone (espacio limitado). */
export const MOBILE_NAV_ITEMS = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  NAV_ITEMS[3],
  NAV_ITEMS[7],
];
