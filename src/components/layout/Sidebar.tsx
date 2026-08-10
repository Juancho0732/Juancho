import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { ProjectSwitcher } from './ProjectSwitcher';

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-(--color-border) bg-(--color-surface) h-screen sticky top-0">
      <div className="px-5 pt-6 pb-4">
        <p className="text-[17px] font-semibold tracking-tight text-(--color-ink)">Marketing Metrics</p>
        <p className="text-[13px] text-(--color-ink-muted) mt-0.5">Convierte tus datos en decisiones.</p>
      </div>

      <div className="px-3 pb-3">
        <ProjectSwitcher />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-(--color-brand-soft) text-(--color-brand-ink)'
                  : 'text-(--color-ink-muted) hover:bg-(--color-surface-muted) hover:text-(--color-ink)'
              }`
            }
          >
            <Icon className="shrink-0" width={19} height={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-(--color-border)">
        <p className="text-[12px] leading-snug text-(--color-ink-faint)">
          Tus datos se guardan solo en este dispositivo. Nada se envía a servidores externos.
        </p>
      </div>
    </aside>
  );
}
