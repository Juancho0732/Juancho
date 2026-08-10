import { ProjectSwitcher } from './ProjectSwitcher';

/** Visible solo por debajo de `md` (iPhone): la Sidebar que normalmente aloja
 * el selector de proyectos está oculta ahí, así que sin esto no habría forma
 * de crear o cambiar de proyecto en un teléfono. */
export function MobileTopBar() {
  return (
    <header className="md:hidden sticky top-0 z-20 bg-(--color-canvas) border-b border-(--color-border) px-4 pt-3 pb-2.5">
      <ProjectSwitcher />
    </header>
  );
}
