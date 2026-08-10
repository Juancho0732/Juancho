import { type ReactNode, useEffect } from 'react';
import { useProjectStore } from '../../state/useProjectStore';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileTopBar } from './MobileTopBar';

export function AppShell({ children }: { children: ReactNode }) {
  const hydrate = useProjectStore((s) => s.hydrate);
  const loading = useProjectStore((s) => s.loading);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex min-h-screen bg-(--color-canvas)">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar />
        <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-10 lg:py-8 pb-20 md:pb-8 max-w-[1400px] w-full mx-auto">
          {loading ? <ShellLoading /> : children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function ShellLoading() {
  return <div className="text-(--color-ink-faint) text-sm px-1 py-8">Cargando…</div>;
}
