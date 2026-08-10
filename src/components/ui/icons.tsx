/**
 * Set mínimo de iconos inline (sin dependencia externa), trazo 1.75, 24x24.
 * Mantenerlos simples y consistentes es más importante que variedad visual.
 */
import type { SVGProps } from 'react';

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5" />
    </svg>
  );
}

export function CalculatorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="2.5" width="15" height="19" rx="2" />
      <line x1="7.5" y1="6.5" x2="16.5" y2="6.5" />
      <line x1="7.5" y1="11" x2="7.5" y2="11.01" />
      <line x1="12" y1="11" x2="12" y2="11.01" />
      <line x1="16.5" y1="11" x2="16.5" y2="11.01" />
      <line x1="7.5" y1="15" x2="7.5" y2="15.01" />
      <line x1="12" y1="15" x2="12" y2="15.01" />
      <line x1="16.5" y1="15" x2="16.5" y2="18.5" />
      <line x1="7.5" y1="18.5" x2="7.5" y2="18.51" />
      <line x1="12" y1="18.5" x2="12" y2="18.51" />
    </svg>
  );
}

export function SimulatorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="14" cy="7" r="2.25" />
      <line x1="4" y1="14" x2="20" y2="14" />
      <circle cx="9" cy="14" r="2.25" />
      <line x1="4" y1="19.5" x2="20" y2="19.5" />
      <circle cx="16" cy="19.5" r="2.25" />
    </svg>
  );
}

export function DiagnosisIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 12h4l2-6 4 12 2-6h5" />
    </svg>
  );
}

export function ScoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 15.9l-5.2 2.9 1-5.9-4.3-4.2 5.9-.8z" />
    </svg>
  );
}

export function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="20" x2="20" y2="20" />
      <path d="M5 16l4-5 3.5 3L18 7" />
    </svg>
  );
}

export function HistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="13" r="8" />
      <polyline points="12 9 12 13 15 15" />
      <path d="M8 3.5L5 6" />
      <path d="M16 3.5L19 6" />
    </svg>
  );
}

export function ProjectsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l1.8 2H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" />
    </svg>
  );
}

export function LearnIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5c2.5-1.3 5-1.3 8 0v13c-3-1.3-5.5-1.3-8 0z" />
      <path d="M20 5.5c-2.5-1.3-5-1.3-8 0v13c3-1.3 5.5-1.3 8 0z" />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
