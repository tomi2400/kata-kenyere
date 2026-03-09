type Step = { nap: string; datum: string };

function formatDatum(datum: string): string {
  const d = new Date(datum);
  return d.toLocaleDateString("hu-HU", { month: "long", day: "numeric" });
}

export default function DayProgress({
  steps,
  currentIndex,
}: {
  steps: Step[];
  currentIndex: number;
}) {
  return (
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-0 mb-3">
        {steps.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          return (
            <div key={step.datum} className="flex items-center">
              {/* Dot */}
              <div className={`
                flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-sans transition-all
                ${isDone ? "bg-gold text-brown-dark" : isActive ? "bg-brown-dark text-cream ring-2 ring-gold" : "bg-cream-dark text-brown/40"}
              `}>
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className={`w-8 h-px mx-1 transition-colors ${i < currentIndex ? "bg-gold" : "bg-cream-dark"}`} />
              )}
            </div>
          );
        })}
        {/* Összesítés lépés */}
        <div className="flex items-center">
          <div className={`w-8 h-px mx-1 ${currentIndex >= steps.length ? "bg-gold" : "bg-cream-dark"}`} />
          <div className={`
            flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-sans
            ${currentIndex >= steps.length ? "bg-gold text-brown-dark" : "bg-cream-dark text-brown/40"}
          `}>
            ✓
          </div>
        </div>
      </div>

      {/* Active day label */}
      {currentIndex < steps.length && (
        <div className="text-center">
          <span className="font-serif text-lg text-brown-dark font-semibold">
            {steps[currentIndex].nap}
          </span>
          <span className="font-sans text-sm text-brown/50 ml-2">
            {formatDatum(steps[currentIndex].datum)}
          </span>
        </div>
      )}
    </div>
  );
}
