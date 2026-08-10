import { NavLink } from 'react-router-dom';
import { MOBILE_NAV_ITEMS } from './navItems';

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex border-t border-(--color-border) bg-(--color-surface)"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-2.5 min-h-11 text-[11px] font-medium ${
              isActive ? 'text-(--color-brand)' : 'text-(--color-ink-faint)'
            }`
          }
        >
          <Icon width={21} height={21} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
