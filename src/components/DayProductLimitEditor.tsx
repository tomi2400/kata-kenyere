"use client";

export type LimitProduct = { id: string; nev: string };

type Props = {
  products: LimitProduct[];
  limits: Record<string, number>;
  drafts: Record<string, string>;
  loading?: boolean;
  saving?: boolean;
  savingId?: string | null;
  successId?: string | null;
  error?: string;
  showBulkSaveHint?: boolean;
  onChange: (productId: string, value: string) => void;
  onSave: (product: LimitProduct) => void;
};

export default function DayProductLimitEditor({
  products, limits, drafts, loading = false, saving = false,
  savingId = null, successId = null, error = "", showBulkSaveHint = true,
  onChange, onSave,
}: Props) {
  return (
    <div className="rounded-xl border border-gold/25 bg-white p-3">
      <p className="font-sans text-sm font-semibold text-brown-dark">Maximum rendelhető vevőnként</p>
      <p className="mt-1 font-sans text-xs text-brown/55">
        Az adott nap minden termékénél külön állítható. Üres mezőnél nincs külön limit. Az azonos e-mail címmel leadott rendelések összeadódnak.
        {showBulkSaveHint ? " A nap melletti gombbal azonnal, a fenti Mentés gombbal az összes változást mentheted." : " A Mentés gombbal próbálhatod ki a változást."}
      </p>
      {loading ? (
        <p className="mt-3 font-sans text-xs text-brown/50">Limitek betöltése...</p>
      ) : products.length === 0 ? (
        <p className="mt-3 font-sans text-xs text-brown/50">Előbb kapcsold be a rendelhető termékeket ehhez a naphoz.</p>
      ) : (
        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-2">
              <label htmlFor={`limit-${product.id}`} className="min-w-0 flex-1 truncate font-sans text-xs text-brown-dark" title={product.nev}>
                {product.nev}
              </label>
              <input
                id={`limit-${product.id}`}
                type="number"
                min={1}
                max={99}
                step={1}
                value={drafts[product.id] ?? ""}
                onChange={(event) => onChange(product.id, event.target.value)}
                placeholder="Nincs"
                aria-label={`${product.nev} – maximum rendelhető vevőnként`}
                className="w-16 rounded-lg border border-cream-dark px-2 py-1.5 font-sans text-xs focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onSave(product)}
                disabled={saving || savingId !== null || (drafts[product.id] ?? "") === (limits[product.id] === undefined ? "" : String(limits[product.id]))}
                className="rounded-lg bg-gold px-2 py-1.5 font-sans text-xs font-semibold text-brown-dark disabled:opacity-40"
              >
                {savingId === product.id ? "..." : successId === product.id ? "Mentve" : "Mentés"}
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-2 font-sans text-xs text-red-600">{error}</p>}
    </div>
  );
}
