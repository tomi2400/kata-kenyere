import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Impresszum – Kata Kenyere",
  robots: { index: false, follow: false },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[rgba(156,111,58,0.15)] py-4 sm:grid-cols-[220px_1fr]">
      <dt className="font-sans text-[0.8rem] text-[#9c6f3a]">{label}</dt>
      <dd className="font-sans text-[0.88rem] leading-relaxed text-[#2C1F14]">{value}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
        {title}
      </h2>
      <dl className="divide-y-0">{children}</dl>
    </section>
  );
}

export default function ImpresszumPage() {
  return (
    <div className="min-h-screen bg-[#F4F2EC] text-[#2C1F14]">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-16 md:px-8">
        <div className="mb-10">
          <p className="mb-3 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
            Jogi információk
          </p>
          <h1 className="font-serif text-[2.4rem] leading-[1.1] text-[#2C1F14]">Impresszum</h1>
        </div>

        <Block title="Üzemeltető">
          <Row label="Teljes név" value="Kata Kenyere Korlátolt Felelősségű Társaság" />
          <Row label="Rövidített név" value="Kata Kenyere Kft." />
          <Row label="Székhely" value="7634 Pécs, Kovács Béla utca 33." />
          <Row label="Postacím" value="7634 Pécs, Kovács Béla utca 33." />
          <Row label="Cégjegyzékszám" value="02-09-088754" />
          <Row label="Nyilvántartó törvényszék" value="Pécsi Törvényszék Cégbírósága" />
          <Row label="Adószám" value="32720154-2-02" />
          <Row label="E-mail" value={<a href="mailto:kataleskovar@gmail.com" className="underline underline-offset-2 hover:text-[#9c6f3a]">kataleskovar@gmail.com</a>} />
          <Row label="Telefon" value={<a href="tel:+36309362058" className="underline underline-offset-2 hover:text-[#9c6f3a]">+36 30 936 2058</a>} />
          <Row label="Képviselő" value="Leskovár Kata, ügyvezető" />
        </Block>

        <Block title="Tárhelyszolgáltató">
          <Row label="Neve" value="Vercel Inc." />
          <Row label="Székhelye" value="440 N Barranca Ave #4133, Covina, CA 91723, USA" />
          <Row label="Elérhetősége" value={<a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#9c6f3a]">vercel.com</a>} />
        </Block>

        <Block title="Domain regisztrátor">
          <Row label="Neve" value="Rackhost Informatikai Zártkörűen Működő Részvénytársaság" />
          <Row label="Székhelye" value="6722 Szeged, Tisza Lajos körút 41." />
          <Row label="Cégjegyzékszám" value="06-10-000489" />
          <Row label="Elérhetősége" value={<a href="mailto:info@rackhost.hu" className="underline underline-offset-2 hover:text-[#9c6f3a]">info@rackhost.hu</a>} />
        </Block>
      </main>
    </div>
  );
}
