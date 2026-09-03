import type { ParsedBlock, ParsedTable } from "./parser";

const FIGURE_CAPTION =
  /^(?:figure|fig\.?)\s*([0-9]+(?:\.[0-9]+)*)\s*[:.\-–—]?\s*(.*)$/i;
const TABLE_CAPTION =
  /^(?:table)\s*([0-9]+(?:\.[0-9]+)*)\s*[:.\-–—]?\s*(.*)$/i;
const SECTION_HEADING =
  /^(?:section|clause|part)\s+([0-9]+(?:\.[0-9]+)*)\b(.*)$/i;
const NUMBERED_HEADING = /^([0-9]+(?:\.[0-9]+){0,4})\s+([A-Z].{2,120})$/;
const NUMBERED_CLAUSE = /^([0-9]+(?:\.[0-9]+){1,4})\b(?:\s+(.{0,160}))?$/;
const NOTE_LINE = /^(?:note|notes|nb)[:.\s]/i;
const EQUATION_LINE =
  /^(?:[a-z]'?\s*=\s*.{3,}|t\s*=\s*.+|[\w']+\s*=\s*[0-9(].+)$/i;

function detectTableBlock(lines: string[]): ParsedTable | null {
  if (lines.length < 2) return null;
  const delimiter = lines.every((line) => line.includes("|"))
    ? "|"
    : lines.every((line) => line.includes("\t"))
      ? "\t"
      : null;
  if (!delimiter) return null;
  const cells = lines.map((line) =>
    line
      .split(delimiter)
      .map((cell) => cell.trim())
      .filter((cell, index, arr) => !(delimiter === "|" && (index === 0 || index === arr.length - 1) && cell === "")),
  );
  if (cells.some((row) => row.length < 2)) return null;
  const [headers, ...rows] = cells;
  return { headers, rows };
}

function isStandardRunningHeader(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 64) return false;
  const normalized = trimmed.replace(/[\u2010-\u2015]/g, "-");
  if (/^(?:AS\s*\/\s*NZS|ASNZS|AS|NZS|ISO)[\s._-]*\d+/i.test(normalized)) return true;
  return /^\d+\s+(?:AS\s*\/\s*NZS|AS|NZS|ISO)\b/i.test(normalized);
}

function isWrappedHeadingFragment(line: string): boolean {
  return /^(AND|OR|OF|THE|FOR|TO|WITH|IN)\b/i.test(line.trim());
}

function normalizeSpacedHeading(line: string): string {
  return line.trim().replace(/^(\d+(?:\.\d+)*)\s*\.\s+/, "$1 ");
}

function isHeadingLine(line: string): boolean {
  const trimmed = normalizeSpacedHeading(line);
  if (!trimmed || trimmed.length > 160) return false;
  if (isStandardRunningHeader(trimmed) || isWrappedHeadingFragment(trimmed)) return false;
  if (FIGURE_CAPTION.test(trimmed) || TABLE_CAPTION.test(trimmed)) return false;
  if (SECTION_HEADING.test(trimmed) || NUMBERED_HEADING.test(trimmed) || NUMBERED_CLAUSE.test(trimmed)) {
    return !trimmed.endsWith(".") || trimmed.length <= 80;
  }
  return trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && trimmed.length <= 80 && !trimmed.endsWith(".");
}

function isHeading(lines: string[]): boolean {
  if (lines.length !== 1) return false;
  return isHeadingLine(lines[0] ?? "");
}

function clauseLabel(text: string): string | undefined {
  const line = normalizeSpacedHeading(text.trim().split("\n")[0] ?? "");
  if (isStandardRunningHeader(line)) return undefined;
  const numbered = line.match(NUMBERED_CLAUSE) ?? line.match(NUMBERED_HEADING) ?? line.match(SECTION_HEADING);
  if (!numbered) return undefined;
  const number = numbered[1];
  const rest = (numbered[2] ?? "").trim();
  if (rest && /^(?:AS\s*\/\s*NZS|AS|NZS|ISO)\b/i.test(rest)) return undefined;
  return rest && rest.length <= 80 ? `${number} ${rest}`.trim() : number;
}

function splitEngineeringUnits(pageText: string): string[] {
  const normalized = pageText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const byBlank = normalized.split(/\n{2,}/);
  const units: string[] = [];
  for (const raw of byBlank) {
    const lines = raw.split("\n");
    let buffer: string[] = [];
    const flush = () => {
      const text = buffer.join("\n").trim();
      if (text) units.push(text);
      buffer = [];
    };
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (isHeadingLine(trimmed) || FIGURE_CAPTION.test(trimmed) || TABLE_CAPTION.test(trimmed))) {
        flush();
        units.push(trimmed);
        continue;
      }
      buffer.push(line);
    }
    flush();
  }
  return units;
}

function figureMatch(text: string): { number: string; caption: string } | null {
  const match = text.trim().match(FIGURE_CAPTION);
  if (!match) return null;
  return { number: match[1] ?? "", caption: (match[2] ?? "").trim() };
}

function tableCaptionMatch(text: string): { number: string; caption: string } | null {
  const match = text.trim().match(TABLE_CAPTION);
  if (!match) return null;
  return { number: match[1] ?? "", caption: (match[2] ?? "").trim() };
}

function isEquation(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length > 240) return false;
  return EQUATION_LINE.test(trimmed) || /[=≈≤≥]/.test(trimmed) && trimmed.split("\n").length <= 3;
}

/**
 * Engineering-aware page segmentation. Preserves clause/figure/table/note/equation
 * boundaries instead of splitting on character count.
 */
export function segmentEngineeringPage(pageText: string, pageNumber: number): ParsedBlock[] {
  const rawBlocks = splitEngineeringUnits(pageText);
  const classified: ParsedBlock[] = [];
  let currentSection: string | undefined;

  for (const raw of rawBlocks) {
    const lines = raw.split(/\n/).map((line) => line.trimEnd());
    const table = detectTableBlock(lines);
    if (table) {
      classified.push({
        type: "table",
        text: raw,
        page: pageNumber,
        sectionPath: currentSection,
        table: { ...table, page: pageNumber, title: currentSection },
        confidence: 0.9,
      });
      continue;
    }

    const figure = figureMatch(raw);
    if (figure) {
      classified.push({
        type: "caption",
        text: raw,
        page: pageNumber,
        sectionPath: currentSection ?? `Figure ${figure.number}`,
        confidence: 0.8,
        offsets: undefined,
      });
      continue;
    }

    const tableCaption = tableCaptionMatch(raw);
    if (tableCaption) {
      currentSection = `Table ${tableCaption.number}${tableCaption.caption ? ` ${tableCaption.caption}` : ""}`;
      classified.push({
        type: "caption",
        text: raw,
        page: pageNumber,
        sectionPath: currentSection,
        confidence: 0.85,
      });
      continue;
    }

    if (NOTE_LINE.test(raw)) {
      classified.push({
        type: "paragraph",
        text: raw,
        page: pageNumber,
        sectionPath: currentSection ? `${currentSection} / Note` : "Note",
        confidence: 0.85,
      });
      continue;
    }

    if (isEquation(raw)) {
      classified.push({
        type: "other",
        text: raw,
        page: pageNumber,
        sectionPath: currentSection,
        confidence: 0.8,
      });
      continue;
    }

    if (isHeading(lines)) {
      currentSection = clauseLabel(raw) ?? (isStandardRunningHeader(lines[0] ?? "") ? currentSection : normalizeSpacedHeading(lines[0] ?? ""));
      classified.push({
        type: "heading",
        text: raw,
        page: pageNumber,
        sectionPath: currentSection,
        confidence: 0.9,
      });
      continue;
    }

    const paragraphSection = clauseLabel(raw) ?? currentSection;
    if (clauseLabel(raw)) currentSection = paragraphSection;
    classified.push({
      type: "paragraph",
      text: raw,
      page: pageNumber,
      sectionPath: paragraphSection,
      confidence: 0.85,
    });
  }

  return mergeFigureUnits(classified, pageNumber);
}

function mergeFigureUnits(blocks: ParsedBlock[], pageNumber: number): ParsedBlock[] {
  const merged: ParsedBlock[] = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]!;
    const figure = figureMatch(block.text);
    if (!figure || block.type !== "caption") {
      merged.push(block);
      continue;
    }

    const nearby: string[] = [];
    const consume = (candidate: ParsedBlock | undefined) => {
      if (!candidate) return false;
      if (candidate.type === "heading") return false;
      if (candidate.type === "table") return false;
      if (figureMatch(candidate.text)) return false;
      nearby.push(candidate.text);
      return true;
    };

    let look = i + 1;
    let consumed = 0;
    while (look < blocks.length && consumed < 3) {
      const next = blocks[look];
      if (!consume(next)) break;
      look += 1;
      consumed += 1;
      if (next && isEquation(next.text)) break;
    }

    const prev = merged[merged.length - 1];
    const prevNearby = prev && prev.type !== "heading" && prev.type !== "table" && !figureMatch(prev.text)
      ? prev.text
      : "";

    merged.push({
      type: "image",
      text: [
        block.text,
        prevNearby ? `Nearby text: ${prevNearby}` : "",
        ...nearby,
      ].filter(Boolean).join("\n\n"),
      page: pageNumber,
      sectionPath: `Figure ${figure.number}${figure.caption ? ` ${figure.caption}` : ""}`,
      confidence: 0.55,
    });
    i = look - 1;
  }
  return merged;
}

export function extractStandardReferences(text: string): string[] {
  const matches = text.match(/\b(?:AS\/NZS|AS|NZS|ISO)\s*\d+(?:\.\d+)*/gi) ?? [];
  return [...new Set(matches.map((value) => value.replace(/\s+/g, " ").toUpperCase()))];
}
