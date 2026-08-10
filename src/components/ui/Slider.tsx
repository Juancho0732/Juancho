export function Slider({
  label,
  percent,
  onChange,
  baseLabel,
  adjustedLabel,
}: {
  label: string;
  percent: number;
  onChange: (percent: number) => void;
  baseLabel: string;
  adjustedLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13.5px] font-medium text-(--color-ink)">{label}</span>
        <span className={`text-[12.5px] font-medium tabular-nums ${percent === 0 ? 'text-(--color-ink-faint)' : percent > 0 ? 'text-(--color-good)' : 'text-(--color-bad)'}`}>
          {percent > 0 ? '+' : ''}
          {percent}%
        </span>
      </div>
      <input
        type="range"
        min={-50}
        max={50}
        step={1}
        value={percent}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-(--color-brand) h-6 cursor-pointer"
      />
      <div className="flex justify-between text-[11.5px] text-(--color-ink-faint) tabular-nums">
        <span>Base: {baseLabel}</span>
        <span>Ahora: {adjustedLabel}</span>
      </div>
    </div>
  );
}
