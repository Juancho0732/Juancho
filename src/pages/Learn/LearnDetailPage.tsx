import { Link, useParams } from 'react-router-dom';
import { getMetricDefinition } from '../../core/metricRegistry';
import { METRIC_EDUCATION } from '../../content/metricEducation';
import { PageHeader } from '../../components/ui/PageHeader';

export function LearnDetailPage() {
  const { metricId } = useParams<{ metricId: string }>();
  const definition = metricId ? getMetricDefinition(metricId) : undefined;
  const education = metricId ? METRIC_EDUCATION[metricId] : undefined;

  if (!definition || !education) {
    return (
      <div>
        <PageHeader title="Métrica no encontrada" />
        <Link to="/aprendizaje" className="text-(--color-brand) text-[14px] font-medium">
          Volver a Aprendizaje
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={definition.name} subtitle={definition.shortName} />

      <div className="flex flex-col gap-5">
        <Section title="¿Qué significa?" text={education.whatItMeans} />
        <Section title="¿Cómo se calcula?" text={education.howToCalculate} />
        <Section title="¿Cómo interpretarlo?" text={education.howToInterpret} />
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
          <p className="text-[13px] font-semibold text-(--color-ink) mb-2.5">Errores comunes</p>
          <ul className="list-disc pl-5 space-y-1.5">
            {education.commonMistakes.map((mistake, i) => (
              <li key={i} className="text-[13.5px] leading-relaxed text-(--color-ink-muted)">
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        to={`/calculadoras/${definition.id}`}
        className="inline-flex items-center gap-1.5 mt-6 rounded-lg bg-(--color-brand) text-white text-[13.5px] font-medium px-4 py-2.5 hover:bg-(--color-brand-ink) transition-colors"
      >
        Ir a la calculadora de {definition.shortName}
      </Link>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
      <p className="text-[13px] font-semibold text-(--color-ink) mb-2">{title}</p>
      <p className="text-[13.5px] leading-relaxed text-(--color-ink-muted)">{text}</p>
    </div>
  );
}
