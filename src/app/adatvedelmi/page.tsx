import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató - Kata Kenyere",
  robots: { index: false, follow: false },
};

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "divider" };

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ type: "divider" });
      i += 1;
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i]
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((cell) => cell.trim());
        const isSeparator = row.every((cell) => /^:?-{2,}:?$/.test(cell));
        if (!isSeparator) rows.push(row);
        i += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        /^-{3,}$/.test(current) ||
        /^(#{1,4})\s+/.test(current) ||
        current.startsWith("|") ||
        current.startsWith("- ")
      ) {
        break;
      }
      paragraph.push(current);
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const token = match[0];
    const key = `${match.index}-${token}`;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-[#2C1F14]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        nodes.push(
          <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#9c6f3a]">
            {link[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function Heading({ level, children }: { level: number; children: ReactNode }) {
  if (level === 1) {
    return <h1 className="mb-6 font-serif text-[2.4rem] leading-[1.1] text-[#2C1F14]">{children}</h1>;
  }
  if (level === 2) {
    return <h2 className="mb-4 mt-12 font-serif text-[1.5rem] leading-snug text-[#2C1F14] first:mt-0">{children}</h2>;
  }
  if (level === 3) {
    return <h3 className="mb-3 mt-8 font-sans text-[0.95rem] font-semibold text-[#2C1F14]">{children}</h3>;
  }
  return <h4 className="mb-2 mt-6 font-sans text-[0.85rem] font-semibold uppercase tracking-[0.08em] text-[#9c6f3a]">{children}</h4>;
}

function MarkdownTable({ rows }: { rows: string[][] }) {
  const hasHeader = rows.length > 1 && rows[0].some(Boolean);
  const bodyRows = hasHeader ? rows.slice(1) : rows;

  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-[rgba(156,111,58,0.2)]">
      <table className="w-full min-w-[520px] border-collapse text-left font-sans text-[0.84rem] leading-relaxed">
        {hasHeader && (
          <thead className="bg-[rgba(156,111,58,0.08)] text-[#2C1F14]">
            <tr>
              {rows[0].map((cell, i) => (
                <th key={i} className="border-b border-[rgba(156,111,58,0.16)] px-4 py-3 font-semibold">
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-[rgba(156,111,58,0.12)] last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-top text-[#6b5a47] first:text-[#2C1F14]">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return <Heading level={block.level}>{renderInline(block.text)}</Heading>;
    case "paragraph":
      return <p className="mb-4 font-sans text-[0.88rem] leading-[1.85] text-[#6b5a47]">{renderInline(block.text)}</p>;
    case "list":
      return (
        <ul className="mb-4 space-y-1.5 pl-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 font-sans text-[0.88rem] leading-[1.85] text-[#6b5a47]">
              <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-[#9c6f3a]" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return <MarkdownTable rows={block.rows} />;
    case "divider":
      return <hr className="my-10 border-[rgba(156,111,58,0.2)]" />;
    default:
      return null;
  }
}

export default function AdatvedelmiPage() {
  const markdown = fs.readFileSync(path.join(process.cwd(), "adatvedelmi-nyilatkozat.md"), "utf8");
  const blocks = parseMarkdown(markdown);

  return (
    <div className="min-h-screen bg-[#F4F2EC] text-[#2C1F14]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 md:px-8">
        <p className="mb-3 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
          Jogi információk
        </p>
        {blocks.map((block, index) => (
          <MarkdownBlock key={index} block={block} />
        ))}
      </main>
    </div>
  );
}
