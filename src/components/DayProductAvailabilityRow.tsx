"use client";

type Props = {
  id: string;
  name: string;
  unit: string;
  enabled: boolean;
  limitDraft: string;
  disabled?: boolean;
  onToggle: () => void;
  onLimitChange: (value: string) => void;
};

export default function DayProductAvailabilityRow({
  id, name, unit, enabled, limitDraft, disabled = false, onToggle, onLimitChange,
}: Props) {
  return (
    <div className={`flex items-start justify-between gap-2 rounded-lg px-2 py-2 transition-colors ${enabled ? "bg-white" : "bg-transparent"}`}>
      <div className="min-w-0 flex-1">
        <p className={`font-sans text-xs ${enabled ? "font-medium text-brown-dark" : "text-brown/50"}`}>
          {name}
        </p>
        <p className={`font-sans text-[10px] ${enabled ? "text-brown/50" : "text-brown/30"}`}>
          {unit}
        </p>
        <label htmlFor={`limit-${id}`} className={`mt-1 block font-sans text-[10px] leading-3 ${enabled ? "text-brown/55" : "text-brown/35"}`}>
          Maximum rendelhető vevőnként
        </label>
      </div>
      <div className="flex flex-shrink-0 flex-col items-center gap-1.5">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`${name} rendelhető`}
          onClick={onToggle}
          disabled={disabled}
          className={`relative h-5 w-8 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${enabled ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${enabled ? "left-[14px]" : "left-0.5"}`} />
        </button>
        <input
          id={`limit-${id}`}
          type="number"
          min={1}
          max={99}
          step={1}
          inputMode="numeric"
          value={limitDraft}
          onChange={(event) => onLimitChange(event.target.value)}
          disabled={disabled}
          placeholder="–"
          aria-label={`${name} – maximum rendelhető vevőnként`}
          className="w-14 rounded-md border border-cream-dark bg-white px-1 py-1 text-center font-sans text-xs text-brown-dark focus:border-gold focus:outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}
