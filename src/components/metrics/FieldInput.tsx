import type { FieldSpec } from '../../core/metricRegistry';

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: string | number | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-(--color-ink-muted)">{field.label}</span>
      {field.type === 'select' ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-[14.5px] text-(--color-ink) outline-none focus:border-(--color-brand) transition-colors"
        >
          <option value="" disabled>
            Selecciona…
          </option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          {field.type === 'currency' && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14.5px] text-(--color-ink-faint)">$</span>
          )}
          <input
            type="number"
            inputMode="decimal"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-lg border border-(--color-border) bg-(--color-surface) py-2.5 text-[14.5px] text-(--color-ink) outline-none focus:border-(--color-brand) transition-colors tabular-nums ${
              field.type === 'currency' ? 'pl-6 pr-3' : 'px-3'
            }`}
          />
          {field.type === 'percent' && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14.5px] text-(--color-ink-faint)">%</span>
          )}
        </div>
      )}
      {field.helpText && <span className="text-[12px] text-(--color-ink-faint)">{field.helpText}</span>}
    </label>
  );
}
