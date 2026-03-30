"use client";

import { useState, useEffect, useRef } from "react";
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

type Kategoria = {
  id: string;
  nev: string;
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

// ─── TERMÉKEK TAB ────────────────────────────────────────────────────────────

function TermekekTab() {
  const [termekek, setTermekek] = useState<Termek[]>([]);
  const [kategoriak, setKategoriak] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});

  const fetchTermekek = () => {
    setLoading(true);
    fetch("/api/admin/termekek")
      .then((r) => r.json())
      .then((d) => {
        setTermekek(d.termekek ?? []);
        setKategoriak(d.kategoriak ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTermekek(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, kategoria: kategoriak[0] || "" });
    setShowForm(true);
  };

  const openEdit = (t: Termek) => {
    setDeleteError((prev) => ({ ...prev, [t.id]: "" }));
    setEditingId(t.id);
    setForm({
      nev: t.nev, slug: t.slug, leiras: t.leiras,
      kategoria: t.kategoria, ar: String(t.ar),
      egyseg: t.egyseg, foto_url: t.foto_url || "",
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
          nev: form.nev, slug: form.slug, leiras: form.leiras,
          kategoria: form.kategoria, ar: Number(form.ar),
          egyseg: form.egyseg, foto_url: form.foto_url || null,
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

  const handleDelete = async (t: Termek) => {
    setDeleteError((prev) => ({ ...prev, [t.id]: "" }));

    const biztos = window.confirm(`Biztosan törlöd ezt a terméket?\n\n${t.nev} (${t.egyseg})`);
    if (!biztos) return;

    setDeletingId(t.id);
    const res = await fetch(`/api/admin/termekek/${t.id}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      fetchTermekek();
      return;
    }

    const d = await res.json().catch(() => ({}));
    setDeleteError((prev) => ({ ...prev, [t.id]: d.error ?? "Hiba történt a törlés közben." }));
  };

  const grouped = kategoriak
    .map((kategoria) => ({
      kategoria,
      items: termekek.filter((t) => t.kategoria === kategoria),
    }))
    .filter(({ items }) => items.length > 0);

  const extraKategoriak = Array.from(new Set(termekek.map((t) => t.kategoria)))
    .filter((kategoria) => !kategoriak.includes(kategoria))
    .map((kategoria) => ({
      kategoria,
      items: termekek.filter((t) => t.kategoria === kategoria),
    }));

  const orderedGroups = [...grouped, ...extraKategoriak];

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={openNew}
          className="px-4 py-2 rounded-lg font-sans text-sm font-semibold
            bg-gold text-brown-dark hover:bg-gold-light transition-colors cursor-pointer"
        >
          + Új termék
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        orderedGroups.map(({ kategoria, items }) => (
          <section key={kategoria} className="mb-8">
            <h2 className="font-serif text-base text-brown/60 mb-3 pb-2 border-b border-gold/20">
              {kategoria}
            </h2>
            <div className="space-y-2">
              {items.map((t) => (
                <div
                  key={t.id}
                  className={`bg-white rounded-xl border border-cream-dark p-3 ${!t.aktiv ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-cream-dark flex-shrink-0">
                      <Image
                        src={t.foto_url || "/images/termek-placeholder.jpg"}
                        alt={t.nev} fill className="object-cover" sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-semibold text-brown-dark truncate">{t.nev}</p>
                      <p className="font-sans text-xs text-brown/50">{t.egyseg} · {t.ar.toLocaleString("hu-HU")} Ft</p>
                    </div>
                    <button
                      onClick={() => toggleAktiv(t)}
                      className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${t.aktiv ? "bg-green-500" : "bg-gray-300"}`}
                      title={t.aktiv ? "Aktív" : "Inaktív"}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${t.aktiv ? "left-5" : "left-1"}`} />
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="p-2 text-brown/40 hover:text-brown-dark transition-colors cursor-pointer"
                      title="Szerkesztés"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={deletingId === t.id}
                      className="p-2 text-brown/25 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Törlés"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {deleteError[t.id] && (
                    <p className="font-sans text-xs text-red-500 mt-2 ml-[68px]">{deleteError[t.id]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-cream rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="font-serif text-xl text-brown-dark">
              {editingId ? "Termék szerkesztése" : "Új termék"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Név</label>
                <input type="text" value={form.nev}
                  onChange={(e) => setForm({ ...form, nev: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Slug (URL név)</label>
                <input type="text" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                  placeholder="pl. feher-1kg" />
              </div>
              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Kategória</label>
                <select value={form.kategoria}
                  onChange={(e) => setForm({ ...form, kategoria: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none">
                  {kategoriak.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs text-brown/60 mb-1">Ár (Ft)</label>
                  <input type="number" value={form.ar}
                    onChange={(e) => setForm({ ...form, ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block font-sans text-xs text-brown/60 mb-1">Egység</label>
                  <input type="text" value={form.egyseg}
                    onChange={(e) => setForm({ ...form, egyseg: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                    placeholder="pl. 1 kg, db" />
                </div>
              </div>
              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Leírás</label>
                <textarea value={form.leiras}
                  onChange={(e) => setForm({ ...form, leiras: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Fotó URL</label>
                <input type="text" value={form.foto_url}
                  onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                  placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg font-sans text-sm border border-cream-dark text-brown/60 hover:bg-cream-dark transition-colors cursor-pointer">
                Mégsem
              </button>
              <button onClick={handleSave}
                disabled={saving || !form.nev || !form.slug || !form.ar}
                className="flex-1 py-2.5 rounded-lg font-sans text-sm font-semibold bg-gold text-brown-dark hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {saving ? "Mentés..." : "Mentés"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── KATEGÓRIÁK TAB ──────────────────────────────────────────────────────────

function KategoriakTab() {
  const [kategoriak, setKategoriak] = useState<Kategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNev, setNewNev] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNev, setEditNev] = useState("");
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchKategoriak = () => {
    setLoading(true);
    fetch("/api/admin/kategoriak")
      .then((r) => r.json())
      .then((d) => {
        setKategoriak(d.kategoriak ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchKategoriak(); }, []);

  const handleAdd = async () => {
    if (!newNev.trim()) return;
    setAdding(true);
    await fetch("/api/admin/kategoriak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nev: newNev.trim() }),
    });
    setNewNev("");
    setAdding(false);
    fetchKategoriak();
  };

  const startEdit = (k: Kategoria) => {
    setEditingId(k.id);
    setEditNev(k.nev);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveEdit = async (k: Kategoria) => {
    if (!editNev.trim() || editNev.trim() === k.nev) {
      setEditingId(null);
      return;
    }
    await fetch(`/api/admin/kategoriak/${k.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nev: editNev.trim() }),
    });
    setEditingId(null);
    fetchKategoriak();
  };

  const moveSorrend = async (k: Kategoria, dir: -1 | 1) => {
    const sorted = [...kategoriak].sort((a, b) => a.sorrend - b.sorrend);
    const idx = sorted.findIndex((x) => x.id === k.id);
    const swapWith = sorted[idx + dir];
    if (!swapWith) return;

    await Promise.all([
      fetch(`/api/admin/kategoriak/${k.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sorrend: swapWith.sorrend }),
      }),
      fetch(`/api/admin/kategoriak/${swapWith.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sorrend: k.sorrend }),
      }),
    ]);
    fetchKategoriak();
  };

  const handleDelete = async (k: Kategoria) => {
    setDeleteError((prev) => ({ ...prev, [k.id]: "" }));
    const res = await fetch(`/api/admin/kategoriak/${k.id}`, { method: "DELETE" });
    if (res.ok) {
      fetchKategoriak();
    } else {
      const d = await res.json();
      setDeleteError((prev) => ({ ...prev, [k.id]: d.error ?? "Hiba történt." }));
    }
  };

  const sorted = [...kategoriak].sort((a, b) => a.sorrend - b.sorrend);

  return (
    <div className="max-w-lg">
      <p className="font-sans text-sm text-brown/50 mb-6">
        A kategóriák sorrendje meghatározza a weboldal és az admin felület megjelenési sorrendjét.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {sorted.map((k, idx) => (
            <div key={k.id} className="bg-white rounded-xl border border-cream-dark p-3">
              <div className="flex items-center gap-3">
                {/* Sorrend nyilak */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveSorrend(k, -1)}
                    disabled={idx === 0}
                    className="p-0.5 text-brown/30 hover:text-brown-dark disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveSorrend(k, 1)}
                    disabled={idx === sorted.length - 1}
                    className="p-0.5 text-brown/30 hover:text-brown-dark disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Sorszám */}
                <span className="font-sans text-xs text-brown/30 w-5 text-center">{idx + 1}</span>

                {/* Név – szerkeszthető */}
                {editingId === k.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editNev}
                    onChange={(e) => setEditNev(e.target.value)}
                    onBlur={() => saveEdit(k)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(k);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 rounded-lg border border-gold font-sans text-sm bg-white focus:outline-none"
                  />
                ) : (
                  <span className="flex-1 font-sans text-sm font-semibold text-brown-dark">
                    {k.nev}
                  </span>
                )}

                {/* Szerkesztés */}
                {editingId !== k.id && (
                  <button
                    onClick={() => startEdit(k)}
                    className="p-1.5 text-brown/30 hover:text-brown-dark transition-colors cursor-pointer"
                    title="Átnevezés"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                )}

                {/* Törlés */}
                <button
                  onClick={() => handleDelete(k)}
                  className="p-1.5 text-brown/20 hover:text-red-500 transition-colors cursor-pointer"
                  title="Törlés"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {deleteError[k.id] && (
                <p className="font-sans text-xs text-red-500 mt-2 ml-10">{deleteError[k.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Új kategória */}
      <div className="border-t border-cream-dark pt-6">
        <p className="font-sans text-xs font-semibold text-brown/40 uppercase tracking-wider mb-3">
          Új kategória
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={newNev}
            onChange={(e) => setNewNev(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="pl. Gluténmentes termékek"
            className="flex-1 px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newNev.trim()}
            className="px-4 py-2 rounded-lg font-sans text-sm font-semibold
              bg-gold text-brown-dark hover:bg-gold-light transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {adding ? "..." : "+ Hozzáad"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FŐ OLDAL ────────────────────────────────────────────────────────────────

type Tab = "termekek" | "kategoriak";

export default function TermekekPage() {
  const [activeTab, setActiveTab] = useState<Tab>("termekek");

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-brown-dark">Termékek</h1>
        <p className="font-sans text-sm text-brown/50 mt-1">
          Termékek és kategóriák kezelése
        </p>
      </div>

      {/* Fülek */}
      <div className="flex gap-1 mb-6 border-b border-cream-dark">
        {([
          { key: "termekek", label: "Termékek" },
          { key: "kategoriak", label: "Kategóriák" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 font-sans text-sm transition-colors cursor-pointer -mb-px border-b-2
              ${activeTab === key
                ? "border-gold text-brown-dark font-semibold"
                : "border-transparent text-brown/50 hover:text-brown-dark"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "termekek" ? <TermekekTab /> : <KategoriakTab />}
    </div>
  );
}
