import { PageHeader } from '../components/ui/PageHeader';

export function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-14 text-center">
        <p className="text-[14px] text-(--color-ink-muted)">Esta sección llega en una fase posterior del roadmap.</p>
      </div>
    </div>
  );
}
