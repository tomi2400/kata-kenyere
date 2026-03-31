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
    <div className="w-full paper-panel rounded-2xl px-4 py-4 warm-ring">
      <div className="flex items-center justify-center gap-0 mb-3">
        {steps.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          return (
            <div key={step.datum} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold font-sans transition-all
                ${isDone ? "bg-gold text-brown-dark shadow-sm" : isActive ? "bg-brown-dark text-cream ring-2 ring-gold shadow-md" : "bg-white text-brown/40 border border-gold/15"}
              `}>
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px mx-1 transition-colors ${i < currentIndex ? "bg-gold" : "bg-gold/20"}`} />
              )}
            </div>
          );
        })}
        <div className="flex items-center">
          <div className={`w-8 h-px mx-1 ${currentIndex >= steps.length ? "bg-gold" : "bg-gold/20"}`} />
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold font-sans
            ${currentIndex >= steps.length ? "bg-gold text-brown-dark" : "bg-white text-brown/40 border border-gold/15"}
          `}>
            ✓
          </div>
        </div>
      </div>

      {currentIndex < steps.length && (
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-brown/35 mb-1">
            Aktuális rendelési nap
          </p>
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
