"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Termek = {
  id: string;
  slug: string;
  nev: string;
  leiras: string;
  kategoria: string;
  ar: number;
  egyseg: string;
  foto_url: string | null;
  aktiv: boolean;
  sorrend: number;
};

type FormData = {
  nev: string;
  slug: string;
  leiras: string;
  kategoria: string;
  ar: string;
  egyseg: string;
  foto_url: string;
};

const emptyForm: FormData = {
  nev: "",
  slug: "",
  leiras: "",
  kategoria: "",
  ar: "",
  egyseg: "",
  foto_url: "",
};

export default function TermekekPage() {
  const [termekek, setTermekek] = useState<Termek[]>([]);
  const [kategoriak, setKategoriak] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchTermekek = () => {
    setLoading(true);
    fetch("/api/admin/termekek")
      .then((res) => res.json())
      .then((data) => {
        setTermekek(data.termekek ?? []);
        setKategoriak(data.kategoriak ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTermekek();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, kategoria: kategoriak[0] || "" });
    setShowForm(true);
  };

  const openEdit = (t: Termek) => {
    setEditingId(t.id);
    setForm({
      nev: t.nev,
      slug: t.slug,
      leiras: t.leiras,
      kategoria: t.kategoria,
      ar: String(t.ar),
      egyseg: t.egyseg,
      foto_url: t.foto_url || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editingId) {
      await fetch(`/api/admin/termekek/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nev: form.nev,
          slug: form.slug,
          leiras: form.leiras,
          kategoria: form.kategoria,
          ar: Number(form.ar),
          egyseg: form.egyseg,
          foto_url: form.foto_url || null,
        }),
      });
    } else {
      await fetch("/api/admin/termekek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setShowForm(false);
    fetchTermekek();
  };

  const toggleAktiv = async (t: Termek) => {
    await fetch(`/api/admin/termekek/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktiv: !t.aktiv }),
    });
    fetchTermekek();
  };

  // Kategoriak szerinti csoportositas
  const grouped: Record<string, Termek[]> = {};
  for (const t of termekek) {
    if (!grouped[t.kategoria]) grouped[t.kategoria] = [];
    grouped[t.kategoria].push(t);
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brown-dark">Termekek</h1>
          <p className="font-sans text-sm text-brown/50 mt-1">
            Termekek kezelese, ar- es fotomodositas
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 rounded-lg font-sans text-sm font-semibold
            bg-gold text-brown-dark hover:bg-gold-light transition-colors cursor-pointer"
        >
          + Uj termek
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        Object.entries(grouped).map(([kategoria, items]) => (
          <section key={kategoria} className="mb-8">
            <h2 className="font-serif text-base text-brown/60 mb-3 pb-2 border-b border-gold/20">
              {kategoria}
            </h2>
            <div className="space-y-2">
              {items.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 bg-white rounded-xl border border-cream-dark p-3 ${
                    !t.aktiv ? "opacity-50" : ""
                  }`}
                >
                  {/* Foto */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-cream-dark flex-shrink-0">
                    <Image
                      src={t.foto_url || "/images/termek-placeholder.jpg"}
                      alt={t.nev}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-semibold text-brown-dark truncate">
                      {t.nev}
                    </p>
                    <p className="font-sans text-xs text-brown/50">
                      {t.egyseg} · {t.ar.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>

                  {/* Aktiv toggle */}
                  <button
                    onClick={() => toggleAktiv(t)}
                    className={`
                      w-10 h-6 rounded-full transition-colors cursor-pointer relative
                      ${t.aktiv ? "bg-green-500" : "bg-gray-300"}
                    `}
                    title={t.aktiv ? "Aktiv" : "Inaktiv"}
                  >
                    <div
                      className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${t.aktiv ? "left-5" : "left-1"}
                      `}
                    />
                  </button>

                  {/* Szerkesztes */}
                  <button
                    onClick={() => openEdit(t)}
                    className="p-2 text-brown/40 hover:text-brown-dark transition-colors cursor-pointer"
                    title="Szerkesztes"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-cream rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="font-serif text-xl text-brown-dark">
              {editingId ? "Termek szerkesztese" : "Uj termek"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Nev</label>
                <input
                  type="text"
                  value={form.nev}
                  onChange={(e) => setForm({ ...form, nev: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Slug (URL nev)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                  placeholder="pl. feher-1kg"
                />
              </div>

              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Kategoria</label>
                <select
                  value={form.kategoria}
                  onChange={(e) => setForm({ ...form, kategoria: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                >
                  {kategoriak.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs text-brown/60 mb-1">Ar (Ft)</label>
                  <input
                    type="number"
                    value={form.ar}
                    onChange={(e) => setForm({ ...form, ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs text-brown/60 mb-1">Egyseg</label>
                  <input
                    type="text"
                    value={form.egyseg}
                    onChange={(e) => setForm({ ...form, egyseg: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                    placeholder="pl. 1 kg, db"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Leiras</label>
                <textarea
                  value={form.leiras}
                  onChange={(e) => setForm({ ...form, leiras: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Foto URL</label>
                <input
                  type="text"
                  value={form.foto_url}
                  onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg font-sans text-sm border border-cream-dark
                  text-brown/60 hover:bg-cream-dark transition-colors cursor-pointer"
              >
                Megse
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.nev || !form.slug || !form.ar}
                className="flex-1 py-2.5 rounded-lg font-sans text-sm font-semibold
                  bg-gold text-brown-dark hover:bg-gold-light transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? "Mentes..." : "Mentes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
