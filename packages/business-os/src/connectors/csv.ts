import { sanitizeSpreadsheetCell } from "./security";

export const CSV_MAX_BYTES = 1_000_000;
export const CSV_MAX_ROWS = 10_000;
export const CSV_SUPPORTED_ENTITIES = ["customer", "contact", "lead", "opportunity", "work"] as const;
export type CsvSupportedEntity = (typeof CSV_SUPPORTED_ENTITIES)[number];

const REQUIRED_COLUMNS: Record<CsvSupportedEntity, readonly string[]> = {
  customer: ["name"],
  contact: ["name"],
  lead: ["name"],
  opportunity: ["name"],
  work: ["name"],
};

export type CsvIssue = { row: number; column?: string; code: string; message: string };

export type CsvPreview = {
  filename: string;
  entityType: CsvSupportedEntity;
  headers: string[];
  mapping: Record<string, string>;
  mappingVersion: string;
  rows: Array<Record<string, string>>;
  displayRows: Array<Record<string, string>>;
  issues: CsvIssue[];
  duplicates: number;
  conflicts: number;
  validCount: number;
  rejectedCount: number;
  contentHash: string;
};

function isBinaryWorkbook(filename: string, content: string): boolean {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".xlsm") || lower.endsWith(".xlsb") || lower.endsWith(".xls")) return true;
  if (lower.endsWith(".xlsx") && (content.includes("vbaProject.bin") || content.includes("xl/macrosheets"))) {
    return true;
  }
  if (content.startsWith("PK") && (lower.endsWith(".xlsx") || lower.endsWith(".xlsm"))) return true;
  if (content.includes("\u0000") && !content.includes(",")) return true;
  return false;
}

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === "," || ch === "\t") {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function hash(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i += 1) h = (h * 31 + content.charCodeAt(i)) | 0;
  return `csv-${(h >>> 0).toString(16)}`;
}

export function previewCsv(input: {
  filename: string;
  content: string;
  entityType: string;
  mapping?: Record<string, string>;
}): CsvPreview {
  if (!input.filename?.trim()) throw new Error("import_validation_failed");
  if (typeof input.content !== "string") throw new Error("import_validation_failed");
  if (new TextEncoder().encode(input.content).length > CSV_MAX_BYTES) throw new Error("file_too_large");
  if (isBinaryWorkbook(input.filename, input.content)) throw new Error("macro_content_forbidden");
  if (!(CSV_SUPPORTED_ENTITIES as readonly string[]).includes(input.entityType)) {
    throw new Error("unsupported_import_type");
  }
  const entityType = input.entityType as CsvSupportedEntity;
  const normalized = input.content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!normalized.trim()) throw new Error("import_validation_failed");
  const lines = normalized.split("\n").filter((line) => line.length > 0);
  if (lines.length < 2) throw new Error("import_validation_failed");
  if (lines.length - 1 > CSV_MAX_ROWS) throw new Error("file_too_large");
  const headers = parseLine(lines[0]).map((header) => header.toLowerCase());
  if (headers.some((header) => !header) || new Set(headers).size !== headers.length) {
    throw new Error("import_validation_failed");
  }
  const mapping = input.mapping ?? Object.fromEntries(headers.map((header) => [header, header]));
  const required = REQUIRED_COLUMNS[entityType];
  for (const column of required) {
    if (!Object.values(mapping).includes(column) && !headers.includes(column)) {
      throw new Error("import_validation_failed");
    }
  }
  const issues: CsvIssue[] = [];
  const rows: Array<Record<string, string>> = [];
  const displayRows: Array<Record<string, string>> = [];
  const seen = new Map<string, number>();
  let duplicates = 0;
  let conflicts = 0;

  for (let i = 1; i < lines.length; i += 1) {
    const cells = parseLine(lines[i]);
    const raw: Record<string, string> = {};
    const display: Record<string, string> = {};
    headers.forEach((header, idx) => {
      const value = cells[idx] ?? "";
      if (/^[=+\-@\t\r]/.test(value)) {
        issues.push({
          row: i,
          column: header,
          code: "formula_injection_forbidden",
          message: "Spreadsheet formula tokens are rejected fail-closed",
        });
      }
      raw[mapping[header] ?? header] = value;
      display[mapping[header] ?? header] = sanitizeSpreadsheetCell(value);
    });
    const name = raw.name?.trim() ?? "";
    if (!name) {
      issues.push({ row: i, column: "name", code: "import_validation_failed", message: "Name is required" });
    }
    const externalId = raw.external_id || raw.externalId || "";
    const key = `${entityType}:${externalId || name.toLowerCase()}`;
    const prior = seen.get(key);
    if (prior != null) {
      duplicates += 1;
      issues.push({ row: i, code: "duplicate_external_record", message: `Duplicate of row ${prior}` });
    } else {
      seen.set(key, i);
    }
    if (raw.canonical_id && raw.canonical_id !== externalId && name) {
      conflicts += 1;
      issues.push({
        row: i,
        code: "mapping_conflict",
        message: "External row conflicts with an existing canonical identifier and will not overwrite it",
      });
    }
    rows.push(raw);
    displayRows.push(display);
  }

  const rejectedCount = issues.filter((issue) =>
    ["formula_injection_forbidden", "import_validation_failed", "macro_content_forbidden"].includes(issue.code),
  ).length;
  const formulaBlocked = issues.some((issue) => issue.code === "formula_injection_forbidden");
  if (formulaBlocked) throw new Error("formula_injection_forbidden");

  return {
    filename: input.filename,
    entityType,
    headers,
    mapping,
    mappingVersion: "bos12.csv.map.v1",
    rows,
    displayRows,
    issues,
    duplicates,
    conflicts,
    validCount: rows.length - issues.filter((issue) => issue.code === "import_validation_failed").length,
    rejectedCount,
    contentHash: hash(normalized),
  };
}
