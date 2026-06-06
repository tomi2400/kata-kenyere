export type ParsedProductDetails = {
  leiras: string;
  hozzavalok: string;
  allergenek: string;
};

function normalizeInlineText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function getMetadataLine(line: string) {
  const ingredientMatch = line.match(
    /^\s*(?:(?:összet(?:e)?v[őö]k)|hozzávalók)\s*:\s*(.*)$/i
  );
  if (ingredientMatch) {
    return { type: "hozzavalok" as const, value: ingredientMatch[1] };
  }

  const allergenMatch = line.match(/^\s*allergének\s*:\s*(.*)$/i);
  if (allergenMatch) {
    return { type: "allergenek" as const, value: allergenMatch[1] };
  }

  return null;
}

export function parseProductDetails(value: string | null | undefined): ParsedProductDetails {
  const lines = (value ?? "").replace(/\r\n/g, "\n").split("\n");
  const firstMetadataIndex = lines.findIndex((line) => getMetadataLine(line) !== null);

  if (firstMetadataIndex === -1) {
    return {
      leiras: lines.join("\n").trim(),
      hozzavalok: "",
      allergenek: "",
    };
  }

  const details = {
    hozzavalok: [] as string[],
    allergenek: [] as string[],
  };
  const descriptionLines = lines.slice(0, firstMetadataIndex);
  const metadataLines = lines.slice(firstMetadataIndex);
  const separatorIndex = metadataLines.findIndex((line) => line.trim() === "");
  const legacyDescriptionIndex = separatorIndex === -1
    ? metadataLines.reduce((lastIndex, line, index) => {
        return !getMetadataLine(line) && line.trim() ? index : lastIndex;
      }, -1)
    : -1;
  const metadataEnd = separatorIndex === -1
    ? (legacyDescriptionIndex === -1 ? metadataLines.length : legacyDescriptionIndex)
    : separatorIndex;
  let activeField: keyof typeof details | null = null;

  for (const line of metadataLines.slice(0, metadataEnd)) {
    const metadata = getMetadataLine(line);
    if (metadata) {
      activeField = metadata.type;
      if (metadata.value.trim()) details[activeField].push(metadata.value);
    } else if (activeField && line.trim()) {
      details[activeField].push(line);
    }
  }

  const descriptionStart = separatorIndex === -1
    ? (legacyDescriptionIndex === -1 ? metadataLines.length : legacyDescriptionIndex)
    : separatorIndex + 1;

  return {
    leiras: [...descriptionLines, ...metadataLines.slice(descriptionStart)].join("\n").trim(),
    hozzavalok: normalizeInlineText(details.hozzavalok.join(" ")),
    allergenek: normalizeInlineText(details.allergenek.join(" ")),
  };
}

export function serializeProductDetails(details: ParsedProductDetails) {
  const metadata = [
    details.hozzavalok ? `Összetevők: ${normalizeInlineText(details.hozzavalok)}` : "",
    details.allergenek ? `Allergének: ${normalizeInlineText(details.allergenek)}` : "",
  ].filter(Boolean);
  const leiras = details.leiras.trim();

  if (metadata.length > 0 && leiras) {
    return `${metadata.join("\n")}\n\n${leiras}`;
  }

  return metadata.join("\n") || leiras;
}

export function withParsedProductDetails<T extends { leiras?: string | null }>(product: T) {
  const details = parseProductDetails(product.leiras);

  return {
    ...product,
    ...details,
  };
}
